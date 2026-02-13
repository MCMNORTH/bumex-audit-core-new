const fs = require("fs");

const inputIndex = process.argv.indexOf("--input");
const outputIndex = process.argv.indexOf("--output");

const inputPath =
  inputIndex !== -1
    ? process.argv[inputIndex + 1]
    : "C:\\Users\\MohamedCheikhMohamed\\Downloads\\bumex-audit-core-main\\plan_comptable_mauritanien_new.txt";

const outputPath =
  outputIndex !== -1
    ? process.argv[outputIndex + 1]
    : "C:\\Users\\MohamedCheikhMohamed\\Downloads\\bumex-audit-core-main\\src\\plan_comptable_mauritanien.json";

const raw = fs.readFileSync(inputPath);

function decodeBest(buf) {
  const encodings = ["utf8", "cp1252", "latin1"];
  for (const enc of encodings) {
    try {
      const text = buf.toString(enc);
      if (text.includes("Ã") || text.includes("â€™") || text.includes("â€œ")) {
        return Buffer.from(text, "latin1").toString("utf8");
      }
      return text;
    } catch {}
  }
  return buf.toString("utf8");
}

function fixMojibake(value) {
  try {
    const fixed = Buffer.from(value, "latin1").toString("utf8");
    if (
      (value.includes("Ã") && !fixed.includes("Ã")) ||
      (value.includes("â€™") && !fixed.includes("â€™"))
    ) {
      return fixed;
    }
    return value.includes("�") && !fixed.includes("�") ? fixed : value;
  } catch {
    return value;
  }
}

function fixMojibake(value) {
  const replacements = {
    "â€™": "’",
    "â€œ": "“",
    "â€�": "”",
    "â€“": "–",
    "â€”": "—",
    "â€¦": "…",
    "Ã©": "é",
    "Ã¨": "è",
    "Ãª": "ê",
    "Ã«": "ë",
    "Ãà": "à",
    "Ãâ": "â",
    "Ãä": "ä",
    "Ãî": "î",
    "Ãï": "ï",
    "Ãô": "ô",
    "Ãö": "ö",
    "Ãû": "û",
    "Ãü": "ü",
    "Ãù": "ù",
    "Ãç": "ç",
    "Ã‰": "É",
    "Ãˆ": "È",
    "ÃŠ": "Ê",
    "Ã€": "À",
    "Ã‚": "Â",
    "ÃŽ": "Î",
    "Ã”": "Ô",
    "Ã›": "Û",
    "Ãœ": "Ü",
    "Ã‡": "Ç",
  };
  let fixed = value;
  for (const [bad, good] of Object.entries(replacements)) {
    fixed = fixed.split(bad).join(good);
  }
  fixed = fixed.replace(/Ã\s+(?=[A-Za-zÀ-ÿ])/g, "à ");
  try {
    const looksMojibake = /Ã|â€™|â€œ|â€�|ï¿½/.test(fixed);
    const decoded = Buffer.from(fixed, "latin1").toString("utf8");
    if (looksMojibake && !/Ã|â€™|â€œ|â€�|ï¿½/.test(decoded)) {
      return decoded;
    }
  } catch {}
  return fixed;
}

const text = decodeBest(raw);
const lines = text
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

let sectionCode = "";
let sectionLabel = "";
const items = [];
const seen = new Set();

const sectionHeaderRe = /^(\d{2})\s*[.]?\s+(.+?)\s*$/;
const accountRe =
  /(?:(?:\(\s*0\s*\))\s*)?(\d{2,6})\s+([^\d]+?)(?=(?:\(\s*0\s*\))?\s*\d{2,6}\s+|$)/g;

for (const rawLine of lines) {
  const line = rawLine.replace(/\s+/g, " ");

  if (line.toLowerCase().startsWith("2.2") || line.toLowerCase().startsWith("2.1")) {
    continue;
  }

  const sec = line.match(sectionHeaderRe);
  if (sec) {
    const code = sec[1];
    const label = sec[2];
    if (!label.toLowerCase().startsWith("classe")) {
      sectionCode = code;
      sectionLabel = fixMojibake(label).trim();
    }
    continue;
  }

  const matches = [...line.matchAll(accountRe)];
  if (!matches.length) continue;

  for (const match of matches) {
    const code = match[1];
    const isZeroPrefixed = match[0].includes("(0)");
    let label = fixMojibake(match[2]).trim().replace(/\.$/, "");
    if (!label) continue;
    if (code.length === 2 && sectionCode === code) continue;

    let classe;
    if (code.startsWith("0") && code.length >= 2 && "678".includes(code[1])) {
      classe = Number(code[1]);
    } else {
      classe = Number(code[0]);
    }

    if (seen.has(code)) continue;
    seen.add(code);

    items.push({
      classe,
      section_code: sectionCode,
      section_label: sectionLabel,
      account: code,
      label,
      zero_prefix: isZeroPrefixed,
    });
  }
}

fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), "utf8");
console.log(`OK: ${items.length} comptes écrits dans ${outputPath}`);
