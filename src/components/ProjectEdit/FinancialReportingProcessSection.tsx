import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { CommentableQuestion } from './Comments';
import { useTranslation } from '@/contexts/TranslationContext';

interface FinancialReportingProcessSectionProps {
  formData: any;
  onFormDataChange: (updates: any) => void;
}

interface ForeignCurrencyResponse {
  id: number;
  responseId: string;
  description: string;
  car: 'S' | 'N';
}

interface ServiceOrganizationRow {
  id: number;
  idField: string;
  description: string;
}

interface ProcessUnderstandingReference {
  id: number;
  reference: string;
}

type YesNoNotSelected = 'yes' | 'no' | 'not_selected';
type ProcessUnderstandingOption = 'walkthrough' | 'other_documentation' | 'not_selected';

const FinancialReportingProcessSection: React.FC<FinancialReportingProcessSectionProps> = ({
  formData,
  onFormDataChange
}) => {
  const { t } = useTranslation();
  const serviceOrgAttachmentInputRef = useRef<HTMLInputElement | null>(null);
  const relatedPartiesAttachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [hasTranslationStatements, setHasTranslationStatements] = useState(
    Boolean(formData?.translationOfFinancialStatements)
  );
  const [itSystems, setItSystems] = useState([{
    id: 1,
    reference: '',
    systemLayer: '',
    description: '',
    layerType: 'Application',
    outsourced: false,
    automated: false,
    manual: false
  }]);
  const [separateTransactionSystemsAnswer, setSeparateTransactionSystemsAnswer] = useState<'yes' | 'no' | ''>(
    formData?.separateTransactionSystemsAnswer || ''
  );
  const [isServiceOrganizationRelevant, setIsServiceOrganizationRelevant] = useState(
    Boolean(formData?.serviceOrganizationRelevant)
  );
  const [processUnderstandingReferences, setProcessUnderstandingReferences] = useState<ProcessUnderstandingReference[]>([{
    id: 1,
    reference: ''
  }]);
  const [serviceOrganizationRows, setServiceOrganizationRows] = useState<ServiceOrganizationRow[]>([{
    id: 1,
    idField: '',
    description: ''
  }]);
  const [serviceOrgAttachments, setServiceOrgAttachments] = useState<string[]>([]);
  const [relatedPartyArrangements, setRelatedPartyArrangements] = useState([{
    id: 1,
    idField: '',
    description: ''
  }]);
  const [relatedPartiesIdentifiedRows, setRelatedPartiesIdentifiedRows] = useState([{
    id: 1,
    idField: '',
    description: ''
  }]);
  const [controlDeficiencyRows, setControlDeficiencyRows] = useState([{
    id: 1,
    idField: '',
    description: ''
  }]);
  const [relatedPartiesAttachments, setRelatedPartiesAttachments] = useState<string[]>([]);
  const [relatedPartiesArrangementsAnswer, setRelatedPartiesArrangementsAnswer] = useState<YesNoNotSelected>('not_selected');
  const [relatedPartiesProcessAuthAnswer, setRelatedPartiesProcessAuthAnswer] = useState<YesNoNotSelected>('not_selected');
  const [relatedPartiesUnderstandingAnswer, setRelatedPartiesUnderstandingAnswer] = useState<YesNoNotSelected>('not_selected');
  const [relatedPartiesControlDefAnswer, setRelatedPartiesControlDefAnswer] = useState<YesNoNotSelected>('not_selected');
  const [hasUnusualServiceOrganization, setHasUnusualServiceOrganization] = useState(false);
  const [sutProcessUnderstanding, setSutProcessUnderstanding] = useState<ProcessUnderstandingOption>(
    (formData?.sutProcessUnderstanding as ProcessUnderstandingOption) || 'not_selected'
  );
  const [sutReference, setSutReference] = useState(formData?.sutReference || '');
  const [hasIdentifySut, setHasIdentifySut] = useState(false);
  const [sutIdentifiedRows, setSutIdentifiedRows] = useState([{
    id: 1,
    idField: '',
    description: ''
  }]);
  const [relatedPartiesProcedureResults, setRelatedPartiesProcedureResults] = useState(['', '', '']);
  const [additionalProceduresAnswer, setAdditionalProceduresAnswer] = useState<'yes' | 'no' | ''>('');
  const [additionalProceduresRows, setAdditionalProceduresRows] = useState([{
    id: 1,
    procedure: '',
    result: ''
  }]);
  const [discoverRelatedAnswer, setDiscoverRelatedAnswer] = useState<YesNoNotSelected>('not_selected');
  const [relatedPartyRequirementsAnswer, setRelatedPartyRequirementsAnswer] = useState<YesNoNotSelected>('not_selected');
  const [discoveredRelatedPartyRows, setDiscoveredRelatedPartyRows] = useState([{
    id: 1,
    idField: '',
    description: ''
  }]);
  const [discoveredRelatedPartyProcedureResults, setDiscoveredRelatedPartyProcedureResults] = useState(['', '', '', '', '', '']);
  const [foreignCurrencyResponses, setForeignCurrencyResponses] = useState<ForeignCurrencyResponse[]>([{
    id: 1,
    responseId: '',
    description: '',
    car: 'S'
  }]);
  const [foreignCurrencyEvidence, setForeignCurrencyEvidence] = useState<'yes' | 'no' | ''>('');
  const [informationSystemSupportAnswer, setInformationSystemSupportAnswer] = useState<'yes' | 'no' | ''>('');
  const [informationSystemImpactNotes, setInformationSystemImpactNotes] = useState('');
  const [accountingPolicySelections, setAccountingPolicySelections] = useState({
    significantChanges: false,
    newRevised: false,
    judgmentRequired: false,
    controversialAreas: false,
    methodsPolicies: false,
    alternatives: false,
    managementBias: false
  });
  const addItSystem = () => {
    const newId = Math.max(...itSystems.map(s => s.id), 0) + 1;
    setItSystems([...itSystems, {
      id: newId,
      reference: '',
      systemLayer: '',
      description: '',
      layerType: 'Application',
      outsourced: false,
      automated: false,
      manual: false
    }]);
  };
  const handleSeparateTransactionSystemsAnswerChange = (value: 'yes' | 'no') => {
    setSeparateTransactionSystemsAnswer(value);
    onFormDataChange({
      separateTransactionSystemsAnswer: value
    });
  };
  useEffect(() => {
    setSeparateTransactionSystemsAnswer(formData?.separateTransactionSystemsAnswer || '');
  }, [formData?.separateTransactionSystemsAnswer]);
  const removeItSystem = (id: number) => {
    setItSystems(itSystems.filter(s => s.id !== id));
  };
  const updateItSystem = (id: number, field: string, value: any) => {
    setItSystems(itSystems.map(s => s.id === id ? {
      ...s,
      [field]: value
    } : s));
  };
  const addProcessUnderstandingReference = () => {
    const newId = Math.max(...processUnderstandingReferences.map(r => r.id), 0) + 1;
    setProcessUnderstandingReferences([...processUnderstandingReferences, {
      id: newId,
      reference: ''
    }]);
  };
  const removeProcessUnderstandingReference = (id: number) => {
    setProcessUnderstandingReferences(processUnderstandingReferences.filter(reference => reference.id !== id));
  };
  const updateProcessUnderstandingReference = (id: number, value: string) => {
    setProcessUnderstandingReferences(processUnderstandingReferences.map(reference => reference.id === id ? {
      ...reference,
      reference: value
    } : reference));
  };
  const addServiceOrganizationRow = () => {
    const newId = Math.max(...serviceOrganizationRows.map(r => r.id), 0) + 1;
    setServiceOrganizationRows([...serviceOrganizationRows, {
      id: newId,
      idField: '',
      description: ''
    }]);
  };
  const removeServiceOrganizationRow = (id: number) => {
    setServiceOrganizationRows(serviceOrganizationRows.filter(row => row.id !== id));
  };
  const updateServiceOrganizationRow = (id: number, field: keyof Omit<ServiceOrganizationRow, 'id'>, value: string) => {
    setServiceOrganizationRows(serviceOrganizationRows.map(row => row.id === id ? {
      ...row,
      [field]: value
    } : row));
  };
  const handleServiceOrganizationRelevantChange = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    setIsServiceOrganizationRelevant(isChecked);
    onFormDataChange({
      serviceOrganizationRelevant: isChecked
    });
  };
  const handleAttachServiceOrganizationFile = () => {
    serviceOrgAttachmentInputRef.current?.click();
  };
  const handleServiceOrganizationFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }
    setServiceOrgAttachments(prev => [...prev, ...files.map(file => file.name)]);
    event.target.value = '';
  };
  const addRelatedPartyArrangement = () => {
    const newId = Math.max(...relatedPartyArrangements.map(r => r.id), 0) + 1;
    setRelatedPartyArrangements([...relatedPartyArrangements, {
      id: newId,
      idField: '',
      description: ''
    }]);
  };
  const removeRelatedPartyArrangement = (id: number) => {
    setRelatedPartyArrangements(relatedPartyArrangements.filter(r => r.id !== id));
  };
  const updateRelatedPartyArrangement = (id: number, field: string, value: string) => {
    setRelatedPartyArrangements(relatedPartyArrangements.map(r => r.id === id ? {
      ...r,
      [field]: value
    } : r));
  };
  const addRelatedPartiesIdentifiedRow = () => {
    const newId = Math.max(...relatedPartiesIdentifiedRows.map(r => r.id), 0) + 1;
    setRelatedPartiesIdentifiedRows([...relatedPartiesIdentifiedRows, {
      id: newId,
      idField: '',
      description: ''
    }]);
  };
  const updateRelatedPartiesIdentifiedRow = (id: number, field: string, value: string) => {
    setRelatedPartiesIdentifiedRows(relatedPartiesIdentifiedRows.map(row => row.id === id ? {
      ...row,
      [field]: value
    } : row));
  };
  const removeRelatedPartiesIdentifiedRow = (id: number) => {
    setRelatedPartiesIdentifiedRows(relatedPartiesIdentifiedRows.filter(row => row.id !== id));
  };
  const addControlDeficiencyRow = () => {
    const newId = Math.max(...controlDeficiencyRows.map(r => r.id), 0) + 1;
    setControlDeficiencyRows([...controlDeficiencyRows, {
      id: newId,
      idField: '',
      description: ''
    }]);
  };
  const updateControlDeficiencyRow = (id: number, field: string, value: string) => {
    setControlDeficiencyRows(controlDeficiencyRows.map(row => row.id === id ? {
      ...row,
      [field]: value
    } : row));
  };
  const removeControlDeficiencyRow = (id: number) => {
    setControlDeficiencyRows(controlDeficiencyRows.filter(row => row.id !== id));
  };
  const handleRelatedPartiesAttach = () => {
    relatedPartiesAttachmentInputRef.current?.click();
  };
  const handleRelatedPartiesAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }
    setRelatedPartiesAttachments(prev => [...prev, ...files.map(file => file.name)]);
    event.target.value = '';
  };
  const handleSutProcessUnderstandingChange = (value: ProcessUnderstandingOption) => {
    setSutProcessUnderstanding(value);
    onFormDataChange({
      sutProcessUnderstanding: value
    });
  };
  const handleSutReferenceChange = (value: string) => {
    setSutReference(value);
    onFormDataChange({
      sutReference: value
    });
  };
  useEffect(() => {
    const next = (formData?.sutProcessUnderstanding as ProcessUnderstandingOption) || 'not_selected';
    setSutProcessUnderstanding(next);
  }, [formData?.sutProcessUnderstanding]);
  useEffect(() => {
    setSutReference(formData?.sutReference || '');
  }, [formData?.sutReference]);
  const addSutIdentifiedRow = () => {
    const newId = Math.max(...sutIdentifiedRows.map(row => row.id), 0) + 1;
    setSutIdentifiedRows([...sutIdentifiedRows, {
      id: newId,
      idField: '',
      description: ''
    }]);
  };
  const updateSutIdentifiedRow = (id: number, field: 'idField' | 'description', value: string) => {
    setSutIdentifiedRows(sutIdentifiedRows.map(row => row.id === id ? {
      ...row,
      [field]: value
    } : row));
  };
  const removeSutIdentifiedRow = (id: number) => {
    setSutIdentifiedRows(sutIdentifiedRows.filter(row => row.id !== id));
  };
  const updateRelatedPartiesProcedureResult = (index: number, value: string) => {
    setRelatedPartiesProcedureResults(relatedPartiesProcedureResults.map((item, itemIndex) => itemIndex === index ? value : item));
  };
  const addAdditionalProcedureRow = () => {
    const newId = Math.max(...additionalProceduresRows.map(row => row.id), 0) + 1;
    setAdditionalProceduresRows([...additionalProceduresRows, {
      id: newId,
      procedure: '',
      result: ''
    }]);
  };
  const updateAdditionalProcedureRow = (id: number, field: 'procedure' | 'result', value: string) => {
    setAdditionalProceduresRows(additionalProceduresRows.map(row => row.id === id ? {
      ...row,
      [field]: value
    } : row));
  };
  const removeAdditionalProcedureRow = (id: number) => {
    setAdditionalProceduresRows(additionalProceduresRows.filter(row => row.id !== id));
  };
  const addDiscoveredRelatedPartyRow = () => {
    const newId = Math.max(...discoveredRelatedPartyRows.map(row => row.id), 0) + 1;
    setDiscoveredRelatedPartyRows([...discoveredRelatedPartyRows, {
      id: newId,
      idField: '',
      description: ''
    }]);
  };
  const updateDiscoveredRelatedPartyRow = (id: number, field: 'idField' | 'description', value: string) => {
    setDiscoveredRelatedPartyRows(discoveredRelatedPartyRows.map(row => row.id === id ? {
      ...row,
      [field]: value
    } : row));
  };
  const removeDiscoveredRelatedPartyRow = (id: number) => {
    setDiscoveredRelatedPartyRows(discoveredRelatedPartyRows.filter(row => row.id !== id));
  };
  const updateDiscoveredProcedureResult = (index: number, value: string) => {
    setDiscoveredRelatedPartyProcedureResults(discoveredRelatedPartyProcedureResults.map((item, itemIndex) => itemIndex === index ? value : item));
  };
  const discoveredProcedureIndexes = relatedPartyRequirementsAnswer === 'yes' ? [0, 1, 2, 3, 4, 5] : relatedPartyRequirementsAnswer === 'no' ? [0, 2, 3, 4, 5] : [];
  const discoveredProcedureTextByIndex = [
    t('financialReporting.discoveredProcedure1'),
    t('financialReporting.discoveredProcedure2'),
    t('financialReporting.discoveredProcedure3'),
    t('financialReporting.discoveredProcedure4'),
    t('financialReporting.discoveredProcedure5'),
    t('financialReporting.discoveredProcedure6')
  ];
  const handleTranslationStatementsChange = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    setHasTranslationStatements(isChecked);
    onFormDataChange({
      translationOfFinancialStatements: isChecked
    });
  };
  const addForeignCurrencyResponse = () => {
    const newId = Math.max(...foreignCurrencyResponses.map(r => r.id), 0) + 1;
    setForeignCurrencyResponses([...foreignCurrencyResponses, {
      id: newId,
      responseId: '',
      description: '',
      car: 'S'
    }]);
  };
  const updateForeignCurrencyResponse = (id: number, field: keyof Omit<ForeignCurrencyResponse, 'id'>, value: string) => {
    setForeignCurrencyResponses(foreignCurrencyResponses.map(response => response.id === id ? {
      ...response,
      [field]: value
    } : response));
  };
  const removeForeignCurrencyResponse = (id: number) => {
    setForeignCurrencyResponses(foreignCurrencyResponses.filter(response => response.id !== id));
  };
  const updateAccountingPolicySelection = (field: keyof typeof accountingPolicySelections, checked: boolean | 'indeterminate') => {
    setAccountingPolicySelections({
      ...accountingPolicySelections,
      [field]: checked === true
    });
  };
  const hasAccountingPolicySelection = Object.values(accountingPolicySelections).some(Boolean);
  return <CommentableQuestion fieldId="financial_reporting_main" label={t('financialReporting.title')}>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('financialReporting.processTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Understand the financial reporting process */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('financialReporting.understandProcess')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('financialReporting.relevantProcess')}
            </p>
            <Textarea placeholder={t('financialReporting.documentProcess')} className="min-h-[100px]" />
          </div>

          {/* Translation of financial statements */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="translation" checked={hasTranslationStatements} onCheckedChange={handleTranslationStatementsChange} />
              <Label htmlFor="translation">{t('financialReporting.translationStatements')}</Label>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                {t('financialReporting.separateSystems')}
              </p>
              <RadioGroup value={separateTransactionSystemsAnswer} onValueChange={value => handleSeparateTransactionSystemsAnswerChange(value as 'yes' | 'no')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="separate-systems-yes" />
                  <Label htmlFor="separate-systems-yes">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="separate-systems-no" />
                  <Label htmlFor="separate-systems-no">{t('common.no')}</Label>
                </div>
              </RadioGroup>
            </div>

            {separateTransactionSystemsAnswer === 'yes' && <div className="space-y-2">
                <p className="text-sm">
                  {t('financialReporting.indicateLayers')}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('financialReporting.itSystems')}</span>
                  <Button size="sm" onClick={addItSystem} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('common.add')}
                  </Button>
                </div>

                <Table>
                  <TableHeader className="bg-blue-900 [&_th]:text-white">
                    <TableRow>
                      <TableHead>{t('financialReporting.reference')}</TableHead>
                      <TableHead>{t('financialReporting.systemLayers')}</TableHead>
                      <TableHead>{t('financialReporting.descriptionLayer')}</TableHead>
                      <TableHead>{t('financialReporting.layerType')}</TableHead>
                      <TableHead>{t('financialReporting.outsourced')}</TableHead>
                      <TableHead>{t('financialReporting.automated')}</TableHead>
                      <TableHead>{t('financialReporting.manual')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itSystems.map(system => <TableRow key={system.id}>
                        <TableCell>
                          <Input value={system.reference} onChange={e => updateItSystem(system.id, 'reference', e.target.value)} placeholder="System reference ID" />
                        </TableCell>
                        <TableCell>
                          <Input value={system.systemLayer} onChange={e => updateItSystem(system.id, 'systemLayer', e.target.value)} placeholder="IT system layer name" />
                        </TableCell>
                        <TableCell>
                          <Input value={system.description} onChange={e => updateItSystem(system.id, 'description', e.target.value)} placeholder="Description of IT system layer" />
                        </TableCell>
                        <TableCell>
                          <Input value={system.layerType} onChange={e => updateItSystem(system.id, 'layerType', e.target.value)} placeholder="Layer type" />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Checkbox checked={system.outsourced} onCheckedChange={checked => updateItSystem(system.id, 'outsourced', checked)} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Checkbox checked={system.automated} onCheckedChange={checked => updateItSystem(system.id, 'automated', checked)} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Checkbox checked={system.manual} onCheckedChange={checked => updateItSystem(system.id, 'manual', checked)} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeItSystem(system.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>}

            {separateTransactionSystemsAnswer === 'no' && <div className="rounded-md border border-green-200 bg-green-50/60 px-3 py-2 text-xs text-green-900">
                No additional separate transaction processing IT systems were identified for this section.
              </div>}
          </div>

          {/* Information system support */}
          <div className="space-y-2">
            <p className="text-sm">
              {t('financialReporting.informationSystemSupport')}
            </p>
            <RadioGroup value={informationSystemSupportAnswer} onValueChange={value => setInformationSystemSupportAnswer(value as 'yes' | 'no')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="info-system-yes" />
                <Label htmlFor="info-system-yes">{t('common.yes')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="info-system-no" />
                <Label htmlFor="info-system-no">{t('common.no')}</Label>
              </div>
            </RadioGroup>
            {informationSystemSupportAnswer === 'no' && <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/60 p-3 space-y-2">
                <h4 className="font-medium text-amber-900">
                  {t('financialReporting.considerImpactAudit')}
                </h4>
                <Textarea value={informationSystemImpactNotes} onChange={e => setInformationSystemImpactNotes(e.target.value)} placeholder={t('financialReporting.considerImpactAuditPlaceholder')} className="min-h-[96px] bg-white" />
              </div>}
          </div>

          {/* Process understanding reference */}
          <div className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <div className="flex items-center justify-between bg-slate-100 px-3 py-2">
                <h4 className="font-medium text-slate-900">{t('financialReporting.processReference')}</h4>
                <Button size="sm" onClick={addProcessUnderstandingReference} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('common.add')}
                </Button>
              </div>
              <Table>
                <TableHeader className="bg-blue-900 [&_th]:text-white">
                  <TableRow>
                    <TableHead>{t('common.id')}</TableHead>
                    <TableHead>{t('financialReporting.reference')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processUnderstandingReferences.map((reference, index) => <TableRow key={reference.id}>
                      <TableCell className="w-24">
                        <Input value={reference.id.toString()} readOnly />
                      </TableCell>
                      <TableCell>
                        <Input value={reference.reference} onChange={e => updateProcessUnderstandingReference(reference.id, e.target.value)} placeholder={t('financialReporting.processReferencePlaceholder')} />
                      </TableCell>
                      <TableCell className="w-16">
                        {index > 0 && <Button variant="ghost" size="sm" onClick={() => removeProcessUnderstandingReference(reference.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>}
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="service-org" checked={isServiceOrganizationRelevant} onCheckedChange={handleServiceOrganizationRelevantChange} />
              <Label htmlFor="service-org">{t('financialReporting.serviceOrgRelevant')}</Label>
            </div>

            {isServiceOrganizationRelevant && <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <input ref={serviceOrgAttachmentInputRef} type="file" multiple className="hidden" onChange={handleServiceOrganizationFileChange} />
                  <Button size="sm" onClick={handleAttachServiceOrganizationFile} className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700" title={t('common.attachment')}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{t('financialReporting.addLinkServiceOrg')}</span>
                  <Button size="sm" variant="outline" onClick={addServiceOrganizationRow} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('common.add')}
                  </Button>
                </div>
                {serviceOrgAttachments.length > 0 && <p className="text-xs text-muted-foreground">
                    {t('common.attachment')}: {serviceOrgAttachments.join(', ')}
                  </p>}

                <Table>
                  <TableHeader className="bg-blue-900 [&_th]:text-white">
                    <TableRow>
                      <TableHead>{t('common.id')}</TableHead>
                      <TableHead>{t('common.description')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceOrganizationRows.map((row, index) => <TableRow key={row.id}>
                        <TableCell>
                          <Input value={row.idField} onChange={e => updateServiceOrganizationRow(row.id, 'idField', e.target.value)} placeholder={t('common.id')} />
                        </TableCell>
                        <TableCell>
                          <Input value={row.description} onChange={e => updateServiceOrganizationRow(row.id, 'description', e.target.value)} placeholder={t('common.description')} />
                        </TableCell>
                        <TableCell>
                          {index > 0 && <Button variant="ghost" size="sm" onClick={() => removeServiceOrganizationRow(row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>}
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>}
          </div>

          {/* Accounting policies */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('financialReporting.understandPolicies')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('financialReporting.selectApply')}
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="significant-changes" checked={accountingPolicySelections.significantChanges} onCheckedChange={checked => updateAccountingPolicySelection('significantChanges', checked)} />
                <Label htmlFor="significant-changes" className="text-sm">
                  {t('financialReporting.significantChanges')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="new-revised" checked={accountingPolicySelections.newRevised} onCheckedChange={checked => updateAccountingPolicySelection('newRevised', checked)} />
                <Label htmlFor="new-revised" className="text-sm">
                  {t('financialReporting.newRevised')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="judgment-required" checked={accountingPolicySelections.judgmentRequired} onCheckedChange={checked => updateAccountingPolicySelection('judgmentRequired', checked)} />
                <Label htmlFor="judgment-required" className="text-sm">
                  {t('financialReporting.judgmentRequired')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="controversial-areas" checked={accountingPolicySelections.controversialAreas} onCheckedChange={checked => updateAccountingPolicySelection('controversialAreas', checked)} />
                <Label htmlFor="controversial-areas" className="text-sm">
                  {t('financialReporting.controversialAreas')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="methods-policies" checked={accountingPolicySelections.methodsPolicies} onCheckedChange={checked => updateAccountingPolicySelection('methodsPolicies', checked)} />
                <Label htmlFor="methods-policies" className="text-sm">
                  {t('financialReporting.methodsPolicies')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="alternatives" checked={accountingPolicySelections.alternatives} onCheckedChange={checked => updateAccountingPolicySelection('alternatives', checked)} />
                <Label htmlFor="alternatives" className="text-sm">
                  {t('financialReporting.alternatives')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="management-bias" checked={accountingPolicySelections.managementBias} onCheckedChange={checked => updateAccountingPolicySelection('managementBias', checked)} />
                <Label htmlFor="management-bias" className="text-sm">
                  {t('financialReporting.managementBias')}
                </Label>
              </div>
            </div>

            {hasAccountingPolicySelection && <div className="space-y-2">
                <p className="text-sm">
                  {t('financialReporting.documentUnderstanding')}
                </p>
                <Textarea placeholder={t('financialReporting.documentUnderstanding')} className="min-h-[100px]" />
              </div>}
          </div>

          {/* Related parties */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('financialReporting.relatedParties')}</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleRelatedPartiesAttach} className="h-7 w-7 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
                <p className="text-sm">
                  {t('financialReporting.attachListing')}
                </p>
              </div>
              <input ref={relatedPartiesAttachmentInputRef} type="file" multiple className="hidden" onChange={handleRelatedPartiesAttachmentChange} />
              <div className="rounded border">
                <div className="bg-slate-100 px-3 py-2 text-sm font-medium">{t('common.attachment')}</div>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {relatedPartiesAttachments.length > 0 ? relatedPartiesAttachments.join(', ') : '-'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                {t('financialReporting.arrangementsQuestion')}
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={relatedPartiesArrangementsAnswer === 'yes' ? 'default' : 'outline'} onClick={() => setRelatedPartiesArrangementsAnswer('yes')}>{t('common.yes')}</Button>
                <Button size="sm" variant={relatedPartiesArrangementsAnswer === 'no' ? 'default' : 'outline'} onClick={() => setRelatedPartiesArrangementsAnswer('no')}>{t('common.no')}</Button>
                <Button size="sm" variant={relatedPartiesArrangementsAnswer === 'not_selected' ? 'default' : 'outline'} onClick={() => setRelatedPartiesArrangementsAnswer('not_selected')}>{t('common.notSelected')}</Button>
              </div>
            </div>

            {relatedPartiesArrangementsAnswer === 'yes' && <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('financialReporting.identifyArrangements')}</span>
                    <Button size="sm" onClick={addRelatedPartyArrangement} className="h-7 w-7 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Table>
                    <TableHeader className="bg-blue-900 [&_th]:text-white">
                      <TableRow>
                        <TableHead>{t('common.id')}</TableHead>
                        <TableHead>{t('common.description')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedPartyArrangements.map((arrangement, index) => <TableRow key={arrangement.id}>
                          <TableCell>
                            <Input value={arrangement.idField} onChange={e => updateRelatedPartyArrangement(arrangement.id, 'idField', e.target.value)} placeholder={t('common.id')} />
                          </TableCell>
                          <TableCell>
                            <Input value={arrangement.description} onChange={e => updateRelatedPartyArrangement(arrangement.id, 'description', e.target.value)} placeholder={t('common.description')} />
                          </TableCell>
                          <TableCell>
                            {index > 0 && <Button variant="ghost" size="sm" onClick={() => removeRelatedPartyArrangement(arrangement.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>}
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">{t('financialReporting.relatedPartiesIdentified')}</span>
                  <div className="flex justify-end">
                    <Button size="sm" onClick={addRelatedPartiesIdentifiedRow} className="h-7 w-7 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Table>
                    <TableHeader className="bg-blue-900 [&_th]:text-white">
                      <TableRow>
                        <TableHead>{t('common.id')}</TableHead>
                        <TableHead>{t('common.description')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedPartiesIdentifiedRows.map((row, index) => <TableRow key={row.id}>
                          <TableCell>
                            <Input value={row.idField} onChange={e => updateRelatedPartiesIdentifiedRow(row.id, 'idField', e.target.value)} placeholder={t('common.id')} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.description} onChange={e => updateRelatedPartiesIdentifiedRow(row.id, 'description', e.target.value)} placeholder={t('common.description')} />
                          </TableCell>
                          <TableCell>
                            {index > 0 && <Button variant="ghost" size="sm" onClick={() => removeRelatedPartiesIdentifiedRow(row.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>}
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    {t('financialReporting.processAuthQuestion')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant={relatedPartiesProcessAuthAnswer === 'yes' ? 'default' : 'outline'} onClick={() => setRelatedPartiesProcessAuthAnswer('yes')}>{t('common.yes')}</Button>
                    <Button size="sm" variant={relatedPartiesProcessAuthAnswer === 'no' ? 'default' : 'outline'} onClick={() => setRelatedPartiesProcessAuthAnswer('no')}>{t('common.no')}</Button>
                    <Button size="sm" variant={relatedPartiesProcessAuthAnswer === 'not_selected' ? 'default' : 'outline'} onClick={() => setRelatedPartiesProcessAuthAnswer('not_selected')}>{t('common.notSelected')}</Button>
                  </div>
                </div>

                {relatedPartiesProcessAuthAnswer === 'yes' && <div className="space-y-2">
                    <p className="text-sm">
                      {t('financialReporting.understandingQuestion')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={relatedPartiesUnderstandingAnswer === 'yes' ? 'default' : 'outline'} onClick={() => setRelatedPartiesUnderstandingAnswer('yes')}>{t('common.yes')}</Button>
                      <Button size="sm" variant={relatedPartiesUnderstandingAnswer === 'no' ? 'default' : 'outline'} onClick={() => setRelatedPartiesUnderstandingAnswer('no')}>{t('common.no')}</Button>
                      <Button size="sm" variant={relatedPartiesUnderstandingAnswer === 'not_selected' ? 'default' : 'outline'} onClick={() => setRelatedPartiesUnderstandingAnswer('not_selected')}>{t('common.notSelected')}</Button>
                    </div>
                  </div>}

                {relatedPartiesProcessAuthAnswer === 'no' && <div className="space-y-2">
                    <p className="text-sm">
                      {t('financialReporting.controlDeficienciesQuestion')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={relatedPartiesControlDefAnswer === 'yes' ? 'default' : 'outline'} onClick={() => setRelatedPartiesControlDefAnswer('yes')}>{t('common.yes')}</Button>
                      <Button size="sm" variant={relatedPartiesControlDefAnswer === 'no' ? 'default' : 'outline'} onClick={() => setRelatedPartiesControlDefAnswer('no')}>{t('common.no')}</Button>
                      <Button size="sm" variant={relatedPartiesControlDefAnswer === 'not_selected' ? 'default' : 'outline'} onClick={() => setRelatedPartiesControlDefAnswer('not_selected')}>{t('common.notSelected')}</Button>
                    </div>
                  </div>}

                {relatedPartiesProcessAuthAnswer === 'no' && relatedPartiesControlDefAnswer === 'yes' && <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t('financialReporting.identifyControlDeficiencies')}</span>
                      <Button size="sm" onClick={addControlDeficiencyRow} className="h-7 w-7 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Table>
                      <TableHeader className="bg-blue-900 [&_th]:text-white">
                        <TableRow>
                          <TableHead>{t('common.id')}</TableHead>
                          <TableHead>{t('common.description')}</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {controlDeficiencyRows.map((row, index) => <TableRow key={row.id}>
                            <TableCell>
                              <Input value={row.idField} onChange={e => updateControlDeficiencyRow(row.id, 'idField', e.target.value)} placeholder={t('common.id')} />
                            </TableCell>
                            <TableCell>
                              <Input value={row.description} onChange={e => updateControlDeficiencyRow(row.id, 'description', e.target.value)} placeholder={t('common.description')} />
                            </TableCell>
                            <TableCell>
                              {index > 0 && <Button variant="ghost" size="sm" onClick={() => removeControlDeficiencyRow(row.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>}
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>}
              </div>}
          </div>

          {/* Significant unusual transactions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('financialReporting.unusualTransactions')}</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="service-org-unusual" checked={hasUnusualServiceOrganization} onCheckedChange={checked => setHasUnusualServiceOrganization(checked === true)} />
              <Label htmlFor="service-org-unusual">{t('financialReporting.serviceOrgUsed')}</Label>
            </div>

            {hasUnusualServiceOrganization && <Textarea placeholder={t('financialReporting.unusualTransactions')} className="min-h-[100px]" />}
          </div>
          {/* Process understanding table */}
          <div className="space-y-4">
            <Table>
              <TableHeader className="bg-blue-900 [&_th]:text-white">
                <TableRow>
                  <TableHead>{t('businessProcesses.process')}</TableHead>
                  <TableHead>{t('financialReporting.processUnderstanding')}</TableHead>
                  <TableHead>{t('financialReporting.references')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="text-sm">
                      {t('financialReporting.understandProcess2')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={sutProcessUnderstanding} onValueChange={value => handleSutProcessUnderstandingChange(value as ProcessUnderstandingOption)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walkthrough">{t('financialReporting.walkthrough')}</SelectItem>
                        <SelectItem value="other_documentation">{t('financialReporting.otherDocumentation')}</SelectItem>
                        <SelectItem value="not_selected">{t('common.notSelected')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input value={sutReference} onChange={e => handleSutReferenceChange(e.target.value)} placeholder={t('financialReporting.references')} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex items-center space-x-2">
              <Checkbox id="identify-sut" checked={hasIdentifySut} onCheckedChange={checked => setHasIdentifySut(checked === true)} />
              <Label htmlFor="identify-sut" className="text-sm">
                {t('financialReporting.identifySut')}
              </Label>
            </div>

            {hasIdentifySut && <div className="space-y-2">
                <div className="flex justify-end">
                  <Button size="sm" onClick={addSutIdentifiedRow} className="h-7 w-7 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Table>
                  <TableHeader className="bg-blue-900 [&_th]:text-white">
                    <TableRow>
                      <TableHead>{t('common.id')}</TableHead>
                      <TableHead>{t('common.description')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sutIdentifiedRows.map((row, index) => <TableRow key={row.id}>
                        <TableCell>
                          <Input value={row.idField} onChange={e => updateSutIdentifiedRow(row.id, 'idField', e.target.value)} placeholder={t('common.id')} />
                        </TableCell>
                        <TableCell>
                          <Input value={row.description} onChange={e => updateSutIdentifiedRow(row.id, 'description', e.target.value)} placeholder={t('common.description')} />
                        </TableCell>
                        <TableCell>
                          {index > 0 && <Button variant="ghost" size="sm" onClick={() => removeSutIdentifiedRow(row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>}
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>}
          </div>

          {/* Risk assessment section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('financialReporting.riskAssessment')}
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                
                <Button size="sm" onClick={() => {}} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('financialReporting.rmLibrary')}
                </Button>
              </div>

              <Table>
                <TableHeader className="bg-blue-900 [&_th]:text-white">
                  <TableRow>
                    <TableHead>{t('common.id')}</TableHead>
                    <TableHead>{t('common.description')}</TableHead>
                    <TableHead>{t('financialReporting.car')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input placeholder={t('financialReporting.riskId')} />
                    </TableCell>
                    <TableCell>
                      <Input placeholder={t('financialReporting.riskDescription')} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="bg-green-600 text-white">S</Button>
                        <Button variant="outline" size="sm" className="bg-gray-600 text-white">N</Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Evaluate related parties section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('financialReporting.evaluateRelatedParties')}
            </h3>
            
            <p className="text-sm text-muted-foreground">
              {t('financialReporting.performProcedures')}
            </p>

            <Table>
              <TableHeader className="bg-blue-900 [&_th]:text-white">
                <TableRow>
                  <TableHead>{t('financialReporting.procedure')}</TableHead>
                  <TableHead>{t('financialReporting.result')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="align-top">
                    <p className="text-sm">{t('financialReporting.relatedPartyProcedure1')}</p>
                  </TableCell>
                  <TableCell>
                    <Textarea value={relatedPartiesProcedureResults[0]} onChange={e => updateRelatedPartiesProcedureResult(0, e.target.value)} placeholder={t('financialReporting.result')} className="min-h-[88px]" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="align-top">
                    <p className="text-sm">{t('financialReporting.relatedPartyProcedure2')}</p>
                  </TableCell>
                  <TableCell>
                    <Textarea value={relatedPartiesProcedureResults[1]} onChange={e => updateRelatedPartiesProcedureResult(1, e.target.value)} placeholder={t('financialReporting.result')} className="min-h-[88px]" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="align-top">
                    <p className="text-sm">{t('financialReporting.relatedPartyProcedure3')}</p>
                  </TableCell>
                  <TableCell>
                    <Textarea value={relatedPartiesProcedureResults[2]} onChange={e => updateRelatedPartiesProcedureResult(2, e.target.value)} placeholder={t('financialReporting.result')} className="min-h-[88px]" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  {t('financialReporting.additionalProcedures')}
                </p>
                <RadioGroup value={additionalProceduresAnswer} onValueChange={value => setAdditionalProceduresAnswer(value as 'yes' | 'no')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="additional-procedures-yes" />
                    <Label htmlFor="additional-procedures-yes">{t('common.yes')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="additional-procedures-no" />
                    <Label htmlFor="additional-procedures-no">{t('common.no')}</Label>
                  </div>
                </RadioGroup>
                {additionalProceduresAnswer === 'yes' && <div className="space-y-2 pt-2">
                    <div className="flex justify-end">
                      <Button size="sm" onClick={addAdditionalProcedureRow} className="h-7 w-7 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Table>
                      <TableHeader className="bg-blue-900 [&_th]:text-white">
                        <TableRow>
                          <TableHead>{t('financialReporting.procedure')}</TableHead>
                          <TableHead>{t('financialReporting.result')}</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {additionalProceduresRows.map((row, index) => <TableRow key={row.id}>
                            <TableCell>
                              <Textarea value={row.procedure} onChange={e => updateAdditionalProcedureRow(row.id, 'procedure', e.target.value)} placeholder={t('financialReporting.procedure')} className="min-h-[80px]" />
                            </TableCell>
                            <TableCell>
                              <Textarea value={row.result} onChange={e => updateAdditionalProcedureRow(row.id, 'result', e.target.value)} placeholder={t('financialReporting.result')} className="min-h-[80px]" />
                            </TableCell>
                            <TableCell>
                              {index > 0 && <Button variant="ghost" size="sm" onClick={() => removeAdditionalProcedureRow(row.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>}
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>}
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  {t('financialReporting.discoverRelated')}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant={discoverRelatedAnswer === 'yes' ? 'default' : 'outline'} onClick={() => setDiscoverRelatedAnswer('yes')}>{t('common.yes')}</Button>
                  <Button size="sm" variant={discoverRelatedAnswer === 'no' ? 'default' : 'outline'} onClick={() => setDiscoverRelatedAnswer('no')}>{t('common.no')}</Button>
                  <Button size="sm" variant={discoverRelatedAnswer === 'not_selected' ? 'default' : 'outline'} onClick={() => setDiscoverRelatedAnswer('not_selected')}>{t('common.notSelected')}</Button>
                </div>
                {discoverRelatedAnswer === 'yes' && <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <p className="text-sm">
                        {t('financialReporting.relatedPartyFrameworkQuestion')}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant={relatedPartyRequirementsAnswer === 'yes' ? 'default' : 'outline'} onClick={() => setRelatedPartyRequirementsAnswer('yes')}>{t('common.yes')}</Button>
                        <Button size="sm" variant={relatedPartyRequirementsAnswer === 'no' ? 'default' : 'outline'} onClick={() => setRelatedPartyRequirementsAnswer('no')}>{t('common.no')}</Button>
                        <Button size="sm" variant={relatedPartyRequirementsAnswer === 'not_selected' ? 'default' : 'outline'} onClick={() => setRelatedPartyRequirementsAnswer('not_selected')}>{t('common.notSelected')}</Button>
                      </div>
                    </div>

                    {relatedPartyRequirementsAnswer !== 'not_selected' && <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t('financialReporting.identifyArrangements')}</span>
                            <Button size="sm" onClick={addDiscoveredRelatedPartyRow} className="h-7 w-7 p-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Table>
                            <TableHeader className="bg-blue-900 [&_th]:text-white">
                              <TableRow>
                                <TableHead>{t('common.id')}</TableHead>
                                <TableHead>{t('common.description')}</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {discoveredRelatedPartyRows.map((row, index) => <TableRow key={row.id}>
                                  <TableCell>
                                    <Input value={row.idField} onChange={e => updateDiscoveredRelatedPartyRow(row.id, 'idField', e.target.value)} placeholder={t('common.id')} />
                                  </TableCell>
                                  <TableCell>
                                    <Input value={row.description} onChange={e => updateDiscoveredRelatedPartyRow(row.id, 'description', e.target.value)} placeholder={t('common.description')} />
                                  </TableCell>
                                  <TableCell>
                                    {index > 0 && <Button variant="ghost" size="sm" onClick={() => removeDiscoveredRelatedPartyRow(row.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>}
                                  </TableCell>
                                </TableRow>)}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">{t('financialReporting.performImpactProcedures')}</p>
                          <Table>
                            <TableHeader className="bg-blue-900 [&_th]:text-white">
                              <TableRow>
                                <TableHead>{t('financialReporting.procedure')}</TableHead>
                                <TableHead>{t('financialReporting.result')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {discoveredProcedureIndexes.map(index => <TableRow key={`discovered-procedure-${index}`}>
                                  <TableCell className="align-top">
                                    <p className="text-sm">{discoveredProcedureTextByIndex[index]}</p>
                                  </TableCell>
                                  <TableCell>
                                    <Textarea value={discoveredRelatedPartyProcedureResults[index]} onChange={e => updateDiscoveredProcedureResult(index, e.target.value)} placeholder={t('financialReporting.result')} className="min-h-[88px]" />
                                  </TableCell>
                                </TableRow>)}
                            </TableBody>
                          </Table>
                        </div>
                      </div>}
                  </div>}
              </div>
            </div>
          </div>

          {/* Design response section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('financialReporting.designResponse')}
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                
                <Button size="sm" onClick={() => {}} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('financialReporting.rmLibrary')}
                </Button>
              </div>

              <Table>
                <TableHeader className="bg-blue-900 [&_th]:text-white">
                  <TableRow>
                    <TableHead>{t('common.id')}</TableHead>
                    <TableHead>{t('common.description')}</TableHead>
                    <TableHead>{t('financialReporting.car')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input placeholder={t('financialReporting.responseId')} />
                    </TableCell>
                    <TableCell>
                      <Input placeholder={t('financialReporting.responseDescription')} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="bg-green-600 text-white">S</Button>
                        <Button variant="outline" size="sm" className="bg-gray-600 text-white">N</Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                {t('financialReporting.sufficientEvidence')}
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="sufficient-evidence-yes" />
                  <Label htmlFor="sufficient-evidence-yes">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="sufficient-evidence-no" />
                  <Label htmlFor="sufficient-evidence-no">{t('common.no')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {hasTranslationStatements && <Card className="border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">
                  {t('financialReporting.foreignCurrencyTranslationTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button size="sm" onClick={addForeignCurrencyResponse} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800">
                    <Plus className="h-4 w-4" />
                    {t('financialReporting.rmLibrary')}
                  </Button>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-blue-900 [&_th]:text-white">
                      <TableRow>
                        <TableHead>{t('common.id')}</TableHead>
                        <TableHead>{t('common.description')}</TableHead>
                        <TableHead>{t('financialReporting.car')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {foreignCurrencyResponses.map(response => <TableRow key={response.id} className="hover:bg-slate-50/80">
                          <TableCell>
                            <Input value={response.responseId} onChange={e => updateForeignCurrencyResponse(response.id, 'responseId', e.target.value)} placeholder={t('financialReporting.responseId')} />
                          </TableCell>
                          <TableCell>
                            <Input value={response.description} onChange={e => updateForeignCurrencyResponse(response.id, 'description', e.target.value)} placeholder={t('financialReporting.responseDescription')} />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className={response.car === 'S' ? 'bg-green-600 text-white border-green-600 hover:bg-green-600' : 'text-slate-700'} onClick={() => updateForeignCurrencyResponse(response.id, 'car', 'S')}>
                                S
                              </Button>
                              <Button variant="outline" size="sm" className={response.car === 'N' ? 'bg-slate-600 text-white border-slate-600 hover:bg-slate-600' : 'text-slate-700'} onClick={() => updateForeignCurrencyResponse(response.id, 'car', 'N')}>
                                N
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removeForeignCurrencyResponse(response.id)} disabled={foreignCurrencyResponses.length === 1}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    {t('financialReporting.sufficientEvidence')}
                  </p>
                  <RadioGroup value={foreignCurrencyEvidence} onValueChange={value => setForeignCurrencyEvidence(value as 'yes' | 'no')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="foreign-currency-evidence-yes" />
                      <Label htmlFor="foreign-currency-evidence-yes">{t('common.yes')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="foreign-currency-evidence-no" />
                      <Label htmlFor="foreign-currency-evidence-no">{t('common.no')}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>}
        </CardContent>
      </Card>
    </div>
    </CommentableQuestion>;
};
export default FinancialReportingProcessSection;


