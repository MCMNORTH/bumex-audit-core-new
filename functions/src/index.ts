import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import * as XLSX from 'xlsx';

admin.initializeApp();

type BalanceRow = {
  account: string;
  label: string;
  balance: number;
};

const SHEET_NAME_N = 'Inserer BG N';
const SHEET_NAME_N1 = 'Inserer BG N-1';

const normalizeName = (name: string) => name.trim().toLowerCase();

const findSheetName = (sheetNames: string[], expectedName: string) => {
  if (sheetNames.includes(expectedName)) {
    return expectedName;
  }
  const normalizedExpected = normalizeName(expectedName);
  return sheetNames.find((name) => normalizeName(name) === normalizedExpected);
};

const parseBalanceRows = (sheet: XLSX.WorkSheet): BalanceRow[] => {
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: 5,
    raw: true,
    defval: '',
  }) as Array<Array<unknown>>;

  const parsed: BalanceRow[] = [];
  for (const row of rows) {
    const account = String(row[0] ?? '').trim();
    const label = String(row[1] ?? '').trim();
    const balanceRaw = row[2];
    const balanceText = String(balanceRaw ?? '').trim().replace(/\s+/g, '').replace(',', '.');
    const balanceNumber =
      typeof balanceRaw === 'number'
        ? balanceRaw
        : Number(balanceText);

    const isEmptyRow = account === '' && label === '' && (balanceText === '' || balanceNumber === 0);
    if (isEmptyRow) {
      break;
    }

    if (account === '') continue;

    parsed.push({
      account,
      label,
      balance: Number.isFinite(balanceNumber) ? balanceNumber : 0,
    });
  }

  console.log('rows parsed:', parsed.length);
  return parsed;
};

export const parseSourceExcel = onObjectFinalized(async (event) => {
  const object = event.data;
  const objectName = object.name || '';
  const bucketName = object.bucket || '';
  const uid = objectName.split('/')[1] || '';

  console.log('OBJECT NAME', objectName);
  console.log('OBJECT BUCKET', bucketName);

  if (!objectName.startsWith('source-excel/')) {
    console.log('Skipping non source-excel object');
    return;
  }

  if (!objectName.toLowerCase().endsWith('.xlsm')) {
    console.log('Skipping non-xlsm object');
    return;
  }

  const projectId = object.metadata?.projectId;
  if (!projectId) {
    console.error('Missing projectId in object metadata');
    return;
  }
  console.log('PROJECT ID', projectId);
  console.log('UID', uid);
  console.log('FILE PATH', objectName);

  const bucket = admin.storage().bucket(bucketName);
  const file = bucket.file(objectName);

  try {
    const [buffer] = await file.download();
    console.log('FILE DOWNLOADED', objectName);

    const workbook = XLSX.read(buffer, { type: 'buffer', raw: true, cellDates: true });
    console.log(workbook.SheetNames);

    const resolvedN = findSheetName(workbook.SheetNames, SHEET_NAME_N) || workbook.SheetNames[1];
    const resolvedN1 = findSheetName(workbook.SheetNames, SHEET_NAME_N1) || workbook.SheetNames[2];

    if (!resolvedN || !resolvedN1) {
      const missing: string[] = [];
      if (!resolvedN) missing.push(SHEET_NAME_N);
      if (!resolvedN1) missing.push(SHEET_NAME_N1);
      throw new Error(
        `Missing sheets: ${missing.join(', ')}. Available sheets: ${workbook.SheetNames.join(', ')}`
      );
    }

    const balanceN = parseBalanceRows(workbook.Sheets[resolvedN]);
    const balanceN1 = parseBalanceRows(workbook.Sheets[resolvedN1]);

    console.log('BALANCE N ROWS', balanceN.length);
    console.log('BALANCE N-1 ROWS', balanceN1.length);

    const parsedAt = new Date().toISOString();

    await admin.firestore().doc(`projects/${projectId}/knowledge_base/balances`).set(
      {
        status: 'done',
        balanceN,
        balanceN1,
        errorMessage: '',
        updatedAt: FieldValue.serverTimestamp(),
        parsedAt,
        sourcePath: objectName,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('PARSE ERROR', error);
    await admin.firestore().doc(`projects/${projectId}/knowledge_base/balances`).set(
      {
        status: 'error',
        balanceN: [],
        balanceN1: [],
        errorMessage: (error as Error)?.message || 'Unknown error',
        updatedAt: FieldValue.serverTimestamp(),
        parsedAt: new Date().toISOString(),
        sourcePath: objectName,
      },
      { merge: true }
    );
  }
});
