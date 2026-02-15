import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SourceExcelFile } from '@/types/formData';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import pcmAccounts from '@/plan_comptable_mauritanien.json';
import { ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

type BalanceRow = {
  account: string;
  label: string;
  balance: number;
};

type ProcessMappingRow = BalanceRow & {
  hasExcel?: boolean;
};

type Cycle = {
  id: string;
  name: string;
  order?: number;
  active?: boolean;
};

type ProcessMappingEntry = {
  account: string;
  processId: string;
};

type ProcessItem = {
  id: string;
  name: string;
  source: 'library' | 'custom';
};

type FsNode = {
  id: string;
  label: string;
  kind: 'group' | 'account';
  code?: string;
  accounts: string[];
  totalN: number;
  totalN1: number;
  children: FsNode[];
};

type FsTemplate = {
  id: string;
  name: string;
  tree: FsNode[];
};

class NoDndPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown',
      handler: ({ nativeEvent }: { nativeEvent: PointerEvent }) => {
        const target = nativeEvent.target as HTMLElement | null;
        if (target?.closest?.('[data-no-dnd]')) {
          return false;
        }
        return true;
      },
    },
  ];
}

const formatBalanceValue = (value: number) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat('fr-FR').format(value)
    : String(value ?? '');

const padAccount = (value: string) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const normalized = digits.replace(/^0+/, '') || '0';
  const trimmed = normalized.length > 6 ? normalized.slice(0, 6) : normalized;
  return trimmed.length >= 6 ? trimmed : trimmed.padEnd(6, '0');
};

const findSheetName = (sheetNames: string[], expected: string) => {
  const exact = sheetNames.find((name) => name === expected);
  if (exact) return exact;
  const lowered = expected.trim().toLowerCase();
  return (
    sheetNames.find((name) => name.trim().toLowerCase() === lowered) || null
  );
};

const normalizeRowKeys = (row: Record<string, unknown>) => {
  const next: Record<string, unknown> = {};
  Object.entries(row).forEach(([key, value]) => {
    next[key.trim().toLowerCase()] = value;
  });
  return next;
};

const downloadExcel = async (workbook: ExcelJS.Workbook, filename: string) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const applyHeaderStyle = (row: ExcelJS.Row, columnCount: number) => {
  for (let i = 1; i <= columnCount; i += 1) {
    const cell = row.getCell(i);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E79' },
    };
  }
};

const applyZebra = (row: ExcelJS.Row, columnCount: number) => {
  for (let i = 1; i <= columnCount; i += 1) {
    const cell = row.getCell(i);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F6FC' },
    };
  }
};

const applyBorders = (row: ExcelJS.Row, columnCount: number) => {
  for (let i = 1; i <= columnCount; i += 1) {
    const cell = row.getCell(i);
    cell.border = {
      left: { style: 'thin', color: { argb: 'FFD0D7E2' } },
      right: { style: 'thin', color: { argb: 'FFD0D7E2' } },
    };
  }
};

const applyVerticalBorders = (
  sheet: ExcelJS.Worksheet,
  columnCount: number,
  minRows: number
) => {
  const totalRows = Math.max(sheet.rowCount, minRows);
  for (let r = 1; r <= totalRows; r += 1) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= columnCount; c += 1) {
      const cell = row.getCell(c);
      if (cell.value === null || cell.value === undefined) {
        cell.value = '';
      }
    }
    applyBorders(row, columnCount);
  }
};


const FsAccountRowDisplay = ({
  row,
  showExcelIndicator = false,
}: {
  row: BalanceRow & { hasExcel?: boolean };
  showExcelIndicator?: boolean;
}) => (
  <div className="flex w-full min-w-0 items-center justify-between rounded-md border bg-white px-3 py-2 text-sm">
    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
      <span className="whitespace-nowrap font-medium">{row.account}</span>
      <span className="truncate whitespace-nowrap text-xs text-muted-foreground">
        {row.label}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {formatBalanceValue(row.balance)}
      </span>
      {showExcelIndicator && row.hasExcel && (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          Excel
        </span>
      )}
    </div>
  </div>
);

const DraggableAccountRow = ({ row }: { row: ProcessMappingRow }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useDraggable({
      id: `account:${row.account}`,
    });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    width: '100%',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
      title="Drag to a process"
    >
      <FsAccountRowDisplay row={row} showExcelIndicator />
    </div>
  );
};

