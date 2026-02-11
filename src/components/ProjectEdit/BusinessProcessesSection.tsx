import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { CommentableQuestion } from './Comments';
import { useTranslation } from '@/contexts/TranslationContext';

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

type BusinessProcess = {
  id: string;
  name: string;
  prefixes: string[];
  active?: boolean;
  order?: number;
};

interface BusinessProcessesSectionProps {
  formData: any;
  onFormDataChange: (updates: any) => void;
}

/** Un item draggable pour la liste de droite (tri/réordonnancement) */
function SortableSelectedItem({
  id,
  label,
  onRemove
}: {
  id: string;
  label: string;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm cursor-grab active:cursor-grabbing"
      title="Glisser pour réordonner"
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="text-xs text-muted-foreground hover:text-foreground"
        title="Retirer"
      >
        ✕
      </button>
    </div>
  );
}

/** Essaie de trouver un projectId dans formData (selon comment ton app le stocke) */
function getProjectId(formData: any): string | null {
  return (
    formData?.projectId ||
    formData?.project_id ||
    formData?.engagementId ||
    formData?.engagement_id ||
    formData?.id ||
    null
  );
}

const BusinessProcessesSection = ({ formData, onFormDataChange }: BusinessProcessesSectionProps) => {
  const { t } = useTranslation();

  const [firebaseProcesses, setFirebaseProcesses] = useState<BusinessProcess[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    formData.selected_business_processes || []
  );

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Charge cycles depuis Firestore
  useEffect(() => {
    const loadProcesses = async () => {
      const snap = await getDocs(collection(db, 'cycles'));
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any)
      })) as BusinessProcess[];

      // Optionnel: trier côté UI si "order" existe
      data.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

      // Optionnel: cacher ceux inactive
      const onlyActive = data.filter((p) => p.active !== false);

      setFirebaseProcesses(onlyActive);
    };

    loadProcesses();
  }, []);

  // Calcules utiles
  const selectedProcesses = useMemo(() => {
    return selectedIds
      .map((id) => firebaseProcesses.find((p) => p.id === id))
      .filter(Boolean) as BusinessProcess[];
  }, [selectedIds, firebaseProcesses]);

  const availableProcesses = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return firebaseProcesses.filter((p) => !selectedSet.has(p.id));
  }, [firebaseProcesses, selectedIds]);

  // Ajoute un process à droite (si pas déjà présent)
  const addToSelected = (processId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(processId)) return prev;
      const next = [...prev, processId];
      onFormDataChange({ selected_business_processes: next });
      return next;
    });
  };

  // Retire de droite
  const removeFromSelected = (processId: string) => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) => id !== processId);
      onFormDataChange({ selected_business_processes: next });
      return next;
    });
  };

  // Drag end: si on droppe un item "available" dans "selected" => on l’ajoute
  // et si on réordonne dans selected => arrayMove
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Cas 1: On réordonne dans la liste selected (droite)
    const fromIndex = selectedIds.indexOf(activeId);
    const toIndex = selectedIds.indexOf(overId);
    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      const next = arrayMove(selectedIds, fromIndex, toIndex);
      setSelectedIds(next);
      onFormDataChange({ selected_business_processes: next });
      return;
    }

    // Cas 2: On glisse un item depuis available vers un item selected -> on l’ajoute
    const isFromAvailable = availableProcesses.some((p) => p.id === activeId);
    const isOverSelected = selectedIds.includes(overId);

    if (isFromAvailable && isOverSelected) {
      addToSelected(activeId);
      return;
    }

    // Cas 3: si on droppe sur une zone "selected-dropzone"
    if (isFromAvailable && overId === 'selected-dropzone') {
      addToSelected(activeId);
      return;
    }
  };

  // INVENTORY (tu gardes pareil)
  const handleInventoryMaterialChange = (value: string) => {
    onFormDataChange({ entity_has_material_inventory: value });
  };

  const handleInventoryWorkpaperChange = (checked: boolean) => {
    onFormDataChange({ confirm_inventory_workpaper: checked });
  };

  /**
   * VALIDER :
   * 1) enregistre la liste selectedIds dans mission_cycles
   * 2) crée des sections dynamiques dans mission_sections à partir de part=3, order>=3
   */
  const handleValidate = async () => {
    const projectId = getProjectId(formData);
    if (!projectId) {
      alert(
        "Je ne trouve pas le projectId dans formData. Dis-moi quel champ contient l'id du projet (projectId / project_id / engagementId...)."
      );
      return;
    }

    // 1) save selection
    await setDoc(
      doc(db, 'mission_cycles', projectId),
      {
        projectId,
        selectedCycleIds: selectedIds,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    // 2) regenerate mission_sections for part 3 from order 3+
    // On supprime uniquement les sections qu’on a générées (type = 'business_process_dynamic')
    const q = query(
      collection(db, 'mission_sections'),
      where('projectId', '==', projectId),
      where('type', '==', 'business_process_dynamic')
    );

    const oldSnap = await getDocs(q);
    const batch = writeBatch(db);

    oldSnap.docs.forEach((d) => batch.delete(d.ref));

    // Recréation: 3.3, 3.4, 3.5...
    selectedProcesses.forEach((p, idx) => {
      const order = 3 + idx; // 3.3 => order=3 si tu veux, mais moi je mets "order" = 3+idx (à toi d'ajuster)
      const title = p.name;

      // id déterministe => pas de doublons
      const sectionDocId = `${projectId}__bp__${p.id}`;

      batch.set(doc(db, 'mission_sections', sectionDocId), {
        projectId,
        cycleId: p.id,
        title,
        part: 3,
        order,
        type: 'business_process_dynamic',
        prefixes: p.prefixes ?? [],
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();

    alert('✅ Validé : cycles enregistrés + sections Business Process créées (Partie 3).');
  };

  return (
    <CommentableQuestion fieldId="business_processes_main" label={t('businessProcesses.title')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('businessProcesses.identifyProcesses')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('businessProcesses.identifyDescription')}</p>
        </CardHeader>

        <CardContent>
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT — AVAILABLE */}
              <div className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3 text-slate-900">
                    Process (disponibles)
                  </h4>

                  <div className="space-y-2">
                    {availableProcesses.map((process) => (
                      <div
                        key={process.id}
                        className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
                        title="Glisse vers la colonne de droite"
                      >
                        <span>{process.name}</span>

                        <button
                          type="button"
                          onClick={() => addToSelected(process.id)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                          title="Ajouter"
                        >
                          ➜
                        </button>
                      </div>
                    ))}

                    {availableProcesses.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        Tous les process sont déjà sélectionnés.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT — SELECTED + SORT */}
              <div className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3 text-slate-900">
                    Process (sélectionnés) — réordonner
                  </h4>

                  <div
                    className="space-y-2 min-h-[260px] rounded-md border border-dashed bg-white p-3"
                    // zone “drop”
                    id="selected-dropzone"
                  >
                    <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
                      {selectedProcesses.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          Glisse un process ici (gauche ➜ droite).
                        </p>
                      ) : (
                        selectedProcesses.map((p) => (
                          <SortableSelectedItem
                            key={p.id}
                            id={p.id}
                            label={p.name}
                            onRemove={removeFromSelected}
                          />
                        ))
                      )}
                    </SortableContext>
                  </div>

                  {/* ACCOUNTS/PREFIXES */}
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-3 text-slate-900">
                      Account/disclosure
                    </h4>

                    <div className="space-y-3 min-h-[140px]">
                      {selectedProcesses.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          {t('businessProcesses.selectProcesses')}
                        </p>
                      ) : (
                        selectedProcesses.map((p) => (
                          <div key={p.id} className="space-y-2">
                            <div className="text-xs text-muted-foreground">{p.name}</div>
                            <div className="flex flex-wrap gap-1">
                              {(p.prefixes ?? []).map((acc, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {acc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* VALIDATE */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleValidate}
                      className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      Valider
                    </button>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Valider = enregistre la sélection + génère les sections dynamiques Partie 3 (à partir de 3.3).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DndContext>

          {/* INVENTORY SECTION (inchangé) */}
          <div className="mt-8 space-y-6">
            <h4 className="font-medium text-base">
              {t('businessProcesses.performInventoryProcedures')}
            </h4>

            <RadioGroup
              value={formData.entity_has_material_inventory || ''}
              onValueChange={handleInventoryMaterialChange}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="inventory-yes" />
                <Label htmlFor="inventory-yes">{t('common.yes')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="inventory-no" />
                <Label htmlFor="inventory-no">{t('common.no')}</Label>
              </div>
            </RadioGroup>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="inventory-workpaper"
                checked={formData.confirm_inventory_workpaper || false}
                onCheckedChange={(c) => handleInventoryWorkpaperChange(Boolean(c))}
              />
              <Label htmlFor="inventory-workpaper">
                {t('businessProcesses.confirmInventoryWorkpaper')}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </CommentableQuestion>
  );
};

export default BusinessProcessesSection;
