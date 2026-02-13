/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const admin = require("firebase-admin");

const getArg = (name) => {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || !process.argv[idx + 1]) return null;
  return process.argv[idx + 1];
};

const excelPath = getArg("--file");
const projectId = getArg("--projectId");

if (!excelPath || !projectId) {
  console.error("Usage: node scripts/parse_balances.cjs --file <path.xlsm> --projectId <projectId>");
  process.exit(1);
}

if (!fs.existsSync(excelPath)) {
  console.error("File not found:", excelPath);
  process.exit(1);
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS to a valid service account JSON file.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const SHEET_N = "Inserer BG N";
const SHEET_N1 = "Inserer BG N-1";

const normalize = (name) => name.trim().toLowerCase();
const findSheet = (sheetNames, expected) => {
  if (sheetNames.includes(expected)) return expected;
  const target = normalize(expected);
  return sheetNames.find((n) => normalize(n) === target) || null;
};

const parseAmount = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const raw = String(value).trim();
  if (!raw) return null;
  const negative = raw.startsWith("(") && raw.endsWith(")");
  const cleaned = raw
    .replace(/[()]/g, "")
    .replace(/\s+/g, "")
    .replace(/\u00A0/g, "")
    .replace(",", ".");
  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return null;
  return negative ? -parsed : parsed;
};

const parseRows = (sheet) => {
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: 5,
    raw: true,
    defval: "",
  });

  const parsed = [];
  for (const row of rows) {
    const account = String(row[0] ?? "").trim();
    const label = String(row[1] ?? "").trim();
    const debit = parseAmount(row[2]);
    const credit = parseAmount(row[3]);
    const hasDebit = debit !== null;
    const hasCredit = credit !== null;
    const hasAmount = hasDebit || hasCredit;
    let balanceNumber = null;
    if (hasAmount) {
      if (hasDebit && !hasCredit) {
        // File uses a single signed amount column.
        balanceNumber = debit;
      } else if (!hasDebit && hasCredit) {
        balanceNumber = -credit;
      } else {
        balanceNumber = (debit ?? 0) - (credit ?? 0);
      }
    }

    const isEmptyRow = account === "" && label === "" && !hasAmount;
    if (isEmptyRow) continue;
    if (!account) continue;

    parsed.push({
      account,
      label,
      balance: Number.isFinite(balanceNumber) ? balanceNumber : 0,
    });
  }
  return parsed;
};

const workbook = XLSX.readFile(path.resolve(excelPath), { raw: true, cellDates: true });
console.log("SHEETS:", workbook.SheetNames);

const resolvedN = findSheet(workbook.SheetNames, SHEET_N) || workbook.SheetNames[1];
const resolvedN1 = findSheet(workbook.SheetNames, SHEET_N1) || workbook.SheetNames[2];

if (!resolvedN || !resolvedN1) {
  console.error("Missing required sheets. Available:", workbook.SheetNames);
  process.exit(1);
}

const balanceN = parseRows(workbook.Sheets[resolvedN]);
const balanceN1 = parseRows(workbook.Sheets[resolvedN1]);

console.log("balanceN rows:", balanceN.length);
console.log("balanceN1 rows:", balanceN1.length);

const docRef = admin.firestore().doc(`projects/${projectId}/knowledge_base/balances`);
docRef
  .set(
    {
      status: "done",
      balanceN,
      balanceN1,
      errorMessage: "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
  .then(() => {
    console.log("Firestore updated successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Firestore write failed:", err.message);
    process.exit(1);
  });