const ProcessDropZone = ({
  process,
  children,
  collapsed = false,
  onToggle,
  actions,
}: {
  process: { id: string; name: string };
  children: ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
  actions?: ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `process:${process.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border p-3 space-y-2 ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-dashed bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onToggle && (
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
              onClick={onToggle}
              data-no-dnd
              aria-label={collapsed ? 'Expand' : 'Collapse'}
            >
              <ChevronRight
                className={`h-3 w-3 transition-transform ${collapsed ? '' : 'rotate-90'}`}
              />
            </button>
          )}
          <span className="text-sm font-medium text-gray-900">{process.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {isOver && <span className="text-xs text-blue-600">Drop here</span>}
          {actions}
        </div>
      </div>
      {!collapsed && children}
    </div>
  );
};

const DraggableFsAccount = ({ row }: { row: BalanceRow }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useDraggable({
      id: `fs-account:${row.account}`,
    });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    width: '100%',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
      title="Drag to a section"
    >
      <FsAccountRowDisplay row={row} />
    </div>
  );
};

const FsDropZone = ({
  nodeId,
  children,
}: {
  nodeId: string;
  children: ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `fs-node:${nodeId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border p-2 ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-dashed bg-white'
      }`}
    >
      {children}
    </div>
  );
};

interface KnowledgeBasePageProps {
  projectId?: string;
  sourceExcelFile: SourceExcelFile | null;
  onNavigateToUpload?: () => void;
  onRemoveSourceExcel?: () => void;
}

const KnowledgeBasePage = ({
  projectId,
  sourceExcelFile,
  onNavigateToUpload,
  onRemoveSourceExcel,
}: KnowledgeBasePageProps) => {
  const [balancesDoc, setBalancesDoc] = useState<{
    status?: 'processing' | 'done' | 'error';
    balanceN?: BalanceRow[];
    balanceN1?: BalanceRow[];
    parsedAt?: string;
    errorMessage?: string;
  } | null>(null);
  const [balancesError, setBalancesError] = useState<string | null>(null);
  const [balancesDocExists, setBalancesDocExists] = useState<boolean | null>(null);
  const loadInProgressRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const pcmAutoRebuildRef = useRef(false);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [mappingDoc, setMappingDoc] = useState<{
    status?: 'in_progress' | 'completed' | 'error';
    mappings?: ProcessMappingEntry[];
    processes?: ProcessItem[];
    errorMessage?: string;
  } | null>(null);
  const [mappingError, setMappingError] = useState<string | null>(null);
  const mappingLoadInProgressRef = useRef(false);
  const mappingUnsubscribeRef = useRef<(() => void) | null>(null);
  const [selectedProcesses, setSelectedProcesses] = useState<ProcessItem[]>([]);
  const [draftProcesses, setDraftProcesses] = useState<ProcessItem[]>([]);
  const [showProcessLibrary, setShowProcessLibrary] = useState(false);
  const [collapsedProcesses, setCollapsedProcesses] = useState<Set<string>>(new Set());
  const [balanceImportError, setBalanceImportError] = useState<string | null>(null);
  const [balanceImportMessage, setBalanceImportMessage] = useState<string | null>(null);
  const [processImportError, setProcessImportError] = useState<string | null>(null);
  const [processImportMessage, setProcessImportMessage] = useState<string | null>(null);
  const [fsStructure, setFsStructure] = useState<{
    template: 'bumex_pcm' | 'manual';
    tree: FsNode[];
  } | null>(null);
  const [fsTemplates, setFsTemplates] = useState<FsTemplate[]>([]);
  const [fsTemplateId, setFsTemplateId] = useState<string | null>(null);
  const [fsTemplateName, setFsTemplateName] = useState<string | null>(null);
  const [activeFsRow, setActiveFsRow] = useState<BalanceRow | null>(null);
  const [fsError, setFsError] = useState<string | null>(null);
  const [fsLoading, setFsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'financial-statements' | 'balances' | 'process-mapping'>('financial-statements');
  const [showManualMapping, setShowManualMapping] = useState(false);
  const [autoMapMessage, setAutoMapMessage] = useState<string | null>(null);
  const [balanceMappingTree, setBalanceMappingTree] = useState<FsNode[] | null>(
    null
  );
  const [pcmLibraryOpen, setPcmLibraryOpen] = useState(false);
  const [pcmLibraryTargetId, setPcmLibraryTargetId] = useState<string | null>(
    null
  );
  const [pcmLibraryQuery, setPcmLibraryQuery] = useState('');
  const [pcmLibrarySelected, setPcmLibrarySelected] = useState<Set<string>>(
    new Set()
  );
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const balanceImportInputRef = useRef<HTMLInputElement | null>(null);
  const processImportInputRef = useRef<HTMLInputElement | null>(null);

  const sensors = useSensors(
    useSensor(NoDndPointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    if (!projectId) return;
    if (loadInProgressRef.current) return;

    loadInProgressRef.current = true;
    setBalancesError(null);

    const balancesPath = `projects/${projectId}/knowledge_base/balances`;
    console.log('Balances Firestore path used =', balancesPath);

    const balancesRef = doc(db, balancesPath);
    const timeoutId = window.setTimeout(() => {
      setBalancesError('Timeout loading balances (10s).');
    }, 10000);

    unsubscribeRef.current = onSnapshot(
      balancesRef,
      (snap) => {
        window.clearTimeout(timeoutId);
        loadInProgressRef.current = false;
        const exists = snap.exists();
        setBalancesDocExists(exists);
        console.log('Balances doc exists =', exists);

        if (exists) {
          const data = snap.data() as typeof balancesDoc;
          setBalancesDoc(data);
          console.log('Balances status =', data.status);
          console.log(
            'balanceN length =',
            data.balanceN?.length ?? 0,
            '/ balanceN1 length =',
            data.balanceN1?.length ?? 0
          );
        } else {
          setBalancesDoc(null);
          console.log('Balances status =', 'missing');
        }
      },
      (error) => {
        window.clearTimeout(timeoutId);
        loadInProgressRef.current = false;
        console.error('Balances snapshot error', error);
        setBalancesError(`${(error as { code?: string }).code || 'error'}: ${(error as Error).message}`);
      }
    );

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      loadInProgressRef.current = false;
    };
  }, [projectId]);

  useEffect(() => {
    const loadCycles = async () => {
      const snap = await getDocs(collection(db, 'cycles'));
      const data = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Cycle, 'id'>),
      })) as Cycle[];

      data.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
      setCycles(data.filter((cycle) => cycle.active !== false));
    };

    loadCycles();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setFsLoading(true);
    setFsError(null);

    const structurePath = `projects/${projectId}/knowledge_base/financial_statements`;
    const unsubscribe = onSnapshot(
      doc(db, structurePath),
      (snap) => {
        setFsLoading(false);
        if (snap.exists()) {
          const data = snap.data() as typeof fsStructure & {
            templateName?: string | null;
            templateId?: string | null;
          };
          setFsStructure(data);
          setFsTemplateName(data.templateName ?? null);
          setFsTemplateId(data.templateId ?? null);
        } else {
          setFsStructure(null);
          setFsTemplateName(null);
          setFsTemplateId(null);
        }
      },
      (error) => {
        setFsLoading(false);
        setFsError((error as Error).message);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const loadTemplates = async () => {
      const templatesPath = `projects/${projectId}/knowledge_base/fs_templates`;
      const snap = await getDocs(collection(db, templatesPath));
      const list = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FsTemplate, 'id'>),
      })) as FsTemplate[];
      list.sort((a, b) => a.name.localeCompare(b.name));
      setFsTemplates(list);
    };
    loadTemplates();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    if (mappingLoadInProgressRef.current) return;

    mappingLoadInProgressRef.current = true;
    setMappingError(null);

    const mappingPath = `projects/${projectId}/knowledge_base/process_mapping`;
    console.log('Process mapping Firestore path used =', mappingPath);

    const mappingRef = doc(db, mappingPath);
    const timeoutId = window.setTimeout(() => {
      setMappingError('Timeout loading process mapping (10s).');
    }, 10000);

    mappingUnsubscribeRef.current = onSnapshot(
      mappingRef,
      (snap) => {
        window.clearTimeout(timeoutId);
        mappingLoadInProgressRef.current = false;
        if (snap.exists()) {
          const data = snap.data() as typeof mappingDoc;
          setMappingDoc(data);
          setSelectedProcesses(data.processes ?? []);
        } else {
          setMappingDoc(null);
          setSelectedProcesses([]);
        }
      },
      (error) => {
        window.clearTimeout(timeoutId);
        mappingLoadInProgressRef.current = false;
        console.error('Process mapping snapshot error', error);
        setMappingError(`${(error as { code?: string }).code || 'error'}: ${(error as Error).message}`);
      }
    );

    return () => {
      window.clearTimeout(timeoutId);
      mappingUnsubscribeRef.current?.();
      mappingUnsubscribeRef.current = null;
      mappingLoadInProgressRef.current = false;
    };
  }, [projectId]);

  const balanceN = useMemo(() => balancesDoc?.balanceN ?? [], [balancesDoc]);
  const balanceN1 = useMemo(() => balancesDoc?.balanceN1 ?? [], [balancesDoc]);
  const balanceNByAccount = useMemo(() => {
    const map = new Map<string, BalanceRow>();
    balanceN.forEach((row) => {
      if (!row.account) return;
      const key = padAccount(row.account);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...row, account: key, balance: row.balance ?? 0 });
        return;
      }
      map.set(key, {
        ...existing,
        balance: (existing.balance ?? 0) + (row.balance ?? 0),
      });
    });
    return map;
  }, [balanceN]);
  const balanceN1ByAccount = useMemo(() => {
    const map = new Map<string, BalanceRow>();
    balanceN1.forEach((row) => {
      if (!row.account) return;
      const key = padAccount(row.account);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...row, account: key, balance: row.balance ?? 0 });
        return;
      }
      map.set(key, {
        ...existing,
        balance: (existing.balance ?? 0) + (row.balance ?? 0),
      });
    });
    return map;
  }, [balanceN1]);
  const uniqueBalanceRows = useMemo(() => {
    const map = new Map<string, BalanceRow>();
    balanceN.forEach((row) => {
      if (row.account) map.set(row.account, row);
    });
    balanceN1.forEach((row) => {
      if (row.account && !map.has(row.account)) map.set(row.account, row);
    });
    return Array.from(map.values());
  }, [balanceN, balanceN1]);

  const mappingSourceRows = useMemo(() => {
    return [...balanceN, ...balanceN1];
  }, [balanceN, balanceN1]);

  const mappingSourceUniqueRows = useMemo(() => {
    const map = new Map<string, BalanceRow>();
    mappingSourceRows.forEach((row) => {
      if (row.account) map.set(row.account, row);
    });
    return Array.from(map.values());
  }, [mappingSourceRows]);
  const balanceLabelByAccount = useMemo(() => {
    const map = new Map<string, string>();
    mappingSourceUniqueRows.forEach((row) => {
      if (row.account && row.label) {
        map.set(row.account, row.label);
      }
    });
    return map;
  }, [mappingSourceUniqueRows]);
  const balanceAccountCodes = useMemo(
    () =>
      mappingSourceUniqueRows
        .map((row) => row.account)
        .filter(Boolean)
        .map((account) => padAccount(account)),
    [mappingSourceUniqueRows]
  );
  console.log('rowsUsedByTable.balanceN', balanceN);
  console.log('rowsUsedByTable.balanceN1', balanceN1);
  const balanceParsedAt = balancesDoc?.parsedAt;
  const balanceStatus = balancesDoc?.status;
  const balanceError = balancesDoc?.errorMessage;

  const fixMojibakeLabel = (value: string) => {
    const replacements: Record<string, string> = {
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
    return fixed.replace(/Ã\s+(?=[A-Za-zÀ-ÿ])/g, "à ");
  };

  const formatLabel = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    const lower = trimmed.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const createNode = (label: string): FsNode => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: formatLabel(fixMojibakeLabel(label)),
    kind: 'group',
    accounts: [],
    totalN: 0,
    totalN1: 0,
    children: [],
  });

  const createAccountNode = (code: string, label: string, displayCode?: string): FsNode => ({
    id: `${code}-${Math.random().toString(36).slice(2, 6)}`,
    label: `${displayCode ?? code} - ${formatLabel(fixMojibakeLabel(label))}`,
    kind: 'account',
    code,
    accounts: [],
    totalN: 0,
    totalN1: 0,
    children: [],
  });

  const rawPcmList = pcmAccounts as Array<{
    classe: number;
    section_code: string;
    section_label: string;
    account: string;
    label: string;
    zero_prefix?: boolean;
  }>;

  const pcmList = useMemo(() => {
    const list = rawPcmList.map((item) => {
      const rawAccount = String(item.account);
      const padded = padAccount(rawAccount);
      return { ...item, account: padded, rawAccount, rawLen: rawAccount.length };
    });
    const hasConcours = list.some((item) => item.account === '559000');
    if (!hasConcours) {
      list.push({
        classe: 5,
        section_code: '55',
        section_label: 'Banques',
        account: '559000',
        label: 'Concours bancaires courants',
        rawAccount: '559000',
        rawLen: 6,
      });
    }
    const hasImpotResultat = list.some((item) => item.account === '860000');
    if (!hasImpotResultat) {
      list.push({
        classe: 8,
        section_code: '86',
        section_label: 'IMPOT SUR LE RESULTAT',
        account: '860000',
        label: 'IMPÔTS SUR LE RÉSULTAT (IMF ET IMPÔTS SUR LES BÉNÉFICES)',
        rawAccount: '860000',
        rawLen: 6,
      });
    }
    return list;
  }, [rawPcmList]);


  const pcmByCode = useMemo(() => {
    const map = new Map<string, (typeof pcmList)[number]>();
    pcmList.forEach((item) => {
      const existing = map.get(item.account);
      if (!existing || item.rawLen > existing.rawLen) {
        map.set(item.account, item);
      }
    });
    return map;
  }, [pcmList]);

  const manualFsAccounts = useMemo(() => {
    if (!fsStructure) return [] as Array<{ account: string; label: string }>;
    const items: Array<{ account: string; label: string }> = [];
    const walk = (nodes: FsNode[]) => {
      nodes.forEach((node) => {
        if (node.kind === 'account' && node.code) {
          const rawLabel = node.label ?? '';
          const prefix = `${node.code} - `;
          const label = rawLabel.startsWith(prefix)
            ? rawLabel.slice(prefix.length)
            : rawLabel;
          items.push({ account: node.code, label });
        }
        walk(node.children);
      });
    };
    walk(fsStructure.tree);
    return items;
  }, [fsStructure]);

  const getLeafAccounts = () => {
    const codes = pcmList.map((item) => item.account);
    const codeSet = new Set(codes);
    return pcmList.filter(
      (item) =>
        !codes.some(
          (other) =>
            other !== item.account && other.startsWith(item.account)
        ) && codeSet.has(item.account)
    );
  };

  const pcmLeafAccounts = getLeafAccounts();
  const pcmAccountsForStructure = useMemo(() => {
    return pcmList.filter((item) => item.rawLen >= 3);
    const titleLabels = [
      'actif immobilisé',
      'actif circulant',
      'comptes de régularisation',
      'capitaux propres',
      'emprunts et dettes',
      'comptes de régularisation',
    ];
    const subTitleLabels = [
      'immobilisations incorporelles',
      'immobilisations corporelles',
      'immobilisations en cours',
      'immobilisations financières',
      'valeurs d’exploitation',
      'valeurs réalisables à court terme',
      'valeurs disponibles',
      'charges constatées d’avance',
      'différences de conversion - actif',
      'comptes d’attente et à régulariser',
    ];
    const postLabels = [
      'terrains',
      'constructions',
      'matériel d’exploitation',
      'matériel de transport',
      'matériel de bureau et informatique',
      'autres immobilisations corporelles',
      'titres de participation',
      'autres immobilisations financières',
      'stocks',
      'en-cours',
      'fournisseurs débiteurs',
      'clients et comptes rattachés',
      'personnel et comptes rattachés',
      'état, collectivités et organismes sociaux',
      'associés et groupe',
      'débiteurs divers',
      'prêts à court terme',
      'valeurs mobilières de placement',
      'banques',
      'caisse',
    ];
    const excluded = new Set(
      [...titleLabels, ...subTitleLabels, ...postLabels].map((label) =>
        label.trim().toLowerCase()
      )
    );
    return pcmList.filter((item) => {
      const label = item.label.trim().toLowerCase();
      return item.rawLen >= 3 && !excluded.has(label);
    });
  }, [pcmList]);

  const pcmLibraryItems = useMemo(() => {
    const query = pcmLibraryQuery.trim().toLowerCase();
    if (!query) return pcmAccountsForStructure;
    return pcmAccountsForStructure.filter((item) => {
      return (
        item.account.includes(query) ||
        item.label.toLowerCase().includes(query)
      );
    });
  }, [pcmAccountsForStructure, pcmLibraryQuery]);

  const buildPcmStructure = (): FsNode[] => {
    const actif = createNode('ACTIF');
    const passif = createNode('PASSIF');
    const resultat = createNode('RESULTAT');

    const createVariantGroup = (
      label: string,
      options: { amortissement?: boolean; depreciation?: boolean } = {}
    ) => {
      const { amortissement = true, depreciation = true } = options;
      const group = createNode(label);
      const children = [createNode(`${label} brut`)];
      if (amortissement) {
        children.push(createNode(`${label} amortissement`));
      }
      if (depreciation) {
        children.push(createNode(`${label} depreciation`));
      }
      group.children = children;
      return group;
    };

    const variantNodesFor = (label: string) => [createVariantGroup(label)];

    const depreciationNodeFor = (label: string) =>
      createNode(`${label} depreciation`);

    const actifImmobilise = createNode('Actif immobilisé');
    actifImmobilise.children = [
      createNode('Immobilisations incorporelles'),
      createNode('Immobilisations corporelles'),
      createVariantGroup('Immobilisations en cours', { amortissement: false, depreciation: true }),
      createNode('Immobilisations financières'),
    ];
    const immCorporelles = actifImmobilise.children.find(
      (node) => node.label === 'Immobilisations corporelles'
    );
    if (immCorporelles) {
      immCorporelles.children = [
        ...variantNodesFor('Terrains'),
        ...variantNodesFor('Constructions'),
        ...variantNodesFor('Matériel d’exploitation'),
        ...variantNodesFor('Matériel de transport'),
        ...variantNodesFor('Matériel de bureau et informatique'),
        ...variantNodesFor('Autres immobilisations corporelles'),
      ];
    }
    const immFinancieres = actifImmobilise.children.find(
      (node) => node.label === 'Immobilisations financières'
    );
    if (immFinancieres) {
      immFinancieres.children = [
        ...variantNodesFor('Titres de participation'),
        ...variantNodesFor('Autres immobilisations financières'),
      ];
    }

    const labelActifImmobilise = actifImmobilise.label;
    const labelImmCorp = immCorporelles?.label ?? 'Immobilisations corporelles';
    const labelImmEnCours =
      actifImmobilise.children.find((node) => node.label.includes('en cours'))
        ?.label ?? 'Immobilisations en cours';
    const labelImmFin = immFinancieres?.label ?? 'Immobilisations financiÃ¨res';
    const labelTerrains =
      immCorporelles?.children.find((node) =>
        node.label.toLowerCase().includes('terrain')
      )?.label ?? 'Terrains';
    const labelConstructions =
      immCorporelles?.children.find((node) =>
        node.label.toLowerCase().includes('construction')
      )?.label ?? 'Constructions';
    const labelMatExploitation =
      immCorporelles?.children.find((node) =>
        node.label.toLowerCase().includes('exploitation')
      )?.label ?? 'MatÃ©riel dâ€™exploitation';
    const labelMatTransport =
      immCorporelles?.children.find((node) =>
        node.label.toLowerCase().includes('transport')
      )?.label ?? 'MatÃ©riel de transport';
    const labelMatBureau =
      immCorporelles?.children.find((node) =>
        node.label.toLowerCase().includes('bureau')
          || node.label.toLowerCase().includes('informat')
      )?.label ?? 'MatÃ©riel de bureau et informatique';
    const labelAutresImmCorp =
      immCorporelles?.children.find((node) =>
        node.label.toLowerCase().includes('autres immobilisations')
      )?.label ?? 'Autres immobilisations corporelles';
    const labelTitresParticipation =
      immFinancieres?.children.find((node) =>
        node.label.toLowerCase().includes('participation')
      )?.label ?? 'Titres de participation';
    const labelAutresImmFin =
      immFinancieres?.children.find((node) =>
        node.label.toLowerCase().includes('autres immobilisations')
      )?.label ?? 'Autres immobilisations financiÃ¨res';

    const actifCirculant = createNode('Actif circulant');
    actifCirculant.children = [
      createNode('Valeurs d’exploitation'),
      createNode('Valeurs réalisables à court terme'),
      createNode('Valeurs disponibles'),
    ];
    const valeursExploitation = actifCirculant.children[0];
    valeursExploitation.children = [
      createVariantGroup('Stocks', { amortissement: false, depreciation: true }),
      createVariantGroup('En-cours', { amortissement: false, depreciation: true }),
    ];
    const valeursReal = actifCirculant.children[1];
    valeursReal.children = [
      createNode('Fournisseurs débiteurs'),
      createNode('Clients et comptes rattachés'),
      depreciationNodeFor('Clients et comptes rattachés'),
      createNode('Personnel et comptes rattachés'),
      createNode('État, collectivités et organismes sociaux'),
      createNode('Associés et groupe'),
      depreciationNodeFor('Associés et groupe'),
      createNode('Débiteurs divers'),
      depreciationNodeFor('Débiteurs divers'),
    ];
    valeursReal.children = [
      createNode('Fournisseurs débiteurs'),
      createVariantGroup('Clients et comptes rattachés', {
        amortissement: false,
        depreciation: true,
      }),
      createNode('Personnel et comptes rattachés'),
      createNode('État, collectivités et organismes sociaux'),
      createVariantGroup('Associés et groupe', {
        amortissement: false,
        depreciation: true,
      }),
      createVariantGroup('Débiteurs divers', {
        amortissement: false,
        depreciation: true,
      }),
    ];
    const valeursDisponibles = actifCirculant.children[2];
    valeursDisponibles.children = [
      createNode('Prêts à court terme'),
      createNode('Valeurs mobilières de placement'),
      createNode('Banques'),
      createNode('Caisse'),
    ];

    const comptesRegulActif = createNode('Comptes de régularisation');
    comptesRegulActif.children = [
      createNode('Charges constatées d’avance'),
      createNode('Différences de conversion - Actif'),
      createNode('Comptes d’attente et à régulariser'),
    ];

    const regulActifCharges = comptesRegulActif.children[0];
    const regulActifDiff = comptesRegulActif.children[1];
    const regulActifAttente = comptesRegulActif.children[2];
    actif.children = [actifImmobilise, actifCirculant, comptesRegulActif];

    const capitauxPropres = createNode('Capitaux propres');
    const situationNette = createNode('Situation nette');
    situationNette.children = [
      createNode('Capital'),
      createNode('Réserves'),
      createNode('Report à nouveau'),
      createNode('Résultat de l’exercice'),
    ];
    capitauxPropres.children = [
      situationNette,
      createNode('Compte de liaison des succursales'),
      createNode('Subventions d’équipement'),
      createNode('Écart de réévaluation'),
      createNode('Provision spéciale de réévaluation'),
      createNode('Provisions réglementées'),
    ];
    const empruntsDettes = createNode('Emprunts et dettes');
    empruntsDettes.children = [
      createNode('Emprunts et dettes à long et moyen terme'),
      createNode('Provisions pour risques et charges'),
      createNode('Dettes à court terme'),
    ];
    const dettesCourtTerme = empruntsDettes.children[2];
    dettesCourtTerme.children = [
      createNode('Fournisseurs et comptes rattachés'),
      createNode('Clients créditeurs'),
      createNode('Personnel et comptes rattachés'),
      createNode('État, collectivités et organismes sociaux'),
      createNode('Associés et groupe'),
      createNode('Créditeurs divers'),
      createNode('Emprunts à court terme'),
      createNode('Concours bancaires courants'),
    ];

    const normalizeNodeLabel = (value: string) => {
      const trimmed = value.trim().toLowerCase();
      return trimmed.normalize
        ? trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        : trimmed;
    };
    const addToDettesCourtTerme = (
      labelHint: string,
      account: { account: string; label: string }
    ) => {
      const hint = normalizeNodeLabel(labelHint);
      const target =
        dettesCourtTerme.children.find((child) =>
          normalizeNodeLabel(child.label).includes(hint)
        ) ?? dettesCourtTerme;
      target.children.push(createAccountNode(account.account, account.label));
    };

    const comptesRegulPassif = createNode('Comptes de régularisation');
    comptesRegulPassif.children = [
      createNode('Produits constatés d’avance'),
      createNode('Différences de conversion - Passif'),
      createNode('Comptes d’attente et à régulariser'),
    ];

    const regulPassifProduits = comptesRegulPassif.children[0];
    const regulPassifDiff = comptesRegulPassif.children[1];
    const regulPassifAttente = comptesRegulPassif.children[2];
    passif.children = [capitauxPropres, empruntsDettes, comptesRegulPassif];

    const resultatExploitation = createNode('Résultat d’exploitation');
    resultatExploitation.children = [
      createNode('Produits d’exploitation'),
      createNode('Charges d’exploitation'),
    ];
    const resultatFinancier = createNode('Résultat financier');
    resultatFinancier.children = [
      createNode('Produits financiers'),
      createNode('Charges financières'),
    ];
    const resultatHors = createNode('Résultat hors exploitation');
    resultatHors.children = [
      createNode('Produits hors exploitation'),
      createNode('Charges hors exploitation'),
    ];
    const impotResultat = createNode('Impôt sur le résultat');
    resultat.children = [
      resultatExploitation,
      resultatFinancier,
      resultatHors,
      impotResultat,
    ];

    const rootNodes = [actif, passif, resultat];

    const normalizeLabelForMatch = (value: string) => {
      const trimmed = value.trim();
      let repaired = trimmed;
      for (let i = 0; i < 2; i += 1) {
        try {
          repaired = decodeURIComponent(escape(repaired));
        } catch {
          break;
        }
      }
      const lower = repaired.toLowerCase();
      const deaccent = lower.normalize
        ? lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        : lower;
      return deaccent.replace(/[^a-z0-9]/g, '');
    };

    const findNodeByLabelPath = (nodes: FsNode[], path: string[]): FsNode | null => {
      if (path.length === 0) return null;
      let current: FsNode | undefined;
      let list = nodes;
      for (const label of path) {
        current = list.find(
          (node) => normalizeLabelForMatch(node.label) === normalizeLabelForMatch(label)
        );
        if (!current) return null;
        list = current.children;
      }
      return current || null;
    };

    const addAccountToPath = (
      path: string[],
      account: { account: string; label: string; zero_prefix?: boolean }
    ) => {
      const target = findNodeByLabelPath(rootNodes, path);
      if (!target) return;
      const labelOverrides: Record<string, string> = {
        '634000':
          'Publicité et propagande ; publications, promotion des ventes (annonces, échantillons, foires et expositions, cadeaux à la clientèle, catalogues et imprimés…)',
        '638000':
          'Charges diverses (cotisations, frais de recrutement du personnel, frais de conseil et d’assemblées…)',
        '654000':
          'Cotisations sociales, personnelles de l’exploitant et des membres de sociétés de personnes, gérants majoritaires',
        '657000':
          'Avantages en nature (logement, voiture, assurances, santé, transport, vêtements, alimentation…)',
        '660600':
          'Impôts régionaux (taxe d’habitation et d’enlèvement des ordures ménagères, taxe sur les armes à feu…)',
        '661800':
          'Autres impôts indirects et taxes spécifiques (taxes de circulation sur les viandes, taxes spéciales sur les projections cinématographiques…)',
        '860000': 'IMPÔTS SUR LE RÉSULTAT (IMF ET IMPÔTS SUR LES BÉNÉFICES)',
        '559000': 'Concours bancaires courants',
        '260000':
          'PrÃªts et avances consentis Ã  long et moyen terme (aux associÃ©s, au personnel, et de fonds)',
      };
      const label = labelOverrides[account.account] ?? account.label;
      const displayCode =
        account.zero_prefix && account.account.length === 6
          ? `0${account.account.slice(0, 5)}`
          : account.account;
      const brutLabel = `${target.label} brut`;
      const brutChild = target.children.find(
        (child) =>
          normalizeLabelForMatch(child.label) === normalizeLabelForMatch(brutLabel)
      );
      if (brutChild) {
        brutChild.children.push(createAccountNode(account.account, label, displayCode));
        return;
      }
      target.children.push(createAccountNode(account.account, label, displayCode));
    };

    const variantForCode = (code: string) => {
      if (code.startsWith('28')) return 'amortissement';
      if (code.startsWith('29')) return 'depreciation';
      return 'brut';
    };

    const addAccountToVariantPath = (
      path: string[],
      account: { account: string; label: string }
    ) => {
      const variant = variantForCode(account.account);
      const last = path[path.length - 1];
      const targetPath = [...path, `${last} ${variant}`];
      addAccountToPath(targetPath, account);
    };

    const normalized = (value: string) => value.toLowerCase();

    const addLinkedAmortDep = (
      baseAccount: { account: string; label: string },
      path: string[]
    ) => {
      const code = baseAccount.account;
      if (code.length < 2) return;
      const amortCode = padAccount(`${code[0]}8${code.slice(1)}`);
      const deprCode = padAccount(`${code[0]}9${code.slice(1)}`);
      const amort = pcmByCode.get(amortCode);
      const depr = pcmByCode.get(deprCode);
      if (amort) addAccountToVariantPath(path, amort);
      if (depr) addAccountToVariantPath(path, depr);
    };

    const resolveActifPostPath = (code: string, labelValue: string) => {
      if (code.startsWith('20')) {
        return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations incorporelles'], isSubTitle: true };
      }
      if (code.startsWith('21')) {
        if (code.startsWith('210') || labelValue.includes('terrain')) {
          return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations corporelles', 'Terrains'], isSubTitle: false };
        }
        if (code.startsWith('212') || labelValue.includes('construction')) {
          return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations corporelles', 'Constructions'], isSubTitle: false };
        }
        if (labelValue.includes('exploitation')) {
          return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations corporelles', 'Matériel d’exploitation'], isSubTitle: false };
        }
        if (labelValue.includes('transport')) {
          return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations corporelles', 'Matériel de transport'], isSubTitle: false };
        }
        if (labelValue.includes('bureau') || labelValue.includes('informat')) {
          return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations corporelles', 'Matériel de bureau et informatique'], isSubTitle: false };
        }
        return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations corporelles', 'Autres immobilisations corporelles'], isSubTitle: false };
      }
      if (code.startsWith('23')) {
        return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations en cours'], isSubTitle: true };
      }
      if (code.startsWith('26') || code.startsWith('27')) {
        if (labelValue.includes('particip')) {
          return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations financières', 'Titres de participation'], isSubTitle: false };
        }
        return { path: ['ACTIF', 'Actif immobilisé', 'Immobilisations financières', 'Autres immobilisations financières'], isSubTitle: false };
      }
      return null;
    };

    const resolveActifPostPathV2 = (code: string, labelValue: string) => {
      if (code.startsWith('20')) {
        return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations incorporelles'], isSubTitle: true };
      }
      if (code.startsWith('21')) {
        if (code.startsWith('210') || labelValue.includes('terrain')) {
          return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations corporelles', 'Terrains'], isSubTitle: false };
        }
        if (code.startsWith('212') || labelValue.includes('construction') || labelValue.includes('bÃ¢timent')) {
          return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations corporelles', 'Constructions'], isSubTitle: false };
        }
        if (labelValue.includes('exploitation')) {
          return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations corporelles', 'MatÃ©riel dâ€™exploitation'], isSubTitle: false };
        }
        if (labelValue.includes('transport')) {
          return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations corporelles', 'MatÃ©riel de transport'], isSubTitle: false };
        }
        if (labelValue.includes('bureau') || labelValue.includes('informat') || labelValue.includes('mobilier')) {
          return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations corporelles', 'MatÃ©riel de bureau et informatique'], isSubTitle: false };
        }
        return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations corporelles', 'Autres immobilisations corporelles'], isSubTitle: false };
      }
      if (code.startsWith('22') || code.startsWith('24') || code.startsWith('25')) {
        return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations corporelles', 'Autres immobilisations corporelles'], isSubTitle: false };
      }
      if (code.startsWith('23')) {
        return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations en cours'], isSubTitle: true };
      }
      if (code.startsWith('26') || code.startsWith('27')) {
        if (labelValue.includes('particip')) {
          return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations financiÃ¨res', 'Titres de participation'], isSubTitle: false };
        }
        return { path: ['ACTIF', 'Actif immobilisÃ©', 'Immobilisations financiÃ¨res', 'Autres immobilisations financiÃ¨res'], isSubTitle: false };
      }
      return null;
    };

    const resolveActifPostPathNormalized = (code: string, labelValue: string) => {
      if (code.startsWith('20')) {
        return { path: ['ACTIF', labelActifImmobilise, 'Immobilisations incorporelles'], isSubTitle: true };
      }
      if (code.startsWith('21')) {
        if (code.startsWith('210') || labelValue.includes('terrain')) {
          return { path: ['ACTIF', labelActifImmobilise, labelImmCorp, labelTerrains], isSubTitle: false };
        }
        if (code.startsWith('212') || labelValue.includes('construction') || labelValue.includes('bÃƒÂ¢timent')) {
          return { path: ['ACTIF', labelActifImmobilise, labelImmCorp, labelConstructions], isSubTitle: false };
        }
        if (labelValue.includes('exploitation')) {
          return { path: ['ACTIF', labelActifImmobilise, labelImmCorp, labelMatExploitation], isSubTitle: false };
        }
        if (labelValue.includes('transport')) {
          return { path: ['ACTIF', labelActifImmobilise, labelImmCorp, labelMatTransport], isSubTitle: false };
        }
        if (labelValue.includes('bureau') || labelValue.includes('informat') || labelValue.includes('mobilier')) {
          return { path: ['ACTIF', labelActifImmobilise, labelImmCorp, labelMatBureau], isSubTitle: false };
        }
        return { path: ['ACTIF', labelActifImmobilise, labelImmCorp, labelAutresImmCorp], isSubTitle: false };
      }
      if (code.startsWith('22') || code.startsWith('24') || code.startsWith('25')) {
        return { path: ['ACTIF', labelActifImmobilise, labelImmCorp, labelAutresImmCorp], isSubTitle: false };
      }
      if (code.startsWith('23')) {
        return { path: ['ACTIF', labelActifImmobilise, labelImmEnCours], isSubTitle: true };
      }
      if (code.startsWith('26') || code.startsWith('27')) {
        if (labelValue.includes('particip')) {
          return { path: ['ACTIF', labelActifImmobilise, labelImmFin, labelTitresParticipation], isSubTitle: false };
        }
        return { path: ['ACTIF', labelActifImmobilise, labelImmFin, labelAutresImmFin], isSubTitle: false };
      }
      return null;
    };

    const resolveResultatPath = (item: (typeof pcmAccountsForStructure)[number]) => {
      const code = item.account;
      if (item.zero_prefix) {
        if (code.startsWith('7')) {
          return ['RESULTAT', 'Résultat hors exploitation', 'Produits hors exploitation'];
        }
        if (code.startsWith('6')) {
          return ['RESULTAT', 'Résultat hors exploitation', 'Charges hors exploitation'];
        }
      }
      if (code.startsWith('70') || code.startsWith('71') || code.startsWith('72') || code.startsWith('74') || code.startsWith('76') || code.startsWith('78') || code.startsWith('79')) {
        return ['RESULTAT', 'Résultat d’exploitation', 'Produits d’exploitation'];
      }
      if (code.startsWith('60') || code.startsWith('61') || code.startsWith('62') || code.startsWith('63') || code.startsWith('64') || code.startsWith('65') || code.startsWith('66') || code.startsWith('68')) {
        return ['RESULTAT', 'Résultat d’exploitation', 'Charges d’exploitation'];
      }
      if (code.startsWith('77')) {
        return ['RESULTAT', 'Résultat financier', 'Produits financiers'];
      }
      if (code.startsWith('67')) {
        return ['RESULTAT', 'Résultat financier', 'Charges financières'];
      }
      if (code.startsWith('86')) {
        return ['RESULTAT', 'Impôt sur le résultat'];
      }
      return null;
    };

    pcmAccountsForStructure.forEach((account) => {
      const code = account.account;
      const label = normalized(account.label);
      const classe = account.classe;

      if (
        code === '200000' &&
        (!label.includes('immobilis'))
      ) {
        return;
      }

      const resultatPath = resolveResultatPath(account);
      if (resultatPath) {
        addAccountToPath(resultatPath, account);
        return;
      }

      if (classe === 1) {
        if (code.startsWith('10')) {
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Situation nette', 'Capital'], account);
          return;
        }
        if (code.startsWith('11')) {
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Situation nette', 'RÃ©serves'], account);
          return;
        }
        if (code.startsWith('12')) {
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Situation nette', 'Report Ã  nouveau'], account);
          return;
        }
        if (code.startsWith('13')) {
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Situation nette', 'RÃ©sultat de lâ€™exercice'], account);
          return;
        }
        if (code.startsWith('14')) {
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Subventions dâ€™Ã©quipement'], account);
          return;
        }
        if (code.startsWith('15')) {
          if (label.includes('rÃ©Ã©valuation') || label.includes('reevaluation')) {
            addAccountToPath(['PASSIF', 'Capitaux propres', 'Ã‰cart de rÃ©Ã©valuation'], account);
          } else {
            addAccountToPath(['PASSIF', 'Capitaux propres', 'Provisions rÃ©glementÃ©es'], account);
          }
          return;
        }
        if (code.startsWith('16') || code.startsWith('17')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Emprunts et dettes Ã  long et moyen terme'], account);
          return;
        }
        if (code.startsWith('18')) {
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Compte de liaison des succursales'], account);
          return;
        }
        if (code.startsWith('19')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Provisions pour risques et charges'], account);
          return;
        }
        addAccountToPath(['PASSIF', 'Capitaux propres'], account);
        return;
      }

      if (classe === 2) {
        if (code.startsWith('28') || code.startsWith('29')) {
          const brutCode = padAccount(`${code[0]}${code.slice(2)}`);
          const brutAccount = pcmByCode.get(brutCode);
          const targetLabel = normalized(brutAccount?.label ?? account.label);
          const targetCode = brutAccount?.account ?? brutCode;
          const resolved = resolveActifPostPathNormalized(targetCode, targetLabel);
          if (resolved) {
            if (resolved.isSubTitle) {
              const isIncorp =
                resolved.path.some(
                  (segment) =>
                    segment.trim().toLowerCase() ===
                    'immobilisations incorporelles'
                );
            if (!isIncorp) {
              addAccountToVariantPath(resolved.path, account);
            }
            } else {
              addAccountToVariantPath(resolved.path, account);
            }
          }
          return;
        }
        const resolved = resolveActifPostPathNormalized(code, label);
        if (resolved) {
          if (resolved.isSubTitle) {
            addAccountToPath(resolved.path, account);
          } else {
            addAccountToVariantPath(resolved.path, account);
            addLinkedAmortDep(account, resolved.path);
          }
          return;
        }
        return;
      }

      if (classe === 3) {
        const isEnCours =
          code.startsWith('33') ||
          code.startsWith('38') ||
          label.includes('en cours') ||
          label.includes('en-cours');
        const isDepreciation =
          code.startsWith('39') || label.includes('dÃ©prÃ©ciation') || label.includes('depreciation');
        const [stocksGroup, encoursGroup] = valeursExploitation.children;
        const getVariantNode = (group: FsNode | undefined, suffix: string) => {
          if (!group) return undefined;
          const targetLabel = `${group.label} ${suffix}`;
          return group.children.find(
            (child) =>
              normalizeLabelForMatch(child.label) ===
              normalizeLabelForMatch(targetLabel)
          );
        };
        const stocksBrutNode = getVariantNode(stocksGroup, 'brut');
        const stocksDepNode = getVariantNode(stocksGroup, 'depreciation');
        const encoursBrutNode = getVariantNode(encoursGroup, 'brut');
        const encoursDepNode = getVariantNode(encoursGroup, 'depreciation');
        const pushTo = (node?: FsNode) => {
          if (!node) return;
          node.children.push(createAccountNode(account.account, account.label));
        };
        if (isDepreciation) {
          const isEnCoursDep =
            code.startsWith('393') || label.includes('en cours') || label.includes('en-cours');
          pushTo(isEnCoursDep ? encoursDepNode : stocksDepNode);
          return;
          addAccountToPath(
            ['ACTIF', 'Actif circulant', 'Valeurs dâ€™exploitation', isEnCoursDep ? 'En-cours depreciation' : 'Stocks depreciation'],
            account
          );
        } else if (isEnCours) {
          pushTo(encoursBrutNode);
          return;
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs dâ€™exploitation', 'En-cours'], account);
        } else {
          pushTo(stocksBrutNode);
          return;
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs dâ€™exploitation', 'Stocks'], account);
        }
        return;
      }

      if (classe === 4) {
        if (code.startsWith('480')) {
          regulActifCharges.children.push(createAccountNode(account.account, account.label));
          return;
        }
        if (code.startsWith('481')) {
          regulPassifProduits.children.push(createAccountNode(account.account, account.label));
          return;
        }
        if (code.startsWith('4841') || code.startsWith('484')) {
          regulActifDiff.children.push(createAccountNode(account.account, account.label));
          return;
        }
        if (code.startsWith('4840') || code.startsWith('485')) {
          regulPassifDiff.children.push(createAccountNode(account.account, account.label));
          return;
        }
        if (code.startsWith('4881')) {
          regulActifAttente.children.push(createAccountNode(account.account, account.label));
          return;
        }
        if (code.startsWith('4880')) {
          regulPassifAttente.children.push(createAccountNode(account.account, account.label));
          return;
        }
        if (code.startsWith('4881')) {
          addAccountToPath(['ACTIF', 'Comptes de rÃƒÂ©gularisation', 'Comptes dÃ¢â‚¬â„¢attente et ÃƒÂ  rÃƒÂ©gulariser'], account);
          return;
        }
        if (code.startsWith('4880')) {
          addAccountToPath(['PASSIF', 'Comptes de rÃƒÂ©gularisation', 'Comptes dÃ¢â‚¬â„¢attente et ÃƒÂ  rÃƒÂ©gulariser'], account);
          return;
        }
        if (code.startsWith('48')) {
          if (code.startsWith('480')) {
            addAccountToPath(['ACTIF', 'Comptes de rÃ©gularisation', 'Charges constatÃ©es dâ€™avance'], account);
            return;
          }
          if (code.startsWith('481')) {
            addAccountToPath(['PASSIF', 'Comptes de rÃ©gularisation', 'Produits constatÃ©s dâ€™avance'], account);
            return;
          }
          if (code.startsWith('4841')) {
            addAccountToPath(['ACTIF', 'Comptes de rÃ©gularisation', 'DiffÃ©rences de conversion - Actif'], account);
            return;
          }
          if (code.startsWith('4840')) {
            addAccountToPath(['PASSIF', 'Comptes de rÃ©gularisation', 'DiffÃ©rences de conversion - Passif'], account);
            return;
          }
          if (code.startsWith('4881')) {
            addAccountToPath(['ACTIF', 'Comptes de rÃƒÂ©gularisation', 'Comptes dÃ¢â‚¬â„¢attente et ÃƒÂ  rÃƒÂ©gulariser'], account);
            return;
          }
          if (code.startsWith('4880')) {
            addAccountToPath(['PASSIF', 'Comptes de rÃƒÂ©gularisation', 'Comptes dÃ¢â‚¬â„¢attente et ÃƒÂ  rÃƒÂ©gulariser'], account);
            return;
          }
          if (label.includes('produits constat')) {
            addAccountToPath(['PASSIF', 'Comptes de rÃ©gularisation', 'Produits constatÃ©s dâ€™avance'], account);
          } else if (label.includes('passif')) {
            addAccountToPath(['PASSIF', 'Comptes de rÃ©gularisation', 'DiffÃ©rences de conversion - Passif'], account);
          } else if (label.includes('actif')) {
            addAccountToPath(['ACTIF', 'Comptes de rÃ©gularisation', 'DiffÃ©rences de conversion - Actif'], account);
          } else {
            addAccountToPath(['ACTIF', 'Comptes de rÃ©gularisation', 'Comptes dâ€™attente et Ã  rÃ©gulariser'], account);
          }
          return;
        }

        if (code.startsWith('49')) {
          if (code.startsWith('491')) {
            addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs rÃ©alisables Ã  court terme', 'Clients et comptes rattachÃ©s depreciation'], account);
            return;
          }
          if (code.startsWith('495')) {
            addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs rÃ©alisables Ã  court terme', 'AssociÃ©s et groupe depreciation'], account);
            return;
          }
          if (code.startsWith('496')) {
            addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs rÃ©alisables Ã  court terme', 'DÃ©biteurs divers depreciation'], account);
            return;
          }
        }

        if (code.startsWith('409')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs rÃ©alisables Ã  court terme', 'Fournisseurs dÃ©biteurs'], account);
          return;
        }
        if (code.startsWith('40')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes Ã  court terme', 'Fournisseurs et comptes rattachÃ©s'], account);
          return;
        }
        if (code.startsWith('419')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes Ã  court terme', 'Clients crÃ©diteurs'], account);
          return;
        }
        if (code.startsWith('41')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs rÃ©alisables Ã  court terme', 'Clients et comptes rattachÃ©s'], account);
          return;
        }
        if (code.startsWith('42')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes Ã  court terme', 'Personnel et comptes rattachÃ©s'], account);
          return;
        }
        if (code.startsWith('43') || code.startsWith('44')) {
          addToDettesCourtTerme('etat', account);
          return;
        }
        if (code.startsWith('45')) {
          if (
            label.includes('dÃƒÂ©bit') ||
            label.includes('debit') ||
            label.includes('dÃƒÂ©biteur') ||
            label.includes('debiteur') ||
            label.includes('crÃƒÂ©ance') ||
            label.includes('creance') ||
            label.includes('avance')
          ) {
            addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs rÃƒÂ©alisables ÃƒÂ  court terme', 'AssociÃƒÂ©s et groupe'], account);
            return;
          }
        }
        if (code.startsWith('45')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes Ã  court terme', 'AssociÃ©s et groupe'], account);
          return;
        }
        if (code.startsWith('46')) {
          if (label.includes('crÃ©dit') || label.includes('crediteur') || label.includes('crÃ©diteur')) {
            addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes Ã  court terme', 'CrÃ©diteurs divers'], account);
          } else {
            addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs rÃ©alisables Ã  court terme', 'DÃ©biteurs divers'], account);
          }
          return;
        }
        return;
      }

      if (classe === 5) {
        if (code.startsWith('559')) {
          addAccountToPath(
            ['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Concours bancaires courants'],
            account
          );
          return;
        }
        if (code.startsWith('50')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes Ã  court terme', 'Emprunts Ã  court terme'], account);
          return;
        }
        if (code.startsWith('51')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs disponibles', 'PrÃªts Ã  court terme'], account);
          return;
        }
        if (code.startsWith('52')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs disponibles', 'Valeurs mobiliÃ¨res de placement'], account);
          return;
        }
        if (code.startsWith('54') || code.startsWith('55') || code.startsWith('58')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs disponibles', 'Banques'], account);
          return;
        }
        if (code.startsWith('56') || code.startsWith('57')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs disponibles', 'Caisse'], account);
          return;
        }
        return;
      }

      if (false) {
      if (classe === 3) {
        if (code.startsWith('39') || label.includes('dépréciation')) {
          if (label.includes('en cours')) {
            addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs d’exploitation', 'En-cours depreciation'], account);
          } else {
            addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs d’exploitation', 'Stocks depreciation'], account);
          }
        } else if (label.includes('en cours')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs d’exploitation', 'En-cours'], account);
        } else {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs d’exploitation', 'Stocks'], account);
        }
        return;
      }

      if (classe === 4) {
        if (code.startsWith('48')) {
          if (code.startsWith('480')) {
            addAccountToPath(['ACTIF', 'Comptes de régularisation', 'Charges constatées d’avance'], account);
          } else if (code.startsWith('4841')) {
            addAccountToPath(['ACTIF', 'Comptes de régularisation', 'Différences de conversion - Actif'], account);
          } else if (code.startsWith('4881')) {
            if (label.includes('produits constatés')) {
              addAccountToPath(['PASSIF', 'Comptes de régularisation', 'Produits constatés d’avance'], account);
            } else {
              addAccountToPath(['ACTIF', 'Comptes de régularisation', 'Comptes d’attente et à régulariser'], account);
            }
          } else if (code.startsWith('4840')) {
            addAccountToPath(['PASSIF', 'Comptes de régularisation', 'Différences de conversion - Passif'], account);
          } else if (code.startsWith('4880')) {
            addAccountToPath(['PASSIF', 'Comptes de régularisation', 'Comptes d’attente et à régulariser'], account);
          } else if (label.includes('produits constatés')) {
            addAccountToPath(['PASSIF', 'Comptes de régularisation', 'Produits constatés d’avance'], account);
          } else if (label.includes('conversion')) {
            addAccountToPath(['PASSIF', 'Comptes de régularisation', 'Différences de conversion - Passif'], account);
          } else {
            addAccountToPath(['ACTIF', 'Comptes de régularisation', 'Comptes d’attente et à régulariser'], account);
          }
          return;
        }

        if (code.startsWith('409')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs réalisables à court terme', 'Fournisseurs débiteurs'], account);
          return;
        }
        if (code.startsWith('40')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Fournisseurs et comptes rattachés'], account);
          return;
        }
        if (code.startsWith('419')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Clients créditeurs'], account);
          return;
        }
        if (code.startsWith('41')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs réalisables à court terme', 'Clients et comptes rattachés'], account);
          return;
        }
        if (code.startsWith('42')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Personnel et comptes rattachés'], account);
          return;
        }
        if (code.startsWith('43') || code.startsWith('44')) {
          addToDettesCourtTerme('etat', account);
          return;
        }
        if (code.startsWith('45')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Associés et groupe'], account);
          return;
        }
        if (code.startsWith('46')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs réalisables à court terme', 'Débiteurs divers'], account);
          return;
        }
        if (code.startsWith('49') || label.includes('dépréciation')) {
          if (label.includes('client')) {
            addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs réalisables à court terme', 'Clients et comptes rattachés depreciation'], account);
            return;
          }
          if (label.includes('associ') || label.includes('groupe')) {
            addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs réalisables à court terme', 'Associés et groupe depreciation'], account);
            return;
          }
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs réalisables à court terme', 'Débiteurs divers depreciation'], account);
          return;
        }
        return;
      }

      if (classe === 5) {
        if (code.startsWith('59') || label.includes('dépréciation')) {
          return;
        }
        if (label.includes('prêt')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs disponibles', 'Prêts à court terme'], account);
        } else if (label.includes('valeurs mobili')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs disponibles', 'Valeurs mobilières de placement'], account);
        } else if (label.includes('banque')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs disponibles', 'Banques'], account);
        } else if (label.includes('caisse')) {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs disponibles', 'Caisse'], account);
        } else {
          addAccountToPath(['ACTIF', 'Actif circulant', 'Valeurs disponibles', 'Prêts à court terme'], account);
        }
        return;
      }

      if (classe === 1) {
        if (code.startsWith('10') || code.startsWith('11') || code.startsWith('12') || code.startsWith('13')) {
          if (label.includes('capital') || label.includes('prime') || label.includes('fonds de dotation') || label.includes('exploitant')) {
            addAccountToPath(['PASSIF', 'Capitaux propres', 'Situation nette', 'Capital'], account);
            return;
          }
          if (label.includes('réserve')) {
            addAccountToPath(['PASSIF', 'Capitaux propres', 'Situation nette', 'Réserves'], account);
            return;
          }
          if (label.includes('report')) {
            addAccountToPath(['PASSIF', 'Capitaux propres', 'Situation nette', 'Report à nouveau'], account);
            return;
          }
          if (label.includes('résultat')) {
            addAccountToPath(['PASSIF', 'Capitaux propres', 'Situation nette', 'Résultat de l’exercice'], account);
            return;
          }
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Situation nette'], account);
          return;
        }
        if (code.startsWith('14')) {
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Subventions d’équipement'], account);
          return;
        }
        if (code.startsWith('15')) {
          if (label.includes('réévaluation')) {
            addAccountToPath(['PASSIF', 'Capitaux propres', 'Écart de réévaluation'], account);
            return;
          }
          if (label.includes('provision spéciale')) {
            addAccountToPath(['PASSIF', 'Capitaux propres', 'Provision spéciale de réévaluation'], account);
            return;
          }
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Provisions réglementées'], account);
          return;
        }
        if (code.startsWith('16')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Emprunts et dettes à long et moyen terme'], account);
          return;
        }
        if (code.startsWith('17') || label.includes('participation')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Emprunts et dettes à long et moyen terme'], account);
          return;
        }
        if (code.startsWith('18')) {
          addAccountToPath(['PASSIF', 'Capitaux propres', 'Compte de liaison des succursales'], account);
          return;
        }
        if (code.startsWith('19')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Provisions pour risques et charges'], account);
          return;
        }
        if (label.includes('fournisseur')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Fournisseurs et comptes rattachés'], account);
          return;
        }
        if (label.includes('client')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Clients créditeurs'], account);
          return;
        }
        if (label.includes('personnel')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Personnel et comptes rattachés'], account);
          return;
        }
        if (label.includes('état') || label.includes('collect') || label.includes('organisme')) {
          addToDettesCourtTerme('etat', account);
          return;
        }
        if (label.includes('associ') || label.includes('groupe')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Associés et groupes'], account);
          return;
        }
        if (label.includes('créditeur')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Créditeurs divers'], account);
          return;
        }
        if (label.includes('emprunt')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Emprunts à court terme'], account);
          return;
        }
        if (label.includes('bancaire') || label.includes('banque')) {
          addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme', 'Concours bancaires courants'], account);
          return;
        }
        addAccountToPath(['PASSIF', 'Emprunts et dettes', 'Dettes à court terme'], account);
        return;
      }

      }
    });

    const ensureSubventionAccount = (code: string, label: string) => {
      const target = findNodeByLabelPath(rootNodes, [
        'PASSIF',
        'Capitaux propres',
        'Subventions d’équipement',
      ]);
      if (!target) return;
      const padded = padAccount(code);
      const exists = target.children.some(
        (child) => child.kind === 'account' && padAccount(child.code ?? '') === padded
      );
      if (exists) return;
      const pcmAccount = pcmByCode.get(padded);
      target.children.push(
        createAccountNode(padded, pcmAccount?.label ?? label)
      );
    };

    ensureSubventionAccount(
      '140',
      'Subvention d’équipement reçues'
    );
    ensureSubventionAccount(
      '149',
      'Subvention d’équipement inscrites au comptes de résultat (solde débiteur)'
    );

    return rootNodes;
  };

  const shouldRebuildPcmTree = (nodes: FsNode[]) => {
    let needs = false;
    const walk = (items: FsNode[], path: string[]) => {
      items.forEach((node) => {
        const label = node.label.trim().toLowerCase();
        const inImmobilise = path.some((segment) =>
          segment.trim().toLowerCase().includes('actif immobilisé')
        );
        if (!inImmobilise && (label.includes('amortissement') || label.endsWith(' brut'))) {
          needs = true;
        }
        if (label.includes('fournisseurs débiteurs brut') || label.includes('clients créditeurs brut')) {
          needs = true;
        }
        walk(node.children, [...path, node.label]);
      });
    };
    walk(nodes, []);
    return needs;
  };

  const getAssignedAccounts = (nodes: FsNode[]): Set<string> => {
    const set = new Set<string>();
    const walk = (items: FsNode[]) => {
      items.forEach((node) => {
        node.accounts.forEach((acc) => set.add(acc));
        walk(node.children);
      });
    };
    walk(nodes);
    return set;
  };

  const unassignedFsAccounts = useMemo(() => {
    if (!fsStructure) return mappingSourceUniqueRows;
    const assigned = getAssignedAccounts(fsStructure.tree);
    return mappingSourceUniqueRows.filter((row) => row.account && !assigned.has(row.account));
  }, [mappingSourceUniqueRows, fsStructure]);

  const accountNodeCount = useMemo(() => {
    if (!fsStructure) return 0;
    let count = 0;
    const walk = (nodes: FsNode[]) => {
      nodes.forEach((node) => {
        if (node.kind === 'account') count += 1;
        walk(node.children);
      });
    };
    walk(fsStructure.tree);
    return count;
  }, [fsStructure]);

  const normalizeBalance = (value: number) => value;

  const sumBalancesForAccounts = (accounts: Set<string>) => {
    let n = 0;
    let n1 = 0;
    accounts.forEach((account) => {
      const nRow = balanceNByAccount.get(account);
      const n1Row = balanceN1ByAccount.get(account);
      n += normalizeBalance(nRow?.balance ?? 0);
      n1 += normalizeBalance(n1Row?.balance ?? 0);
    });
    return { n, n1 };
  };

  const sumBalancesForPrefix = (code: string) => {
    let prefix = code;
    while (prefix.endsWith('0') && prefix.length > 3) {
      prefix = prefix.slice(0, -1);
    }
    let n = 0;
    let n1 = 0;
    balanceAccountCodes.forEach((accountCode) => {
      if (!accountCode.startsWith(prefix)) return;
      const nRow = balanceNByAccount.get(accountCode);
      const n1Row = balanceN1ByAccount.get(accountCode);
      n += normalizeBalance(nRow?.balance ?? 0);
      n1 += normalizeBalance(n1Row?.balance ?? 0);
    });
    return { n, n1 };
  };

  const updateTotals = (
    node: FsNode,
    rootLabel: string
  ): { node: FsNode; accounts: Set<string> } => {
    const childResults = node.children.map((child) =>
      updateTotals(child, rootLabel)
    );
    const ownAccounts = new Set(node.accounts);
    if (node.kind === 'account' && node.code) {
      ownAccounts.add(node.code);
    }
    const accountSet = new Set(ownAccounts);
    childResults.forEach((result) => {
      result.accounts.forEach((account) => accountSet.add(account));
    });
    let ownTotals = sumBalancesForAccounts(ownAccounts);
    if (node.kind === 'account' && node.code && node.accounts.length === 0) {
      ownTotals = sumBalancesForAccounts([node.code]);
    }
    const childTotals = childResults.reduce(
      (acc, result) => ({
        n: acc.n + result.node.totalN,
        n1: acc.n1 + result.node.totalN1,
      }),
      { n: 0, n1: 0 }
    );
    const totals = {
      n: ownTotals.n + childTotals.n,
      n1: ownTotals.n1 + childTotals.n1,
    };
    return {
      node: {
        ...node,
        totalN: totals.n,
        totalN1: totals.n1,
        children: childResults.map((result) => result.node),
      },
      accounts: accountSet,
    };
  };

  const fsTreeWithTotals = useMemo(() => {
    if (!fsStructure) return null;
    return fsStructure.tree.map((node) =>
      updateTotals(node, node.label).node
    );
  }, [fsStructure, balanceNByAccount, balanceN1ByAccount, balanceAccountCodes]);

  const statusTreeSource = balanceMappingTree ?? fsStructure?.tree ?? null;
  const statusTreeWithTotals = useMemo(() => {
    if (!statusTreeSource) return null;
    return statusTreeSource.map((node) =>
      updateTotals(node, node.label).node
    );
  }, [statusTreeSource, balanceNByAccount, balanceN1ByAccount, balanceAccountCodes]);

  const findNodeByLabel = (nodes: FsNode[], label: string) =>
    nodes.find(
      (node) => node.label.trim().toLowerCase() === label.trim().toLowerCase()
    );

  const fsActif = useMemo(() => {
    if (!statusTreeWithTotals) return null;
    return findNodeByLabel(statusTreeWithTotals, 'ACTIF');
  }, [statusTreeWithTotals]);

  const fsPassif = useMemo(() => {
    if (!statusTreeWithTotals) return null;
    return findNodeByLabel(statusTreeWithTotals, 'PASSIF');
  }, [statusTreeWithTotals]);

  const fsResultat = useMemo(() => {
    if (!statusTreeWithTotals) return null;
    return findNodeByLabel(statusTreeWithTotals, 'RESULTAT');
  }, [statusTreeWithTotals]);

  const getDisplayTotals = (node: FsNode, absDisplay: boolean) => {
    const base = { n: node.totalN ?? 0, n1: node.totalN1 ?? 0 };
    if (!absDisplay) return base;
    return { n: Math.abs(base.n), n1: Math.abs(base.n1) };
  };

  const fsActifAbsTotals = useMemo(
    () => (fsActif ? getDisplayTotals(fsActif, true) : { n: 0, n1: 0 }),
    [fsActif]
  );

  const fsPassifAbsTotals = useMemo(
    () => (fsPassif ? getDisplayTotals(fsPassif, true) : { n: 0, n1: 0 }),
    [fsPassif]
  );

  const resultTotals = useMemo(() => {
    if (!fsResultat) return { n: 0, n1: 0 };
    return getDisplayTotals(fsResultat, false);
  }, [fsResultat]);

  const balanceNet = useMemo(() => {
    const rows = [...balanceN, ...balanceN1];
    return rows.reduce((acc, row) => acc + (row.balance ?? 0), 0);
  }, [balanceN, balanceN1]);
  const isBalanced = Math.abs(balanceNet) < 0.0001;
  const balanceAccountSet = useMemo(
    () => new Set(mappingSourceUniqueRows.map((row) => row.account).filter(Boolean)),
    [mappingSourceUniqueRows]
  );
  const mappedCount = useMemo(() => {
    const tree = balanceMappingTree ?? fsStructure?.tree;
    if (!tree) return 0;
    const assigned = getAssignedAccounts(tree);
    let count = 0;
    assigned.forEach((account) => {
      if (balanceAccountSet.has(account)) count += 1;
    });
    return count;
  }, [balanceMappingTree, fsStructure, balanceAccountSet]);
  const totalAccounts = mappingSourceUniqueRows.length;
  const currentTemplateLabel = fsTemplateName
    ?? (fsStructure?.template === 'bumex_pcm' ? 'BUMEX PCM' : 'Manual');

  const renderFsNode = (node: FsNode, depth = 0, absDisplay = false) => {
    if (depth === 0) {
      return (
        <div key={`${node.id}-${depth}`} className="space-y-1">
          {node.children.map((child) => renderFsNode(child, depth + 1, absDisplay))}
        </div>
      );
    }
    const nodeTotals = getDisplayTotals(node, absDisplay);
    const displayN1 = nodeTotals.n1;
    const displayN = nodeTotals.n;
    return (
      <div key={`${node.id}-${depth}`} className="space-y-1">
        <div
          className="grid items-center gap-6 rounded-md border border-slate-200/70 bg-white px-2 py-1.5 text-sm shadow-sm transition-colors hover:bg-slate-50"
          style={{ paddingLeft: depth * 12, gridTemplateColumns: 'minmax(0,1fr) 110px 110px' }}
        >
          <span className="truncate">{node.label}</span>
          <span className="text-right text-xs text-muted-foreground tabular-nums">
            {formatBalanceValue(displayN1)}
          </span>
          <span className="text-right font-medium tabular-nums">
            {formatBalanceValue(displayN)}
          </span>
        </div>
        {node.children.length > 0 && (
          <div className="space-y-1">
            {node.children.map((child) => renderFsNode(child, depth + 1, absDisplay))}
          </div>
        )}
      </div>
    );
  };

  const saveFsStructure = async (
    next: { template: 'bumex_pcm' | 'manual'; tree: FsNode[] },
    meta?: { templateName?: string | null; templateId?: string | null }
  ) => {
    if (!projectId) return;
    const structurePath = `projects/${projectId}/knowledge_base/financial_statements`;
    await setDoc(
      doc(db, structurePath),
      {
        ...next,
        templateName: meta?.templateName ?? null,
        templateId: meta?.templateId ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const setStructureAndSave = async (
    template: 'bumex_pcm' | 'manual',
    tree: FsNode[],
    meta?: { templateName?: string | null; templateId?: string | null }
  ) => {
    const next = { template, tree };
    setFsStructure(next);
    const templateName = meta?.templateName ?? fsTemplateName ?? null;
    const templateId = meta?.templateId ?? fsTemplateId ?? null;
    await saveFsStructure(next, { templateName, templateId });
  };

  useEffect(() => {
    if (!fsStructure || fsStructure.template !== 'bumex_pcm') return;
    if (pcmAutoRebuildRef.current) return;
    pcmAutoRebuildRef.current = true;
    if (!shouldRebuildPcmTree(fsStructure.tree)) return;
    const nextTree = buildPcmStructure();
    void setStructureAndSave('bumex_pcm', nextTree);
  }, [fsStructure]);

  const handleChoosePcm = async () => {
    const tree = buildPcmStructure();
    setShowManualMapping(false);
    setAutoMapMessage(null);
    setFsTemplateName(null);
    setFsTemplateId(null);
    await setStructureAndSave('bumex_pcm', tree, {
      templateName: null,
      templateId: null,
    });
  };

  const handleChooseManual = async () => {
    const name = window.prompt('Template name');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const tree = [
      createNode('ACTIF'),
      createNode('PASSIF'),
      createNode('RESULTAT'),
    ];
    setShowManualMapping(false);
    setAutoMapMessage(null);
    setFsTemplateName(trimmed);
    setFsTemplateId(null);
    await setStructureAndSave('manual', tree, {
      templateName: trimmed,
      templateId: null,
    });
  };

  const handleSwitchToPcm = async () => {
    if (!window.confirm('Remplacer la structure actuelle par BUMEX PCM ?')) {
      return;
    }
    await handleChoosePcm();
  };

  const handleSwitchToManual = async () => {
    if (!window.confirm('Remplacer la structure actuelle par une structure manuelle ?')) {
      return;
    }
    await handleChooseManual();
  };

  const handleSaveTemplate = async () => {
    if (!projectId || !fsStructure || fsStructure.template !== 'manual') return;
    const name =
      fsTemplateName?.trim() ||
      window.prompt('Template name');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const templatesPath = `projects/${projectId}/knowledge_base/fs_templates`;
    const existing = fsTemplates.find(
      (template) => template.name.toLowerCase() === trimmed.toLowerCase()
    );
    const docRef = existing
      ? doc(db, templatesPath, existing.id)
      : doc(collection(db, templatesPath));
    await setDoc(
      docRef,
      {
        name: trimmed,
        tree: fsStructure.tree,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    const nextId = docRef.id;
    setFsTemplateName(trimmed);
    setFsTemplateId(nextId);
    setFsTemplates((prev) => {
      const without = prev.filter((template) => template.id !== nextId);
      return [...without, { id: nextId, name: trimmed, tree: fsStructure.tree }]
        .sort((a, b) => a.name.localeCompare(b.name));
    });
    await setStructureAndSave('manual', fsStructure.tree, {
      templateName: trimmed,
      templateId: nextId,
    });
  };

  const handleSelectTemplate = async (value: string) => {
    if (value === 'pcm') {
      await handleChoosePcm();
      return;
    }
    const template = fsTemplates.find((item) => item.id === value);
    if (!template) return;
    setFsTemplateName(template.name);
    setFsTemplateId(template.id);
    await setStructureAndSave('manual', template.tree, {
      templateName: template.name,
      templateId: template.id,
    });
  };

  const updateTreeById = (
    nodes: FsNode[],
    nodeId: string,
    updater: (node: FsNode) => FsNode
  ): FsNode[] =>
    nodes.map((node) => {
      if (node.id === nodeId) {
        return updater(node);
      }
      return { ...node, children: updateTreeById(node.children, nodeId, updater) };
    });

  const removeNodeById = (nodes: FsNode[], nodeId: string): FsNode[] =>
    nodes
      .filter((node) => node.id !== nodeId)
      .map((node) => ({
        ...node,
        children: removeNodeById(node.children, nodeId),
      }));

  const findNodeById = (nodes: FsNode[], nodeId: string): FsNode | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      const child = findNodeById(node.children, nodeId);
      if (child) return child;
    }
    return null;
  };

  const removeAccountFromTree = (nodes: FsNode[], account: string): FsNode[] =>
    nodes.map((node) => ({
      ...node,
      accounts: node.accounts.filter((acc) => acc !== account),
      children: removeAccountFromTree(node.children, account),
    }));

  const clearAssignedAccounts = (nodes: FsNode[]): FsNode[] =>
    nodes.map((node) => ({
      ...node,
      accounts: [],
      children: clearAssignedAccounts(node.children),
    }));

  const getNodeDepth = (nodes: FsNode[], nodeId: string, depth = 0): number | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return depth;
      const found = getNodeDepth(node.children, nodeId, depth + 1);
      if (found !== null) return found;
    }
    return null;
  };

  const handleAddChild = async (
    nodeId: string,
    kindLabel?: string,
    allowedParentDepths?: number[]
  ) => {
    if (!fsStructure) return;
    if (allowedParentDepths && fsStructure.template === 'manual') {
      const depth = getNodeDepth(fsStructure.tree, nodeId);
      if (depth === null || !allowedParentDepths.includes(depth)) {
        window.alert('Invalid placement for this block type.');
        return;
      }
    }
    const promptLabel = kindLabel ? `Name of the ${kindLabel}` : 'Sub-block name';
    const label = window.prompt(promptLabel);
    if (!label) return;
    const nextTree = updateTreeById(fsStructure.tree, nodeId, (node) => ({
      ...node,
      children: [...node.children, createNode(label)],
    }));
    await setStructureAndSave(fsStructure.template, nextTree);
  };

  const handleAddAccountToGroup = async (nodeId: string) => {
    if (!fsStructure) return;
    if (fsStructure.template === 'manual') {
      const depth = getNodeDepth(fsStructure.tree, nodeId);
      if (depth === null || (depth !== 2 && depth !== 3)) {
        window.alert('Accounts must be added under a subtitle or a post.');
        return;
      }
    }
    const codeRaw = window.prompt('Account code (ex: 2100)');
    if (!codeRaw) return;
    const label = window.prompt('Account label');
    if (!label) return;
    const code = padAccount(codeRaw);
    const nextTree = updateTreeById(fsStructure.tree, nodeId, (node) => ({
      ...node,
      children: [...node.children, createAccountNode(code, label)],
    }));
    await setStructureAndSave(fsStructure.template, nextTree);
  };

  const collectAccountCodes = (nodes: FsNode[], acc = new Set<string>()) => {
    nodes.forEach((node) => {
      if (node.kind === 'account' && node.code) {
        acc.add(node.code);
      }
      node.accounts.forEach((account) => acc.add(account));
      if (node.children.length) {
        collectAccountCodes(node.children, acc);
      }
    });
    return acc;
  };

  const openPcmLibrary = (nodeId: string) => {
    setPcmLibraryTargetId(nodeId);
    setPcmLibrarySelected(new Set());
    setPcmLibraryQuery('');
    setPcmLibraryOpen(true);
  };

  const togglePcmLibraryAccount = (code: string) => {
    setPcmLibrarySelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const applyPcmLibrarySelection = async () => {
    if (!fsStructure || !pcmLibraryTargetId) {
      setPcmLibraryOpen(false);
      return;
    }
    const selected = Array.from(pcmLibrarySelected);
    if (!selected.length) {
      setPcmLibraryOpen(false);
      return;
    }
    const existing = collectAccountCodes(fsStructure.tree);
    const missing: string[] = [];
    const nodesToAdd: FsNode[] = [];
    selected.forEach((code) => {
      const account = pcmByCode.get(code);
      if (!account) {
        missing.push(code);
        return;
      }
      if (existing.has(code)) return;
      nodesToAdd.push(createAccountNode(account.account, account.label));
    });
    if (missing.length) {
      window.alert(`Account(s) not found in PCM: ${missing.join(', ')}`);
    }
    if (!nodesToAdd.length) {
      setPcmLibraryOpen(false);
      return;
    }
    const nextTree = updateTreeById(fsStructure.tree, pcmLibraryTargetId, (node) => ({
      ...node,
      children: [...node.children, ...nodesToAdd],
    }));
    await setStructureAndSave(fsStructure.template, nextTree);
    setPcmLibraryOpen(false);
  };


  const handleRenameNode = async (nodeId: string, current: string) => {
    if (!fsStructure) return;
    const label = window.prompt('Nouveau nom', current);
    if (!label) return;
    const nextTree = updateTreeById(fsStructure.tree, nodeId, (node) => ({
      ...node,
      label,
    }));
    await setStructureAndSave(fsStructure.template, nextTree);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!fsStructure) return;
    const nextTree = removeNodeById(fsStructure.tree, nodeId);
    await setStructureAndSave(fsStructure.template, nextTree);
  };

  const handleAssignAccount = async (nodeId: string, account: string) => {
    if (!fsStructure) return;
    const target = findNodeById(fsStructure.tree, nodeId);
    if (!target || target.kind !== 'account') return;
    const cleanedTree = removeAccountFromTree(fsStructure.tree, account);
    const nextTree = updateTreeById(cleanedTree, nodeId, (node) => ({
      ...node,
      accounts: node.accounts.includes(account)
        ? node.accounts
        : [...node.accounts, account],
    }));
    await setStructureAndSave(fsStructure.template, nextTree);
  };

  const handleRemoveAccount = async (nodeId: string, account: string) => {
    if (!fsStructure) return;
    const nextTree = updateTreeById(fsStructure.tree, nodeId, (node) => ({
      ...node,
      accounts: node.accounts.filter((acc) => acc !== account),
    }));
    await setStructureAndSave(fsStructure.template, nextTree);
  };

  const findNodeByCode = (nodes: FsNode[], code: string): FsNode | null => {
    for (const node of nodes) {
      if (node.kind === 'account' && node.code === code) {
        return node;
      }
      const child = findNodeByCode(node.children, code);
      if (child) return child;
    }
    return null;
  };

  const readMappingSheet = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = findSheetName(workbook.SheetNames, 'Mapping');
    if (!sheetName) {
      throw new Error('Missing sheet: Mapping');
    }
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
    });
    return rawRows.map(normalizeRowKeys);
  };

  /* const exportBalanceMappingLegacy = () => {
    if (!fsStructure) return;
    const instructions = [
      ['Documentation (FR) - Balance Mapping'],
      [''],
      ['Objectif'],
      [
        "Mapper les sous-comptes Excel (balance) vers les comptes standards PCM.",
      ],
      [''],
      ['Onglet obligatoire: Mapping'],
      ['Colonnes obligatoires:'],
      ['- excel_account (obligatoire)'],
      ['- fs_account_code (obligatoire)'],
      ['Colonnes facultatives:'],
      ['- excel_label'],
      ['- fs_account_label'],
      [''],
      ['Règles importantes'],
      ['- 1 ligne = 1 sous-compte Excel rattaché à 1 compte PCM.'],
      ['- Conserver les codes en texte pour garder les zéros.'],
      ['- L’import fusionne avec l’existant (ne supprime pas).'],
      [''],
      ['Lexique'],
      ['- excel_account: compte issu du fichier Excel de balance.'],
      ['- fs_account_code: compte standard PCM.'],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    applySheetTheme(instructionsSheet, 0, 1);
    setSheetColumns(instructionsSheet, [90]);
    applySheetTheme(instructionsSheet, 0, 1);
    setSheetColumns(instructionsSheet, [90]);

    const rows: Array<{
      excel_account: string;
      excel_label: string;
      fs_account_code: string;
      fs_account_label: string;
    }> = [];
    const walk = (nodes: FsNode[]) => {
      nodes.forEach((node) => {
        if (node.kind === 'account' && node.code && node.accounts.length > 0) {
          const prefix = `${node.code} - `;
          const fsLabel = node.label.startsWith(prefix)
            ? node.label.slice(prefix.length)
            : node.label;
          node.accounts.forEach((account) => {
            rows.push({
              excel_account: account,
              excel_label: balanceLabelByAccount.get(account) ?? '',
              fs_account_code: node.code as string,
              fs_account_label: fsLabel,
            });
          });
        }
        walk(node.children);
      });
    };
    walk(fsStructure.tree);
    const header = [
      'excel_account',
      'excel_label',
      'fs_account_code',
      'fs_account_label',
    ];
    const templateSheet = XLSX.utils.aoa_to_sheet([header]);
    if (rows.length) {
      XLSX.utils.sheet_add_json(templateSheet, rows, {
        header,
        skipHeader: true,
        origin: -1,
      });
    }
    applySheetTheme(templateSheet, 0, header.length);
    setSheetColumns(templateSheet, [18, 40, 24]);
    applySheetTheme(templateSheet, 0, header.length);
    setSheetColumns(templateSheet, [18, 40, 18, 40]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Documentation');
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Mapping');
    XLSX.writeFile(workbook, 'balance_mapping.xlsx');
  }; */

  const exportBalanceMapping = async () => {
    if (!fsStructure) return;
    const workbook = new ExcelJS.Workbook();
    const docSheet = workbook.addWorksheet('Documentation');
    docSheet.columns = [{ width: 90 }];
    docSheet.addRow(['📘 Documentation (FR) - Balance Mapping']).font = {
      bold: true,
      size: 14,
      color: { argb: 'FF1F4E79' },
    };
    docSheet.addRow([]);
    docSheet.addRow(['🎯 Objectif']).font = { bold: true };
    docSheet.addRow([
      'Mapper les sous-comptes Excel (balance) vers les comptes standards PCM.',
    ]);
    docSheet.addRow([]);
    docSheet.addRow(['✅ Onglet obligatoire: Mapping']);
    docSheet.addRow(['✅ Colonnes obligatoires (toutes):']);
    docSheet.addRow(['- excel_account (obligatoire)']);
    docSheet.addRow(['- excel_label (obligatoire)']);
    docSheet.addRow(['- fs_account_code (obligatoire)']);
    docSheet.addRow(['- fs_account_label (obligatoire)']);
    docSheet.addRow([]);
    docSheet.addRow(['⚠️ Règles importantes']).font = { bold: true };
    docSheet.addRow(['- 1 ligne = 1 sous-compte Excel rattaché à 1 compte PCM.']);
    docSheet.addRow(['- Conserver les codes en texte pour garder les zéros.']);
    docSheet.addRow(['- L’import fusionne avec l’existant (ne supprime pas).']);
    docSheet.addRow([]);
    docSheet.addRow(['📚 Lexique']).font = { bold: true };
    docSheet.addRow(['- excel_account: compte issu du fichier Excel de balance.']);
    docSheet.addRow(['- excel_label: libellé du compte Excel.']);
    docSheet.addRow(['- fs_account_code: compte standard PCM.']);
    docSheet.addRow(['- fs_account_label: libellé du compte PCM.']);

    const rows: Array<{
      excel_account: string;
      excel_label: string;
      fs_account_code: string;
      fs_account_label: string;
    }> = [];
    const walk = (nodes: FsNode[]) => {
      nodes.forEach((node) => {
        if (node.kind === 'account' && node.code && node.accounts.length > 0) {
          const prefix = `${node.code} - `;
          const fsLabel = node.label.startsWith(prefix)
            ? node.label.slice(prefix.length)
            : node.label;
          node.accounts.forEach((account) => {
            rows.push({
              excel_account: account,
              excel_label: balanceLabelByAccount.get(account) ?? '',
              fs_account_code: node.code as string,
              fs_account_label: fsLabel,
            });
          });
        }
        walk(node.children);
      });
    };
    walk(fsStructure.tree);

    const mapSheet = workbook.addWorksheet('Mapping');
    mapSheet.columns = [
      { header: 'excel_account', key: 'excel_account', width: 20 },
      { header: 'excel_label', key: 'excel_label', width: 40 },
      { header: 'fs_account_code', key: 'fs_account_code', width: 20 },
      { header: 'fs_account_label', key: 'fs_account_label', width: 40 },
    ];
    mapSheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
    applyHeaderStyle(mapSheet.getRow(1), 4);
    rows.forEach((row) => mapSheet.addRow(row));
    mapSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        applyZebra(row, 4);
      }
    });
    applyVerticalBorders(mapSheet, 4, rows.length + 1);
    docSheet.views = [{ showGridLines: false }];

    const libSheet = workbook.addWorksheet('Library');
    libSheet.columns = [
      { header: 'account_code', key: 'account_code', width: 20 },
      { header: 'account_label', key: 'account_label', width: 50 },
    ];
    libSheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
    applyHeaderStyle(libSheet.getRow(1), 2);
    pcmList.forEach((item) => {
      libSheet.addRow({
        account_code: item.account,
        account_label: item.label,
      });
    });
    libSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        applyZebra(row, 2);
      }
    });
    applyVerticalBorders(libSheet, 2, pcmList.length + 1);

    await downloadExcel(workbook, 'balance_mapping.xlsx');
  };

  const importBalanceMapping = async (file: File) => {
    if (!fsStructure) return;
    setBalanceImportError(null);
    setBalanceImportMessage(null);
    try {
      const rows = await readMappingSheet(file);
      let nextTree = fsStructure.tree;
      let applied = 0;
      const skipped: string[] = [];
      rows.forEach((row) => {
        const excelAccount = String(row.excel_account ?? '').trim();
        const fsCodeRaw = String(row.fs_account_code ?? '').trim();
        if (!excelAccount || !fsCodeRaw) return;
        const fsCode = padAccount(fsCodeRaw);
        const target = findNodeByCode(nextTree, fsCode);
        if (!target) {
          skipped.push(excelAccount);
          return;
        }
        nextTree = removeAccountFromTree(nextTree, excelAccount);
        nextTree = updateTreeById(nextTree, target.id, (node) => ({
          ...node,
          accounts: node.accounts.includes(excelAccount)
            ? node.accounts
            : [...node.accounts, excelAccount],
        }));
        applied += 1;
      });
      await setStructureAndSave(fsStructure.template, nextTree);
      setBalanceImportMessage(
        `Imported ${applied} mappings.` +
          (skipped.length ? ` Skipped ${skipped.length} rows.` : '')
      );
    } catch (error) {
      setBalanceImportError((error as Error).message);
    }
  };

  const handleFsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (!activeId.startsWith('fs-account:') || !overId.startsWith('fs-node:')) {
      return;
    }
    const account = activeId.replace('fs-account:', '');
    const nodeId = overId.replace('fs-node:', '');
    if (!account || !nodeId) return;
    await handleAssignAccount(nodeId, account);
  };

  const toggleNodeCollapsed = (nodeKey: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeKey)) {
        next.delete(nodeKey);
      } else {
        next.add(nodeKey);
      }
      return next;
    });
  };

  const handleAutoMap = async () => {
    if (!fsStructure) return;
    if (fsStructure.template !== 'bumex_pcm') {
      const ok = window.confirm(
        'Auto mapping will use BUMEX PCM for Trial Balance status only. Continue?'
      );
      if (!ok) return;
    }
    setShowManualMapping(false);
    setAutoMapMessage(null);
    let baseTree =
      fsStructure.template === 'bumex_pcm' ? fsStructure.tree : buildPcmStructure();
    const allNodes: FsNode[] = [];
    const walk = (nodes: FsNode[]) => {
      nodes.forEach((node) => {
        allNodes.push(node);
        walk(node.children);
      });
    };
    baseTree = clearAssignedAccounts(baseTree);
    walk(baseTree);

    const findNodeByLabelPath = (nodes: FsNode[], path: string[]): FsNode | null => {
      if (path.length === 0) return null;
      let current: FsNode | undefined;
      let list = nodes;
      for (const label of path) {
        current = list.find(
          (node) => node.label.trim().toLowerCase() === label.trim().toLowerCase()
        );
        if (!current) return null;
        list = current.children;
      }
      return current || null;
    };

    let reservesFallbackNode: FsNode | null = null;
    const reservesNode = findNodeByLabelPath(baseTree, [
      'PASSIF',
      'Capitaux propres',
      'Situation nette',
      'Réserves',
    ]);
    if (reservesNode) {
      reservesFallbackNode =
        reservesNode.children.find(
          (child) => child.kind === 'account' && child.code === '870000'
        ) ?? null;
      if (!reservesFallbackNode) {
        reservesFallbackNode = createAccountNode('870000', '870000');
        reservesNode.children.push(reservesFallbackNode);
      }
    }

    const targetNodes = allNodes.filter((node) => node.kind === 'account' && node.code);
    const targets = targetNodes
      .map((node) => {
        const code = node.code as string;
        const normalized = code.replace(/0+$/, '');
        return { code, prefix: normalized.length ? normalized : code, id: node.id };
      })
      .sort((a, b) => b.prefix.length - a.prefix.length);

    const allBalanceAccounts = mappingSourceUniqueRows
      .map((row) => row.account)
      .filter(Boolean);

    let nextTree = baseTree;
    allBalanceAccounts.forEach((account) => {
      if (account === '870000' && reservesFallbackNode) {
        nextTree = removeAccountFromTree(nextTree, account);
        nextTree = updateTreeById(nextTree, reservesFallbackNode.id, (node) => ({
          ...node,
          accounts: node.accounts.includes(account)
            ? node.accounts
            : [...node.accounts, account],
        }));
        return;
      }
      const target = targets.find((t) => account.startsWith(t.prefix));
      if (!target) return;
      nextTree = removeAccountFromTree(nextTree, account);
      nextTree = updateTreeById(nextTree, target.id, (node) => ({
        ...node,
        accounts: node.accounts.includes(account)
          ? node.accounts
          : [...node.accounts, account],
      }));
    });

    const getRootLabelForAccount = (account: string) => {
      const first = account.trim()[0];
      if (!first) return 'ACTIF';
      if (first === '6' || first === '7' || first === '0' || first === '8') return 'RESULTAT';
      if (first === '1') return 'PASSIF';
      return 'ACTIF';
    };

    const ensureFallbackAccount = (
      nodes: FsNode[],
      rootLabel: string,
      account: string
    ): FsNode[] => {
      const root = nodes.find(
        (node) => node.label.trim().toLowerCase() === rootLabel.toLowerCase()
      );
      if (!root) return nodes;
      const fallbackCode = `NC-${rootLabel}`;
      const fallbackLabel = `Unclassified accounts (${rootLabel})`;
      const existingFallback = root.children.find(
        (child) => child.kind === 'account' && child.code === fallbackCode
      );
      if (!existingFallback) {
        const fallbackNode = createAccountNode(fallbackCode, fallbackLabel);
        const withFallback = updateTreeById(nodes, root.id, (node) => ({
          ...node,
          children: [...node.children, fallbackNode],
        }));
        return updateTreeById(withFallback, fallbackNode.id, (node) => ({
          ...node,
          accounts: node.accounts.includes(account)
            ? node.accounts
            : [...node.accounts, account],
        }));
      }
      return updateTreeById(nodes, existingFallback.id, (node) => ({
        ...node,
        accounts: node.accounts.includes(account)
          ? node.accounts
          : [...node.accounts, account],
      }));
    };

    const assignedAfterMap = getAssignedAccounts(nextTree);
    const unmappedAccounts = allBalanceAccounts.filter(
      (account) => !assignedAfterMap.has(account)
    );
    unmappedAccounts.forEach((account) => {
      nextTree = ensureFallbackAccount(
        nextTree,
        getRootLabelForAccount(account),
        account
      );
    });

    setBalanceMappingTree(nextTree);
    setAutoMapMessage('Accounts were placed into Trial Balance status.');
  };

  const renderStructureEditorNode = (
    node: FsNode,
    depth = 0,
    allowEdit = false,
    path: string[] = []
  ) => {
    const padding = depth * 12;
    const nodePath = [...path, node.label];
    const nodeKey = nodePath.join(' / ');
    const isCollapsed = collapsedNodes.has(nodeKey);
    const labelLower = node.label.trim().toLowerCase();
    const isRoot =
      labelLower === 'actif' ||
      labelLower === 'passif' ||
      labelLower === 'resultat';
    return (
      <div key={node.id} className="rounded-md border border-dashed p-2">
        <div className="space-y-2">
          <div
            className="flex items-center justify-between text-sm"
            style={{ paddingLeft: padding }}
          >
            <button
              type="button"
              className="flex items-center gap-2 text-left"
              data-no-dnd
              onClick={() => {
                if (node.kind === 'group') toggleNodeCollapsed(nodeKey);
              }}
            >
              {node.kind === 'group' && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                  aria-hidden="true"
                >
                  <ChevronRight
                    className={`h-3 w-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                  />
                </span>
              )}
              <span className="font-medium">{node.label}</span>
            </button>
    {node.kind === 'group' && allowEdit && (
      <div className="flex items-center gap-2">
        {fsStructure?.template === 'manual' && isRoot && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleAddChild(node.id, 'title', [0])}
          >
            Add title
          </button>
        )}
        {fsStructure?.template === 'manual' && depth === 1 && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleAddChild(node.id, 'subtitle', [1])}
          >
            Add subtitle
          </button>
        )}
        {fsStructure?.template === 'manual' && depth === 2 && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleAddChild(node.id, 'post', [2])}
          >
            Add post
          </button>
        )}
        {fsStructure?.template !== 'manual' && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleAddChild(node.id, isRoot ? 'title' : 'sub-block')}
          >
            Add
          </button>
        )}
        {fsStructure?.template === 'manual' && (depth === 2 || depth === 3) && (
          <>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleAddAccountToGroup(node.id)}
            >
              Add account
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => openPcmLibrary(node.id)}
            >
              Add PCM account
            </button>
          </>
        )}
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleRenameNode(node.id, node.label)}
          >
            Rename
          </button>
          <button
            type="button"
            className="text-xs text-red-500 hover:text-red-700"
            onClick={() => handleDeleteNode(node.id)}
          >
            Delete
          </button>
              </div>
            )}
    {node.kind === 'account' && allowEdit && (
      <button
        type="button"
        className="text-xs text-red-500 hover:text-red-700"
        onClick={() => handleDeleteNode(node.id)}
      >
        Remove
      </button>
    )}
          </div>
          {!isCollapsed && node.accounts.length > 0 && (
            <div className="space-y-1" style={{ paddingLeft: padding + 12 }}>
              {node.accounts.map((account) => {
                const balanceLabel = balanceLabelByAccount.get(account);
                return (
                <div
                  key={`${node.id}-${account}`}
                  className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1 text-xs"
                >
                  <span className="truncate">
                    {account}
                    {balanceLabel ? ` - ${balanceLabel}` : ''}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveAccount(node.id, account)}
                  >
                    Remove
                  </button>
                </div>
              )})}
            </div>
          )}
          {!isCollapsed && node.children.length > 0 && (
            <div className="space-y-2">
              {node.children.map((child) =>
                renderStructureEditorNode(child, depth + 1, allowEdit, nodePath)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStructureReadOnlyNode = (
    node: FsNode,
    depth = 0,
    allowRemove = false,
    path: string[] = []
  ) => {
    const padding = depth * 12;
    const nodePath = [...path, node.label];
    const nodeKey = nodePath.join(' / ');
    const isCollapsed = collapsedNodes.has(nodeKey);
    const content = (
      <div className="space-y-2">
        <div
          className="flex items-center justify-between text-sm"
          style={{ paddingLeft: padding }}
        >
          <button
            type="button"
            className="flex items-center gap-2 text-left"
            data-no-dnd
            onClick={() => {
              if (node.kind === 'group') toggleNodeCollapsed(nodeKey);
            }}
          >
            {node.kind === 'group' && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                aria-hidden="true"
              >
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                />
              </span>
            )}
            <span className="font-medium">{node.label}</span>
          </button>
          {node.kind === 'account' && (
            <span className="text-[10px] text-muted-foreground">Account</span>
          )}
        </div>
        {!isCollapsed && node.accounts.length > 0 && (
          <div className="space-y-1" style={{ paddingLeft: padding + 12 }}>
              {node.accounts.map((account) => {
                const balanceLabel = balanceLabelByAccount.get(account);
                return (
                <div
                  key={`${node.id}-${account}`}
                  className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1 text-xs"
                >
                  <span className="truncate">
                    {account}
                    {balanceLabel ? ` - ${balanceLabel}` : ''}
                  </span>
                  {allowRemove && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveAccount(node.id, account)}
                    >
                    Remove
                    </button>
                  )}
                </div>
              )})}
            </div>
          )}
        {!isCollapsed && node.children.length > 0 && (
          <div className="space-y-2">
            {node.children.map((child) =>
              renderStructureReadOnlyNode(child, depth + 1, allowRemove, nodePath)
            )}
          </div>
        )}
      </div>
    );

    if (node.kind === 'account') {
      return (
        <FsDropZone key={node.id} nodeId={node.id}>
          {content}
        </FsDropZone>
      );
    }

    return (
      <div key={node.id} className="rounded-md border border-dashed p-2">
        {content}
      </div>
    );
  };

  const mappingEntries = useMemo(
    () => mappingDoc?.mappings ?? [],
    [mappingDoc]
  );

  const structureAccountCodes = useMemo(() => {
    const set = new Set<string>();
    if (!fsStructure) return set;
    const walk = (nodes: FsNode[]) => {
      nodes.forEach((node) => {
        if (node.kind === 'account' && node.code) {
          set.add(node.code);
        }
        if (node.children.length) {
          walk(node.children);
        }
      });
    };
    walk(fsStructure.tree);
    return set;
  }, [fsStructure]);

  const processMappingRows = useMemo(() => {
    if (!fsStructure || structureAccountCodes.size === 0) return [];
    const map = new Map<string, ProcessMappingRow>();
    pcmList.forEach((item) => {
      if (!structureAccountCodes.has(item.account)) return;
      const balanceRow = balanceNByAccount.get(item.account);
      const prefix = item.account.replace(/0+$/, '') || item.account;
      const hasExcel = balanceAccountCodes.some((account) =>
        account.startsWith(prefix)
      );
      map.set(item.account, {
        account: item.account,
        label: item.label,
        balance: balanceRow?.balance ?? 0,
        hasExcel,
      });
    });
    manualFsAccounts.forEach((item) => {
      const account = padAccount(item.account);
      if (!structureAccountCodes.has(account)) return;
      if (map.has(account)) return;
      const balanceRow = balanceNByAccount.get(account);
      const prefix = account.replace(/0+$/, '') || account;
      const hasExcel = balanceAccountCodes.some((code) =>
        code.startsWith(prefix)
      );
      map.set(account, {
        account,
        label: item.label,
        balance: balanceRow?.balance ?? 0,
        hasExcel,
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.account.localeCompare(b.account)
    );
  }, [pcmList, manualFsAccounts, balanceNByAccount, balanceAccountCodes, fsStructure, structureAccountCodes]);

  const uniqueAccounts = useMemo(
    () => processMappingRows.map((row) => row.account),
    [processMappingRows]
  );

  const mappingByAccount = useMemo(() => {
    const map = new Map<string, string>();
    mappingEntries.forEach((entry) => {
      if (entry.account && entry.processId) {
        map.set(entry.account, entry.processId);
      }
    });
    return map;
  }, [mappingEntries]);

  const unassignedAccounts = useMemo(
    () =>
      processMappingRows.filter(
        (row) => row.account && !mappingByAccount.has(row.account)
      ),
    [processMappingRows, mappingByAccount]
  );

  const accountsByProcess = useMemo(() => {
    const map = new Map<string, ProcessMappingRow[]>();
    processMappingRows.forEach((row) => {
      const processId = mappingByAccount.get(row.account);
      if (!processId) return;
      const list = map.get(processId) ?? [];
      list.push(row);
      map.set(processId, list);
    });
    return map;
  }, [processMappingRows, mappingByAccount]);

  const getMappingStatus = (entries: ProcessMappingEntry[]) => {
    if (uniqueAccounts.length === 0) return 'in_progress';
    const required = new Set(uniqueAccounts);
    const mappedCount = entries.filter((entry) =>
      required.has(entry.account)
    ).length;
    return mappedCount >= uniqueAccounts.length ? 'completed' : 'in_progress';
  };

  const writeMapping = async (
    nextMappings: ProcessMappingEntry[],
    nextProcesses: ProcessItem[]
  ) => {
    if (!projectId) return;
    const mappingPath = `projects/${projectId}/knowledge_base/process_mapping`;
    const status = getMappingStatus(nextMappings);

    await setDoc(
      doc(db, mappingPath),
      {
        status,
        mappings: nextMappings,
        processes: nextProcesses,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const assignAccountToProcess = async (account: string, processId: string) => {
    if (!account || !processId) return;
    const nextMappings = mappingEntries.filter(
      (entry) => entry.account !== account
    );
    nextMappings.push({ account, processId });
    const nextStatus = getMappingStatus(nextMappings);
    setMappingDoc((prev) => ({
      ...(prev ?? {}),
      mappings: nextMappings,
      status: nextStatus,
    }));
    await writeMapping(nextMappings, selectedProcesses);
  };

  const removeAccountMapping = async (account: string) => {
    if (!account) return;
    const nextMappings = mappingEntries.filter(
      (entry) => entry.account !== account
    );
    const nextStatus = getMappingStatus(nextMappings);
    setMappingDoc((prev) => ({
      ...(prev ?? {}),
      mappings: nextMappings,
      status: nextStatus,
    }));
    await writeMapping(nextMappings, selectedProcesses);
  };

  const toggleProcessCollapsed = (processId: string) => {
    setCollapsedProcesses((prev) => {
      const next = new Set(prev);
      if (next.has(processId)) {
        next.delete(processId);
      } else {
        next.add(processId);
      }
      return next;
    });
  };

  const handleProcessMappingDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!activeId.startsWith('account:') || !overId.startsWith('process:')) {
      return;
    }

    const account = activeId.replace('account:', '');
    const processId = overId.replace('process:', '');
    if (!account || !processId) return;

    await assignAccountToProcess(account, processId);
  };

  const handleAddCustomProcess = async () => {
    const name = window.prompt('Process name');
    if (!name) return;
    const nextProcesses = [
      ...selectedProcesses,
      { id: `custom-${Date.now()}`, name, source: 'custom' as const },
    ];
    setSelectedProcesses(nextProcesses);
    await writeMapping(mappingEntries, nextProcesses);
  };

  const handleRemoveProcess = async (processId: string) => {
    if (!processId) return;
    const nextProcesses = selectedProcesses.filter((p) => p.id !== processId);
    const nextMappings = mappingEntries.filter((entry) => entry.processId !== processId);
    setSelectedProcesses(nextProcesses);
    setMappingDoc((prev) => (prev ? { ...prev, mappings: nextMappings } : prev));
    await writeMapping(nextMappings, nextProcesses);
  };

  const handleToggleLibraryProcess = (process: Cycle) => {
    const exists = draftProcesses.some((p) => p.id === process.id);
    if (exists) {
      setDraftProcesses(draftProcesses.filter((p) => p.id !== process.id));
      return;
    }
    setDraftProcesses([
      ...draftProcesses,
      { id: process.id, name: process.name, source: 'library' as const },
    ]);
  };

  const openProcessLibrary = () => {
    setDraftProcesses(selectedProcesses.filter((p) => p.source === 'library'));
    setShowProcessLibrary(true);
  };

  const applyProcessLibrary = async () => {
    const custom = selectedProcesses.filter((p) => p.source === 'custom');
    const nextProcesses = [...custom, ...draftProcesses];
    const processIds = new Set(nextProcesses.map((p) => p.id));
    const nextMappings = mappingEntries.filter((entry) => processIds.has(entry.processId));
    setSelectedProcesses(nextProcesses);
    setMappingDoc((prev) => (prev ? { ...prev, mappings: nextMappings } : prev));
    await writeMapping(nextMappings, nextProcesses);
    setShowProcessLibrary(false);
  };

  /* const exportProcessMappingLegacy = () => {
    const processById = new Map(selectedProcesses.map((p) => [p.id, p.name]));
    const instructions = [
      ['Documentation (FR) - Process Mapping'],
      [''],
      ['Objectif'],
      ['Affecter chaque compte PCM à un process.'],
      [''],
      ['Onglet obligatoire: Mapping'],
      ['Colonnes obligatoires:'],
      ['- account_code (obligatoire)'],
      ['- process_name (obligatoire)'],
      ['Colonnes facultatives:'],
      ['- account_label'],
      [''],
      ['Règles importantes'],
      ['- 1 ligne = 1 compte PCM rattaché à 1 process.'],
      ['- Si le process n’existe pas, il sera créé automatiquement.'],
      ['- L’import fusionne avec l’existant (ne supprime pas).'],
      [''],
      ['Lexique'],
      ['- account_code: compte standard PCM.'],
      ['- process_name: nom du process.'],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    const rows = mappingEntries
      .map((entry) => {
        const processName = processById.get(entry.processId);
        if (!processName) return null;
        const label = pcmByCode.get(entry.account)?.label ?? '';
        return {
          account_code: entry.account,
          account_label: label,
          process_name: processName,
        };
      })
      .filter(Boolean) as Array<Record<string, string>>;
    const header = ['account_code', 'account_label', 'process_name'];
    const templateSheet = XLSX.utils.aoa_to_sheet([header]);
    if (rows.length) {
      XLSX.utils.sheet_add_json(templateSheet, rows, {
        header,
        skipHeader: true,
        origin: -1,
      });
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Documentation');
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Mapping');
    XLSX.writeFile(workbook, 'process_mapping.xlsx');
  }; */

  const exportProcessMapping = async () => {
    const processById = new Map(selectedProcesses.map((p) => [p.id, p.name]));
    const workbook = new ExcelJS.Workbook();
    const docSheet = workbook.addWorksheet('Documentation');
    docSheet.columns = [{ width: 90 }];
    docSheet.addRow(['📘 Documentation (FR) - Process Mapping']).font = {
      bold: true,
      size: 14,
      color: { argb: 'FF1F4E79' },
    };
    docSheet.addRow([]);
    docSheet.addRow(['🎯 Objectif']).font = { bold: true };
    docSheet.addRow(['Affecter chaque compte PCM à un process.']);
    docSheet.addRow([]);
    docSheet.addRow(['✅ Onglet obligatoire: Mapping']);
    docSheet.addRow(['✅ Colonnes obligatoires (toutes):']);
    docSheet.addRow(['- account_code (obligatoire)']);
    docSheet.addRow(['- account_label (obligatoire)']);
    docSheet.addRow(['- process_name (obligatoire)']);
    docSheet.addRow([]);
    docSheet.addRow(['⚠️ Règles importantes']).font = { bold: true };
    docSheet.addRow(['- 1 ligne = 1 compte PCM rattaché à 1 process.']);
    docSheet.addRow([
      '- Si le process n’existe pas, il sera créé automatiquement.',
    ]);
    docSheet.addRow(['- L’import fusionne avec l’existant (ne supprime pas).']);
    docSheet.addRow([]);
    docSheet.addRow(['📚 Lexique']).font = { bold: true };
    docSheet.addRow(['- account_code: compte standard PCM.']);
    docSheet.addRow(['- account_label: libellé du compte PCM.']);
    docSheet.addRow(['- process_name: nom du process.']);

    const rows = mappingEntries
      .map((entry) => {
        const processName = processById.get(entry.processId);
        if (!processName) return null;
        const label = pcmByCode.get(entry.account)?.label ?? '';
        return {
          account_code: entry.account,
          account_label: label,
          process_name: processName,
        };
      })
      .filter(Boolean) as Array<Record<string, string>>;

    const mapSheet = workbook.addWorksheet('Mapping');
    mapSheet.columns = [
      { header: 'account_code', key: 'account_code', width: 20 },
      { header: 'account_label', key: 'account_label', width: 40 },
      { header: 'process_name', key: 'process_name', width: 28 },
    ];
    mapSheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
    applyHeaderStyle(mapSheet.getRow(1), 3);
    rows.forEach((row) => mapSheet.addRow(row));
    mapSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        applyZebra(row, 3);
      }
    });
    applyVerticalBorders(mapSheet, 3, rows.length + 1);
    docSheet.views = [{ showGridLines: false }];

    const processLibSheet = workbook.addWorksheet('Processes Library');
    processLibSheet.columns = [{ header: 'process_name', key: 'process_name', width: 32 }];
    processLibSheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
    applyHeaderStyle(processLibSheet.getRow(1), 1);
    cycles.forEach((cycle) => {
      processLibSheet.addRow({ process_name: cycle.name });
    });
    processLibSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        applyZebra(row, 1);
      }
    });
    applyVerticalBorders(processLibSheet, 1, cycles.length + 1);

    const accountLibSheet = workbook.addWorksheet('Account Library');
    accountLibSheet.columns = [
      { header: 'account_code', key: 'account_code', width: 20 },
      { header: 'account_label', key: 'account_label', width: 50 },
    ];
    accountLibSheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
    applyHeaderStyle(accountLibSheet.getRow(1), 2);
    pcmList.forEach((item) => {
      accountLibSheet.addRow({
        account_code: item.account,
        account_label: item.label,
      });
    });
    accountLibSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        applyZebra(row, 2);
      }
    });
    applyVerticalBorders(accountLibSheet, 2, pcmList.length + 1);

    await downloadExcel(workbook, 'process_mapping.xlsx');
  };

  const importProcessMapping = async (file: File) => {
    setProcessImportError(null);
    setProcessImportMessage(null);
    try {
      const rows = await readMappingSheet(file);
      const processNameMap = new Map<string, ProcessItem>();
      selectedProcesses.forEach((process) => {
        processNameMap.set(process.name.trim().toLowerCase(), process);
      });
      cycles.forEach((cycle) => {
        const key = cycle.name.trim().toLowerCase();
        if (!processNameMap.has(key)) {
          processNameMap.set(key, {
            id: cycle.id,
            name: cycle.name,
            source: 'library',
          });
        }
      });

      const ensureProcess = (name: string) => {
        const key = name.trim().toLowerCase();
        const existing = processNameMap.get(key);
        if (existing) return existing;
        const safe = key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const next: ProcessItem = {
          id: `custom-${Date.now()}-${safe || 'process'}`,
          name,
          source: 'custom',
        };
        processNameMap.set(key, next);
        return next;
      };

      const mappingByAccount = new Map<string, string>();
      mappingEntries.forEach((entry) => {
        if (entry.account && entry.processId) {
          mappingByAccount.set(entry.account, entry.processId);
        }
      });

      let applied = 0;
      const skipped: string[] = [];
      rows.forEach((row) => {
        const rawAccount = String(row.account_code ?? '').trim();
        const processName = String(row.process_name ?? '').trim();
        if (!rawAccount || !processName) return;
        const account = padAccount(rawAccount);
        if (!pcmByCode.has(account)) {
          skipped.push(account);
          return;
        }
        const process = ensureProcess(processName);
        mappingByAccount.set(account, process.id);
        applied += 1;
      });

      const processIds = new Set(
        Array.from(mappingByAccount.values()).filter(Boolean)
      );
      const nextProcesses = Array.from(processNameMap.values()).filter((p) =>
        processIds.has(p.id)
      );
      const nextMappings = Array.from(mappingByAccount.entries()).map(
        ([account, processId]) => ({ account, processId })
      );

      setSelectedProcesses(nextProcesses);
      setMappingDoc((prev) => (prev ? { ...prev, mappings: nextMappings } : prev));
      await writeMapping(nextMappings, nextProcesses);
      setProcessImportMessage(
        `Imported ${applied} mappings.` +
          (skipped.length ? ` Skipped ${skipped.length} rows.` : '')
      );
    } catch (error) {
      setProcessImportError((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Statements</h1>
        <p className="text-gray-600">
          Review the trial balance, process mapping, and financial statements.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as 'financial-statements' | 'balances' | 'process-mapping')
        }
        className="w-full"
      >
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="financial-statements">
            Financial Statements
          </TabsTrigger>
          <TabsTrigger value="balances">Trial Balance</TabsTrigger>
          <TabsTrigger value="process-mapping">Process Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-6">
          {!projectId ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-600">
                Select a project to import the trial balance.
              </CardContent>
            </Card>
          ) : !sourceExcelFile ? (
            <Card>
              <CardContent className="py-10 text-center space-y-3">
                <p className="text-gray-600">No trial balance imported.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onNavigateToUpload}
                  disabled={!onNavigateToUpload}
                >
                  Import trial balance
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Imported trial balance</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm text-gray-600">
                  <span>{sourceExcelFile.name}</span>
                  <span>
                    {Math.round((sourceExcelFile.size / 1024) * 10) / 10} KB
                  </span>
                  {balanceParsedAt && (
                    <span>Imported on: {new Date(balanceParsedAt).toLocaleString()}</span>
                  )}
                  {onRemoveSourceExcel && (
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onRemoveSourceExcel}
                      >
                        Remove trial balance
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                {balancesError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {balancesError}
                  </div>
                )}
                {balancesDocExists === false && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    No parsing result found in Firestore.
                  </div>
                )}
                {sourceExcelFile && balanceStatus === 'processing' && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Parsing in progress...
                  </div>
                )}
                {balanceStatus === 'error' && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {balanceError || 'Parsing failed. Please re-import.'}
                  </div>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Account mapping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                  <p>
                    Choose how to attach imported sub-accounts to the structure.
                  </p>
                  {(balanceImportError || balanceImportMessage) && (
                    <div
                      className={`rounded-md border px-4 py-3 text-sm ${
                        balanceImportError
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {balanceImportError || balanceImportMessage}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={() => {
                        if (!fsStructure) return;
                        handleAutoMap();
                      }}
                      disabled={!fsStructure}
                    >
                      Auto map
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!fsStructure) return;
                        setBalanceMappingTree(null);
                        const cleared = clearAssignedAccounts(fsStructure.tree);
                        await setStructureAndSave(fsStructure.template, cleared);
                        setAutoMapMessage(null);
                        setShowManualMapping(true);
                      }}
                      disabled={!fsStructure}
                    >
                      Map manually
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => balanceImportInputRef.current?.click()}
                      disabled={!fsStructure}
                    >
                      Import mapping (Excel)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={exportBalanceMapping}
                      disabled={!fsStructure}
                    >
                      Export mapping (Excel)
                    </Button>
                  </div>
                  <input
                    ref={balanceImportInputRef}
                    type="file"
                    accept=".xlsx,.xlsm"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      void importBalanceMapping(file);
                      event.target.value = '';
                    }}
                  />
                  {!fsStructure && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Create the structure first in Financial Statements.
                    </div>
                  )}
                  {autoMapMessage && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {autoMapMessage}
                    </div>
                  )}
                </CardContent>
              </Card>

              {activeTab === 'balances' && showManualMapping && fsStructure && (
                <DndContext
                  sensors={sensors}
                  onDragStart={(event) => {
                    const activeId = String(event.active.id);
                    if (!activeId.startsWith('fs-account:')) return;
                    const account = activeId.replace('fs-account:', '');
                    const row = mappingSourceUniqueRows.find(
                      (item) => item.account === account
                    );
                    setActiveFsRow(row ?? null);
                  }}
                  onDragCancel={() => setActiveFsRow(null)}
                  onDragEnd={(event) => {
                    setActiveFsRow(null);
                    handleFsDragEnd(event);
                  }}
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="h-[720px] min-w-0 overflow-hidden">
                      <CardHeader>
                        <CardTitle>Imported accounts</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-3.75rem)] overflow-hidden">
                        <div className="h-full space-y-2 overflow-y-auto overflow-x-hidden pr-2">
                          {unassignedFsAccounts.length === 0 ? (
                            <div className="text-sm text-gray-500">All accounts are assigned.</div>
                          ) : (
                            unassignedFsAccounts.map((row) => (
                              <DraggableFsAccount key={`fs-${row.account}`} row={row} />
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="h-[720px] min-w-0 overflow-hidden">
                      <CardHeader>
                        <CardTitle>Structure</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-3.75rem)] overflow-hidden">
                        <div className="h-full space-y-4 overflow-y-auto overflow-x-hidden pr-2">
                          {accountNodeCount === 0 && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                              Add accounts in Financial Statements (or choose BUMEX PCM) to enable drag and drop.
                            </div>
                          )}
                          {fsTreeWithTotals?.length ? (
                            fsTreeWithTotals.map((node) =>
                              renderStructureReadOnlyNode(node, 0, true)
                            )
                          ) : (
                            <div className="text-sm text-gray-500">
                              Create the structure in Financial Statements.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <DragOverlay>
                    {activeFsRow ? <FsAccountRowDisplay row={activeFsRow} /> : null}
                  </DragOverlay>
                </DndContext>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="process-mapping" className="space-y-6">
          {!projectId ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-600">
                Select a project to access Process Mapping.
              </CardContent>
            </Card>
          ) : balanceStatus !== 'done' || (balanceN.length === 0 && balanceN1.length === 0) ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-600">
                Import the trial balance to fetch accounts.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Process Mapping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  {mappingError && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {mappingError}
                    </div>
                  )}
                  {(processImportError || processImportMessage) && (
                    <div
                      className={`rounded-md border px-4 py-3 text-sm ${
                        processImportError
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {processImportError || processImportMessage}
                    </div>
                  )}
                  {mappingDoc?.status === 'error' && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {mappingDoc.errorMessage || 'Process mapping failed.'}
                    </div>
                  )}
                </CardContent>
              </Card>

              {activeTab === 'process-mapping' && (
                <DndContext sensors={sensors} onDragEnd={handleProcessMappingDragEnd}>
                <div className="grid gap-6 items-stretch lg:grid-cols-[1fr_1.15fr]">
                  <Card className="h-[720px] overflow-hidden">
                    <CardHeader>
                  <CardTitle>
                    Imported accounts ({uniqueAccounts.length})
                  </CardTitle>
                </CardHeader>
                    <CardContent className="flex h-[calc(100%-3.75rem)] flex-col overflow-hidden min-h-0">
                      <div className="h-full min-h-0 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                        {unassignedAccounts.length === 0 ? (
                          <div className="text-sm text-gray-500">
                            All accounts are assigned.
                          </div>
                        ) : (
                          unassignedAccounts.map((row) => (
                            <DraggableAccountRow
                              key={`${row.account}-${row.label}`}
                              row={row}
                            />
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="h-[720px] overflow-hidden">
                    <CardHeader>
                      <CardTitle>Processes</CardTitle>
                    </CardHeader>
                    <CardContent className="flex h-[calc(100%-3.75rem)] flex-col overflow-hidden min-h-0 space-y-3">
                      <div className="flex flex-nowrap gap-2 overflow-x-hidden">
                        <Button type="button" onClick={handleAddCustomProcess}>
                          Add custom
                        </Button>
                        <Button type="button" variant="outline" onClick={openProcessLibrary}>
                          Select from library
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => processImportInputRef.current?.click()}
                        >
                          Import mapping (Excel)
                        </Button>
                        <Button type="button" variant="outline" onClick={exportProcessMapping}>
                          Export mapping (Excel)
                        </Button>
                      </div>
                      <input
                        ref={processImportInputRef}
                        type="file"
                        accept=".xlsx,.xlsm"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          void importProcessMapping(file);
                          event.target.value = '';
                        }}
                      />

                      {showProcessLibrary && (
                        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6">
                          <div className="w-full max-w-xl rounded-lg bg-white p-5 shadow-xl">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-900">
                                Select processes from library
                              </h3>
                              <button
                                type="button"
                                className="text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setShowProcessLibrary(false)}
                              >
                                Close
                              </button>
                            </div>
                            <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto text-xs text-gray-600">
                              {cycles.map((process) => {
                                const checked = draftProcesses.some((p) => p.id === process.id);
                                return (
                                  <label key={process.id} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleToggleLibraryProcess(process)}
                                    />
                                    <span>{process.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="mt-5 flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowProcessLibrary(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="button" onClick={applyProcessLibrary}>
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-3">
                        {selectedProcesses.length === 0 ? (
                          <div className="text-sm text-gray-500">
                            No processes selected.
                          </div>
                        ) : (
                          selectedProcesses.map((process) => {
                            const assigned = accountsByProcess.get(process.id) ?? [];
                            const isCollapsed = collapsedProcesses.has(process.id);
                            return (
                              <ProcessDropZone
                                key={process.id}
                                process={{ id: process.id, name: process.name }}
                                collapsed={isCollapsed}
                                onToggle={() => toggleProcessCollapsed(process.id)}
                                actions={
                                  process.source === 'custom' ? (
                                    <button
                                      type="button"
                                      className="text-xs text-red-500 hover:text-red-700"
                                      onClick={() => handleRemoveProcess(process.id)}
                                      data-no-dnd
                                    >
                                      Delete
                                    </button>
                                  ) : null
                                }
                              >
                                {assigned.length === 0 ? (
                                  <div className="text-xs text-gray-500">
                                    Drop accounts here.
                                  </div>
                                ) : (
                                  <div className="space-y-2 overflow-x-hidden">
                                    {assigned.map((row) => (
                                      <div
                                        key={`${process.id}-${row.account}`}
                                        className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1 text-xs"
                                      >
                                        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                                          <span className="whitespace-nowrap font-medium">
                                            {row.account}
                                          </span>
                                          <span className="truncate whitespace-nowrap text-muted-foreground">
                                            {row.label}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                                            {formatBalanceValue(row.balance)}
                                          </span>
                                          {row.hasExcel && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                              Excel
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => removeAccountMapping(row.account)}
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </ProcessDropZone>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </DndContext>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="financial-statements">
          {fsLoading ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-600">
                Loading...
              </CardContent>
            </Card>
          ) : fsError ? (
            <Card>
              <CardContent className="py-10 text-center text-red-600">
                {fsError}
              </CardContent>
            </Card>
          ) : balanceN.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-600 space-y-3">
                <p>No structure until the trial balance is imported.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('balances')}
                >
                  Go to Trial Balance
                </Button>
              </CardContent>
            </Card>
          ) : !fsStructure ? (
            <Card>
              <CardContent className="py-10 text-center space-y-4 text-gray-600">
                <p>Choose the structure to use for Financial Statements.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button type="button" onClick={handleChoosePcm}>
                    Use BUMEX PCM
                  </Button>
                  <Button type="button" variant="outline" onClick={handleChooseManual}>
                    Create manual structure
                  </Button>
                </div>
                {fsTemplates.length > 0 && (
                  <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                    <span>Load a saved template:</span>
                    <select
                      className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                      defaultValue=""
                      onChange={(event) => handleSelectTemplate(event.target.value)}
                    >
                      <option value="" disabled>
                        Select template...
                      </option>
                      {fsTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>Structure: {currentTemplateLabel}</span>
                    <span>Unassigned accounts: {unassignedFsAccounts.length}</span>
                  </div>
                  {fsTemplates.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Load template:</span>
                      <select
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                        value={fsStructure.template === 'bumex_pcm' ? 'pcm' : (fsTemplateId ?? '')}
                        onChange={(event) => handleSelectTemplate(event.target.value)}
                      >
                        <option value="pcm">BUMEX PCM</option>
                        {fsTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {fsStructure.template === 'manual' && (
                    <div className="text-xs text-muted-foreground">
                      Select one of the 4 blocks, then build the hierarchy inside it.
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={handleSwitchToPcm}>
                      Use BUMEX PCM
                    </Button>
                    <Button type="button" variant="outline" onClick={handleSwitchToManual}>
                      Switch to manual
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-[720px] overflow-hidden">
                <CardHeader className="relative">
                  <CardTitle>Hierarchy</CardTitle>
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    {currentTemplateLabel}
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-3.75rem)] overflow-hidden">
                  <div className="h-full space-y-4 overflow-y-auto overflow-x-hidden pr-2">
                    {fsTreeWithTotals?.length ? (
                      fsTreeWithTotals.map((node) =>
                        renderStructureEditorNode(node, 0, fsStructure.template === 'manual')
                      )
                    ) : (
                      <div className="text-sm text-gray-500">
                        Empty structure.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trial balance status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 overflow-x-hidden">
                  <div className="text-xs text-muted-foreground">
                    Mapped accounts: {mappedCount} / {totalAccounts}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {isBalanced ? 'Trial balance is balanced' : 'Trial balance is not balanced'}
                    </span>
                    <span className={isBalanced ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700' : 'rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700'}>
                      {isBalanced ? 'OK' : 'Check'}
                    </span>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="h-[680px] overflow-hidden">
                      <CardHeader>
                        <CardTitle>ACTIF</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-3.75rem)] overflow-hidden min-h-0 flex flex-col">
                        <div className="grid items-center gap-6 pb-2 pr-2 text-[11px] uppercase tracking-wide text-muted-foreground" style={{ gridTemplateColumns: 'minmax(0,1fr) 110px 110px' }}>
                          <span className="text-left" />
                          <span className="text-left pl-1">PY</span>
                          <span className="text-left pl-1">CY</span>
                        </div>
                        {fsActif && (
                          <div className="grid items-center gap-6 rounded-md border border-slate-200/70 bg-slate-50 px-2 py-1.5 text-sm font-medium" style={{ gridTemplateColumns: 'minmax(0,1fr) 110px 110px' }}>
                            <span className="truncate">Total</span>
                            <span className="text-right tabular-nums">{formatBalanceValue(fsActifAbsTotals.n1)}</span>
                            <span className="text-right tabular-nums">{formatBalanceValue(fsActifAbsTotals.n)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-h-0 space-y-2 overflow-y-auto overflow-x-hidden pr-2 pb-10">
                          {fsActif ? renderFsNode(fsActif, 0, true) : (
                            <div className="text-sm text-gray-500">No ASSETS block.</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="h-[680px] overflow-hidden">
                      <CardHeader>
                        <CardTitle>PASSIF</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-3.75rem)] overflow-hidden min-h-0 flex flex-col">
                        <div className="grid items-center gap-6 pb-2 pr-2 text-[11px] uppercase tracking-wide text-muted-foreground" style={{ gridTemplateColumns: 'minmax(0,1fr) 110px 110px' }}>
                          <span className="text-left" />
                          <span className="text-left pl-1">PY</span>
                          <span className="text-left pl-1">CY</span>
                        </div>
                        {fsPassif && (
                          <div className="grid items-center gap-6 rounded-md border border-slate-200/70 bg-slate-50 px-2 py-1.5 text-sm font-medium" style={{ gridTemplateColumns: 'minmax(0,1fr) 110px 110px' }}>
                            <span className="truncate">Total</span>
                            <span className="text-right tabular-nums">{formatBalanceValue(fsPassifAbsTotals.n1)}</span>
                            <span className="text-right tabular-nums">{formatBalanceValue(fsPassifAbsTotals.n)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-h-0 space-y-2 overflow-y-auto overflow-x-hidden pr-2 pb-10">
                          {fsPassif ? renderFsNode(fsPassif, 0, true) : (
                            <div className="text-sm text-gray-500">No LIABILITIES block.</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card className="h-[680px] overflow-hidden">
                    <CardHeader>
                      <CardTitle>RESULTAT</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-3.75rem)] overflow-hidden min-h-0 flex flex-col">
                      <div className="grid items-center gap-6 pb-2 pr-2 text-[11px] uppercase tracking-wide text-muted-foreground" style={{ gridTemplateColumns: 'minmax(0,1fr) 110px 110px' }}>
                        <span className="text-left" />
                        <span className="text-left pl-1">PY</span>
                        <span className="text-left pl-1">CY</span>
                      </div>
                      {fsResultat && (
                        <div className="grid items-center gap-6 rounded-md border border-slate-200/70 bg-slate-50 px-2 py-1.5 text-sm font-medium" style={{ gridTemplateColumns: 'minmax(0,1fr) 110px 110px' }}>
                          <span className="truncate">Total</span>
                          <span className="text-right tabular-nums">{formatBalanceValue(resultTotals.n1)}</span>
                          <span className="text-right tabular-nums">{formatBalanceValue(resultTotals.n)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-h-0 space-y-2 overflow-y-auto overflow-x-hidden pr-2 pb-10">
                        {fsResultat ? renderFsNode(fsResultat, 0, false) : (
                          <div className="text-sm text-gray-500">No RESULT block.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <Dialog open={pcmLibraryOpen} onOpenChange={setPcmLibraryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add PCM accounts</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <input
              type="text"
              value={pcmLibraryQuery}
              onChange={(event) => setPcmLibraryQuery(event.target.value)}
              placeholder="Search by code or label..."
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-2 text-xs text-gray-600">
              {pcmLibraryItems.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No PCM accounts match your search.
                </div>
              ) : (
                pcmLibraryItems.map((item) => {
                  const checked = pcmLibrarySelected.has(item.account);
                  return (
                    <label key={item.account} className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => togglePcmLibraryAccount(item.account)}
                      />
                      <span className="font-medium text-gray-900">
                        {item.account}
                      </span>
                      <span className="truncate text-muted-foreground">
                        {item.label}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPcmLibraryOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyPcmLibrarySelection}>
              Validate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBasePage;
