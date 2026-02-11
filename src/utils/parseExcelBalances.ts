import * as XLSX from 'xlsx';

export type BalanceRow = {
  account: string;
  label: string;
  balance: number | string;
};

export type ParseBalancesResult = {
  balanceN: BalanceRow[];
  balanceN1: BalanceRow[];
  errors: string[];
};

const SHEET_NAME_N = 'Inserer BG N';
const SHEET_NAME_N1 = 'Inserer BG N-1';

const normalizeSheetName = (name: string) => name.trim().toLowerCase();

const toNumber = (value: unknown): number | string => {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return '';
  const raw = String(value).trim();
  if (!raw) return '';

  // Handle parentheses for negatives: (1 234,56)
  const negative = raw.startsWith('(') && raw.endsWith(')');
  const cleaned = raw
    .replace(/[()]/g, '')
    .replace(/\s+/g, '')
    .replace(/\u00A0/g, '')
    .replace(/,/g, '.');

  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return raw;
  return negative ? -parsed : parsed;
};

const parseSheetRows = (sheet: XLSX.WorkSheet): BalanceRow[] => {
  const range = sheet['!ref'];
  if (!range) return [];

  const decoded = XLSX.utils.decode_range(range);
  const rows: BalanceRow[] = [];

  // Excel rows are 1-based. Row 6 => r = 5 (0-based)
  const startRow = 5;

  for (let r = startRow; r <= decoded.e.r; r += 1) {
    const accountCell = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
    const labelCell = sheet[XLSX.utils.encode_cell({ r, c: 1 })];
    const balanceCell = sheet[XLSX.utils.encode_cell({ r, c: 2 })];

    const accountValue = accountCell?.v;
    const labelValue = labelCell?.v;
    const balanceValue = balanceCell?.v;

    const isEmptyRow =
      (accountValue === undefined || accountValue === null || accountValue === '') &&
      (labelValue === undefined || labelValue === null || labelValue === '') &&
      (balanceValue === undefined || balanceValue === null || balanceValue === '');

    if (isEmptyRow) {
      break;
    }

    const account = accountValue === undefined || accountValue === null ? '' : String(accountValue);
    const label = labelValue === undefined || labelValue === null ? '' : String(labelValue);
    const balance = toNumber(balanceValue);

    if (account === '' && label === '' && balance === '') {
      continue;
    }

    rows.push({ account, label, balance });
  }

  return rows;
};

const resolveSheet = (workbook: XLSX.WorkBook, name: string) => {
  const exact = workbook.Sheets[name];
  if (exact) return { sheet: exact, resolvedName: name };

  const normalizedTarget = normalizeSheetName(name);
  const foundName = workbook.SheetNames.find(
    (sheetName) => normalizeSheetName(sheetName) === normalizedTarget
  );

  if (foundName) {
    return { sheet: workbook.Sheets[foundName], resolvedName: foundName };
  }

  return { sheet: undefined, resolvedName: undefined };
};

export const parseExcelBalances = (arrayBuffer: ArrayBuffer): ParseBalancesResult => {
  const errors: string[] = [];
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const availableSheets = workbook.SheetNames;

  const { sheet: sheetN, resolvedName: resolvedN } = resolveSheet(workbook, SHEET_NAME_N);
  const { sheet: sheetN1, resolvedName: resolvedN1 } = resolveSheet(workbook, SHEET_NAME_N1);

  if (!sheetN) {
    errors.push(`Sheet missing: ${SHEET_NAME_N}`);
  }
  if (!sheetN1) {
    errors.push(`Sheet missing: ${SHEET_NAME_N1}`);
  }

  const balanceN = sheetN ? parseSheetRows(sheetN) : [];
  const balanceN1 = sheetN1 ? parseSheetRows(sheetN1) : [];

  if (errors.length > 0) {
    console.error('Excel parsing error', {
      errors,
      availableSheets,
      resolvedN,
      resolvedN1,
    });
  }

  return { balanceN, balanceN1, errors };
};

export const getExpectedSheetNames = () => ({
  current: SHEET_NAME_N,
  prior: SHEET_NAME_N1,
});

export const parseExcelBalancesFromFile = async (
  file: File
): Promise<ParseBalancesResult> => {
  const arrayBuffer = await file.arrayBuffer();
  return parseExcelBalances(arrayBuffer);
};
