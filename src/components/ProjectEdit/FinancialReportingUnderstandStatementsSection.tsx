import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

type TriState = 'yes' | 'no' | 'not_selected';
type CarType = 'S' | 'N';

interface IdDescriptionRow {
  id: number;
  idField: string;
  description: string;
}

interface AdditionalProcedureRow {
  id: number;
  procedureId: string;
  procedureDescription: string;
  rmms: string;
  auditEvidence: string;
}

interface SummaryProcedureRow {
  id: number;
  summaryId: string;
  description: string;
  car: CarType;
}

const triStateButtonClass = (value: TriState, current: TriState) =>
  value === current ? 'bg-blue-900 text-white hover:bg-blue-900' : '';

interface FinancialReportingUnderstandStatementsSectionProps {
  onNavigateToRelevantProcesses?: () => void;
}

const FinancialReportingUnderstandStatementsSection: React.FC<FinancialReportingUnderstandStatementsSectionProps> = ({
  onNavigateToRelevantProcesses,
}) => {
  const [financialStatementComponents, setFinancialStatementComponents] = useState([
    { id: 'statement_of_financial_position', label: 'Statement of financial position or equivalent', applicable: false },
    {
      id: 'statement_of_profit_or_loss',
      label: 'Statement of profit or loss and other comprehensive income or equivalent',
      applicable: false,
    },
    { id: 'statement_of_changes_in_equity', label: 'Statement of changes in equity or equivalent', applicable: false },
    { id: 'statement_of_cash_flows', label: 'Statement of cash flows or equivalent', applicable: false },
    { id: 'segment_information', label: 'Segment information', applicable: false },
  ]);
  const [hasOtherInformationInAnnualReport, setHasOtherInformationInAnnualReport] = useState(false);
  const [additionalRmmsAnswer, setAdditionalRmmsAnswer] = useState<TriState>('not_selected');
  const [contradictoryEvidence, setContradictoryEvidence] = useState(false);
  const [contradictoryEvidenceNote, setContradictoryEvidenceNote] = useState('');
  const [controlDeficienciesAnswer, setControlDeficienciesAnswer] = useState<TriState>('not_selected');
  const [auditMisstatementsAnswer, setAuditMisstatementsAnswer] = useState<TriState>('not_selected');
  const [additionalEvidenceAnswer, setAdditionalEvidenceAnswer] = useState<TriState>('not_selected');
  const [sufficientEvidenceAnswer, setSufficientEvidenceAnswer] = useState<TriState>('not_selected');
  const [additionalEvidenceDescription, setAdditionalEvidenceDescription] = useState('');

  const [additionalProcedureRows, setAdditionalProcedureRows] = useState<AdditionalProcedureRow[]>([
    { id: 1, procedureId: '', procedureDescription: '', rmms: '', auditEvidence: '' },
  ]);
  const [summaryProcedureRows, setSummaryProcedureRows] = useState<SummaryProcedureRow[]>([
    { id: 1, summaryId: '', description: '', car: 'S' },
  ]);
  const [controlDeficiencyRows, setControlDeficiencyRows] = useState<IdDescriptionRow[]>([
    { id: 1, idField: '', description: '' },
  ]);
  const [auditMisstatementRows, setAuditMisstatementRows] = useState<IdDescriptionRow[]>([
    { id: 1, idField: '', description: '' },
  ]);

  const addAdditionalProcedureRow = () => {
    const newId = Math.max(...additionalProcedureRows.map((row) => row.id), 0) + 1;
    setAdditionalProcedureRows([
      ...additionalProcedureRows,
      { id: newId, procedureId: '', procedureDescription: '', rmms: '', auditEvidence: '' },
    ]);
  };

  const updateAdditionalProcedureRow = (
    id: number,
    field: keyof Omit<AdditionalProcedureRow, 'id'>,
    value: string,
  ) => {
    setAdditionalProcedureRows(
      additionalProcedureRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeAdditionalProcedureRow = (id: number) => {
    setAdditionalProcedureRows(additionalProcedureRows.filter((row) => row.id !== id));
  };

  const addSummaryProcedureRow = () => {
    const newId = Math.max(...summaryProcedureRows.map((row) => row.id), 0) + 1;
    setSummaryProcedureRows([...summaryProcedureRows, { id: newId, summaryId: '', description: '', car: 'S' }]);
  };

  const updateSummaryProcedureRow = (
    id: number,
    field: keyof Omit<SummaryProcedureRow, 'id'>,
    value: string | CarType,
  ) => {
    setSummaryProcedureRows(summaryProcedureRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeSummaryProcedureRow = (id: number) => {
    setSummaryProcedureRows(summaryProcedureRows.filter((row) => row.id !== id));
  };

  const addControlDeficiencyRow = () => {
    const newId = Math.max(...controlDeficiencyRows.map((row) => row.id), 0) + 1;
    setControlDeficiencyRows([...controlDeficiencyRows, { id: newId, idField: '', description: '' }]);
  };

  const updateControlDeficiencyRow = (
    id: number,
    field: keyof Omit<IdDescriptionRow, 'id'>,
    value: string,
  ) => {
    setControlDeficiencyRows(
      controlDeficiencyRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeControlDeficiencyRow = (id: number) => {
    setControlDeficiencyRows(controlDeficiencyRows.filter((row) => row.id !== id));
  };

  const addAuditMisstatementRow = () => {
    const newId = Math.max(...auditMisstatementRows.map((row) => row.id), 0) + 1;
    setAuditMisstatementRows([...auditMisstatementRows, { id: newId, idField: '', description: '' }]);
  };

  const updateAuditMisstatementRow = (
    id: number,
    field: keyof Omit<IdDescriptionRow, 'id'>,
    value: string,
  ) => {
    setAuditMisstatementRows(
      auditMisstatementRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeAuditMisstatementRow = (id: number) => {
    setAuditMisstatementRows(auditMisstatementRows.filter((row) => row.id !== id));
  };

  const updateFinancialStatementComponent = (componentId: string, checked: boolean | 'indeterminate') => {
    setFinancialStatementComponents((prev) =>
      prev.map((component) =>
        component.id === componentId ? { ...component, applicable: checked === true } : component,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">Understand the financial statements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm font-medium">
            The financial statements are comprised of the following:
          </div>
          <Table>
            <TableHeader className="bg-blue-900 [&_th]:text-white">
              <TableRow>
                <TableHead>Components</TableHead>
                <TableHead className="w-[160px] text-center">Applicable?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialStatementComponents.map((component) => (
                <TableRow key={component.id}>
                  <TableCell>{component.label}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={component.applicable}
                      onCheckedChange={(checked) => updateFinancialStatementComponent(component.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center gap-2">
            <Checkbox
              id="other-information-annual-report"
              checked={hasOtherInformationInAnnualReport}
              onCheckedChange={(checked) => setHasOtherInformationInAnnualReport(checked === true)}
            />
            <Label htmlFor="other-information-annual-report">
              There is other information included in the annual report (if any)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-2xl">Design and perform procedures</CardTitle>
            <div className="flex items-center gap-3">
              {onNavigateToRelevantProcesses && (
                <Button type="button" variant="link" onClick={onNavigateToRelevantProcesses}>
                  2. Relevant processes
                </Button>
              )}
              <Button type="button" size="sm" className="bg-green-600 hover:bg-green-700">
                RM Library
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-semibold">Identify and assess risks of misstatement</h3>
          <Table>
            <TableHeader className="bg-blue-900 [&_th]:text-white">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Inherent risk</TableHead>
                <TableHead>Control approach</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>FRP001.0.11</TableCell>
                <TableCell>Required disclosures have been omitted.</TableCell>
                <TableCell>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                    B
                  </span>
                </TableCell>
                <TableCell>N</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Perform required procedures</h3>
          <Table>
            <TableHeader className="bg-blue-900 [&_th]:text-white">
              <TableRow>
                <TableHead>Procedure description</TableHead>
                <TableHead>RMMs</TableHead>
                <TableHead>Audit evidence obtained</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Attachment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <Checkbox id="disclosure-checklist" />
                    <Label htmlFor="disclosure-checklist" className="font-normal">
                      Complete the accounting disclosure checklist to address "Required disclosures have been omitted."
                    </Label>
                  </div>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>

          <div className="space-y-2">
            <p className="text-sm">Are additional procedures necessary to address additional RMMs identified?</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className={triStateButtonClass('yes', additionalRmmsAnswer)} onClick={() => setAdditionalRmmsAnswer('yes')}>
                Yes
              </Button>
              <Button size="sm" variant="outline" className={triStateButtonClass('no', additionalRmmsAnswer)} onClick={() => setAdditionalRmmsAnswer('no')}>
                No
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={triStateButtonClass('not_selected', additionalRmmsAnswer)}
                onClick={() => setAdditionalRmmsAnswer('not_selected')}
              >
                Not selected
              </Button>
            </div>
          </div>

          {additionalRmmsAnswer === 'yes' && (
            <div className="space-y-3 rounded-md border p-3">
              <Button type="button" variant="ghost" className="h-auto p-0 text-sm font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Additional procedures
              </Button>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={addAdditionalProcedureRow}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add row
                </Button>
              </div>
              <Table>
                <TableHeader className="bg-blue-900 [&_th]:text-white">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Procedure description</TableHead>
                    <TableHead>RMMs</TableHead>
                    <TableHead>Audit evidence obtained</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {additionalProcedureRows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input value={row.procedureId} onChange={(e) => updateAdditionalProcedureRow(row.id, 'procedureId', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.procedureDescription}
                          onChange={(e) => updateAdditionalProcedureRow(row.id, 'procedureDescription', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input value={row.rmms} onChange={(e) => updateAdditionalProcedureRow(row.id, 'rmms', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.auditEvidence}
                          onChange={(e) => updateAdditionalProcedureRow(row.id, 'auditEvidence', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        {index > 0 && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeAdditionalProcedureRow(row.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Summary of procedures performed to respond to the RMM related to the period-end financial reporting process
              </p>
              <Button type="button" size="sm" variant="outline" onClick={addSummaryProcedureRow}>
                <Plus className="mr-2 h-4 w-4" />
                Add row
              </Button>
            </div>
            <Table>
              <TableHeader className="bg-blue-900 [&_th]:text-white">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>CAR</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryProcedureRows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input value={row.summaryId} onChange={(e) => updateSummaryProcedureRow(row.id, 'summaryId', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={row.description} onChange={(e) => updateSummaryProcedureRow(row.id, 'description', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className={row.car === 'S' ? 'bg-green-600 text-white hover:bg-green-600' : ''}
                          onClick={() => updateSummaryProcedureRow(row.id, 'car', 'S')}
                        >
                          S
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className={row.car === 'N' ? 'bg-slate-700 text-white hover:bg-slate-700' : ''}
                          onClick={() => updateSummaryProcedureRow(row.id, 'car', 'N')}
                        >
                          N
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {index > 0 && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeSummaryProcedureRow(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="contradictory-evidence" checked={contradictoryEvidence} onCheckedChange={(checked) => setContradictoryEvidence(checked === true)} />
            <Label htmlFor="contradictory-evidence">Contradictory or inconsistent evidence identified</Label>
          </div>
          {contradictoryEvidence && (
            <div className="space-y-2">
              <p className="text-sm">Document the contradictory audit evidence and the procedures performed to address it.</p>
              <Textarea
                className="min-h-[180px]"
                value={contradictoryEvidenceNote}
                onChange={(e) => setContradictoryEvidenceNote(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm">Did we identify any control deficiencies?</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className={triStateButtonClass('yes', controlDeficienciesAnswer)} onClick={() => setControlDeficienciesAnswer('yes')}>
                Yes
              </Button>
              <Button size="sm" variant="outline" className={triStateButtonClass('no', controlDeficienciesAnswer)} onClick={() => setControlDeficienciesAnswer('no')}>
                No
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={triStateButtonClass('not_selected', controlDeficienciesAnswer)}
                onClick={() => setControlDeficienciesAnswer('not_selected')}
              >
                Not selected
              </Button>
            </div>
          </div>

          {controlDeficienciesAnswer === 'yes' && (
            <div className="space-y-2">
              <Button type="button" variant="ghost" className="h-auto p-0 text-sm font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Identify control deficiency(ies)
              </Button>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={addControlDeficiencyRow}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add row
                </Button>
              </div>
              <Table>
                <TableHeader className="bg-blue-900 [&_th]:text-white">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controlDeficiencyRows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input value={row.idField} onChange={(e) => updateControlDeficiencyRow(row.id, 'idField', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input value={row.description} onChange={(e) => updateControlDeficiencyRow(row.id, 'description', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        {index > 0 && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeControlDeficiencyRow(row.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm">Did we identify any audit misstatements?</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className={triStateButtonClass('yes', auditMisstatementsAnswer)} onClick={() => setAuditMisstatementsAnswer('yes')}>
                Yes
              </Button>
              <Button size="sm" variant="outline" className={triStateButtonClass('no', auditMisstatementsAnswer)} onClick={() => setAuditMisstatementsAnswer('no')}>
                No
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={triStateButtonClass('not_selected', auditMisstatementsAnswer)}
                onClick={() => setAuditMisstatementsAnswer('not_selected')}
              >
                Not selected
              </Button>
            </div>
          </div>

          {auditMisstatementsAnswer === 'yes' && (
            <div className="space-y-2">
              <Button type="button" variant="ghost" className="h-auto p-0 text-sm font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Identify audit misstatement(s)
              </Button>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={addAuditMisstatementRow}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add row
                </Button>
              </div>
              <Table>
                <TableHeader className="bg-blue-900 [&_th]:text-white">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditMisstatementRows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input value={row.idField} onChange={(e) => updateAuditMisstatementRow(row.id, 'idField', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input value={row.description} onChange={(e) => updateAuditMisstatementRow(row.id, 'description', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        {index > 0 && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeAuditMisstatementRow(row.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm">Are additional procedures necessary to obtain sufficient appropriate evidence?</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className={triStateButtonClass('yes', additionalEvidenceAnswer)} onClick={() => setAdditionalEvidenceAnswer('yes')}>
                Yes
              </Button>
              <Button size="sm" variant="outline" className={triStateButtonClass('no', additionalEvidenceAnswer)} onClick={() => setAdditionalEvidenceAnswer('no')}>
                No
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={triStateButtonClass('not_selected', additionalEvidenceAnswer)}
                onClick={() => setAdditionalEvidenceAnswer('not_selected')}
              >
                Not selected
              </Button>
            </div>
          </div>

          {additionalEvidenceAnswer === 'yes' && (
            <div className="space-y-2">
              <p className="text-sm">Describe the audit procedures performed to obtain further audit evidence.</p>
              <Textarea
                className="min-h-[180px]"
                value={additionalEvidenceDescription}
                onChange={(e) => setAdditionalEvidenceDescription(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm">
              Sufficient appropriate audit evidence obtained for all RMMs associated with the period-end financial reporting process:
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className={triStateButtonClass('yes', sufficientEvidenceAnswer)} onClick={() => setSufficientEvidenceAnswer('yes')}>
                Yes
              </Button>
              <Button size="sm" variant="outline" className={triStateButtonClass('no', sufficientEvidenceAnswer)} onClick={() => setSufficientEvidenceAnswer('no')}>
                No
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={triStateButtonClass('not_selected', sufficientEvidenceAnswer)}
                onClick={() => setSufficientEvidenceAnswer('not_selected')}
              >
                Not selected
              </Button>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportingUnderstandStatementsSection;
