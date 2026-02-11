/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

let pdfParse;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  pdfParse = require('pdf-parse');
} catch (error) {
  console.error('Missing dependency: pdf-parse. Run: npm install pdf-parse');
  process.exit(1);
}

let admin;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  admin = require('firebase-admin');
} catch (error) {
  console.error('Missing dependency: firebase-admin. Run: npm install firebase-admin');
  process.exit(1);
}

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    file: null,
    projectId: null,
    knowledgeBaseId: null,
    dryRun: false,
    apply: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--file') {
      options.file = args[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--projectId') {
      options.projectId = args[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--knowledgeBaseId') {
      options.knowledgeBaseId = args[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--dryRun') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--apply') {
      options.apply = true;
      continue;
    }
  }

  if (!options.file) {
    throw new Error('Missing --file "PLAN COMPTABLE MAURITANIEN.pdf"');
  }
  if (!options.projectId) {
    throw new Error('Missing --projectId');
  }

  if (!options.knowledgeBaseId) {
    throw new Error('Missing --knowledgeBaseId');
  }

  if (!options.dryRun && !options.apply) {
    options.dryRun = true;
  }

  return options;
};

const normalizeLine = (line) => line.replace(/\s+/g, ' ').trim();

const extractAccounts = (text) => {
  const lines = text.split('\n').map(normalizeLine).filter(Boolean);
  const map = new Map();

  for (const line of lines) {
    const match =
      line.match(/^(\d{1,9})\s+(.+)$/) ||
      line.match(/^(\d{1,9})\s*[-–—]\s*(.+)$/);

    if (!match) continue;

    const code = match[1];
    const label = match[2].trim();

    if (!label || /^\d+$/.test(label)) continue;
    if (!/^[1-7]/.test(code)) continue;

    if (!map.has(code)) {
      map.set(code, label);
    }
  }

  return Array.from(map.entries()).map(([code, label]) => ({ code, label }));
};

const buildParentMap = (codes) => {
  const codeSet = new Set(codes);
  const parentMap = new Map();

  codes.forEach((code) => {
    let parent = null;
    for (let i = code.length - 1; i >= 1; i -= 1) {
      const prefix = code.slice(0, i);
      if (codeSet.has(prefix)) {
        parent = prefix;
        break;
      }
    }
    if (parent) {
      parentMap.set(code, parent);
    }
  });

  return parentMap;
};

const buildTree = (accounts, parentMap) => {
  const nodes = new Map();

  accounts.forEach((account) => {
    nodes.set(account.code, { ...account, children: [] });
  });

  const roots = [];
  nodes.forEach((node, code) => {
    const parent = parentMap.get(code);
    if (parent && nodes.has(parent)) {
      nodes.get(parent).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRecursive = (items) => {
    items.sort((a, b) => {
      if (a.code.length !== b.code.length) return a.code.length - b.code.length;
      return a.code.localeCompare(b.code);
    });
    items.forEach((child) => sortRecursive(child.children || []));
  };

  sortRecursive(roots);

  return roots;
};

const buildTemplate = (accounts) => {
  const bsAccounts = accounts.filter((a) => a.type === 'BS');
  const isAccounts = accounts.filter((a) => a.type === 'IS');

  const bsParentMap = buildParentMap(bsAccounts.map((a) => a.code));
  const isParentMap = buildParentMap(isAccounts.map((a) => a.code));

  const bsTree = buildTree(bsAccounts, bsParentMap);
  const isTree = buildTree(isAccounts, isParentMap);

  const actif = bsTree.filter((node) => Number(node.code[0]) <= 3);
  const passif = bsTree.filter((node) => Number(node.code[0]) >= 4);

  const charges = isTree.filter((node) => node.code[0] === '6');
  const produits = isTree.filter((node) => node.code[0] === '7');

  return {
    bs: {
      label: 'Balance Sheet',
      children: [
        { label: 'ACTIF', children: actif },
        { label: 'PASSIF', children: passif },
      ],
    },
    is: {
      label: 'Income Statement',
      children: [
        { label: 'CHARGES', children: charges },
        { label: 'PRODUITS', children: produits },
      ],
    },
  };
};

const buildRules = (accounts) =>
  accounts
    .map((account) => ({
      prefix: account.code,
      targetCode: account.code,
      label: account.label,
      type: account.type,
    }))
    .sort((a, b) => b.prefix.length - a.prefix.length);

const chunk = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const countNodes = (node) => {
  if (!node) return 0;
  if (Array.isArray(node)) {
    return node.reduce((sum, item) => sum + countNodes(item), 0);
  }
  const children = node.children || [];
  return 1 + children.reduce((sum, item) => sum + countNodes(item), 0);
};

const main = async () => {
  const options = parseArgs();
  const filePath = path.resolve(options.file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set.');
  }

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }

  const buffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(buffer);
  const accountsRaw = extractAccounts(pdfData.text);

  const accounts = accountsRaw
    .map((entry) => {
      const classNumber = Number(entry.code[0]);
      if (Number.isNaN(classNumber) || classNumber < 1 || classNumber > 7) {
        return null;
      }
      return {
        code: entry.code,
        label: entry.label,
        class: classNumber,
        type: classNumber <= 5 ? 'BS' : 'IS',
      };
    })
    .filter(Boolean);

  const parentMap = buildParentMap(accounts.map((a) => a.code));
  const accountsWithParent = accounts.map((account) => ({
    ...account,
    parentCode: parentMap.get(account.code) || null,
  }));

  const template = buildTemplate(accountsWithParent);
  const rules = buildRules(accountsWithParent);

  const templateId = options.knowledgeBaseId || 'pc-mauritanien';
  const summary = {
    accounts: accountsWithParent.length,
    rules: rules.length,
    bsNodes: countNodes(template.bs.children),
    isNodes: countNodes(template.is.children),
  };

  console.log('Parsed accounts:', summary.accounts);
  console.log('BS nodes:', summary.bsNodes);
  console.log('IS nodes:', summary.isNodes);
  console.log('Rules generated:', summary.rules);
  console.log('Sample mappings:', rules.slice(0, 5));

  if (options.dryRun) {
    console.log('Dry run mode: no Firestore writes.');
    return;
  }

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  const accountChunks = chunk(accountsWithParent, 400);
  for (const group of accountChunks) {
    const batch = db.batch();
    group.forEach((account) => {
      batch.set(
        db.collection('chart_of_accounts').doc(account.code),
        {
          code: account.code,
          label: account.label,
          class: account.class,
          type: account.type,
          parentCode: account.parentCode,
          updatedAt: now,
        },
        { merge: true }
      );
    });
    await batch.commit();
  }

  await db
    .collection('fs_templates')
    .doc(templateId)
    .set(
      {
        name: 'PC Mauritanien',
        projectId: options.projectId,
        tree: template,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

  await db
    .collection('fs_rules')
    .doc(templateId)
    .set(
      {
        templateId,
        projectId: options.projectId,
        rules,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

  console.log('Firestore write complete.');
};

main().catch((error) => {
  console.error('Script failed:', error.message);
  process.exit(1);
});
