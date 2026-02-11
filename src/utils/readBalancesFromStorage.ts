import * as XLSX from 'xlsx';
import { downloadStorageFile } from '@/utils/downloadStorageFile';

export type BalanceRow = {
  account: string;
  label: string;
  balance: number;
};

type ReadBalancesResult = {
  balanceN: BalanceRow[];
  balanceN1: BalanceRow[];
  debug: {
    sheetNames: string[];
  };
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

  return rows
    .map((row) => {
      const account = String(row[0] ?? '').trim();
      const label = String(row[1] ?? '').trim();
      const balanceRaw = row[2];
      const balanceText = String(balanceRaw ?? '').trim();
      const balanceNumber = typeof balanceRaw === 'number'
        ? balanceRaw
        : Number(balanceText.replace(/\s+/g, '').replace(',', '.'));

      return {
        account,
        label,
        balance: Number.isFinite(balanceNumber) ? balanceNumber : 0,
      };
    })
    .filter((row) => row.account !== '');
};

export const readBalancesFromStorage = async (
  storagePath: string
): Promise<ReadBalancesResult> => {
  const arrayBuffer = await downloadStorageFile(storagePath);
  const workbook = XLSX.read(arrayBuffer, { type: 'array', raw: true, cellDates: true });

  console.log('SHEET NAMES', workbook.SheetNames);

  const sheetNames = workbook.SheetNames;
  const resolvedN = findSheetName(sheetNames, SHEET_NAME_N);
  const resolvedN1 = findSheetName(sheetNames, SHEET_NAME_N1);

  if (!resolvedN || !resolvedN1) {
    const missing: string[] = [];
    if (!resolvedN) missing.push(SHEET_NAME_N);
    if (!resolvedN1) missing.push(SHEET_NAME_N1);
    throw new Error(
      `Missing sheets: ${missing.join(', ')}. Available sheets: ${sheetNames.join(', ')}`
    );
  }

  const sheetN = workbook.Sheets[resolvedN];
  const sheetN1 = workbook.Sheets[resolvedN1];

  return {
    balanceN: parseBalanceRows(sheetN),
    balanceN1: parseBalanceRows(sheetN1),
    debug: {
      sheetNames,
    },
  };
};
