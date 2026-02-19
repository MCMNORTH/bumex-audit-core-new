import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface FinancialReportingRelevantProcessesSectionProps {
  formData: any;
}

interface NameTitleRow {
  id: number;
  name: string;
  title: string;
}

interface LocationRow {
  id: number;
  date: string;
  location: string;
}

interface IdDescriptionRow {
  id: number;
  idField: string;
  description: string;
}

interface WalkthroughProcedureRow {
  id: number;
  description: string;
  initiation: boolean;
  authorization: boolean;
  processing: boolean;
  recording: boolean;
  observation: boolean;
  inspection: boolean;
  inquiry: boolean;
  transactionsTraced: string;
}

const FinancialReportingRelevantProcessesSection: React.FC<FinancialReportingRelevantProcessesSectionProps> = ({
  formData,
}) => {
  const isWalkthroughSelected = formData?.sutProcessUnderstanding === 'walkthrough';
  const processTitle = (formData?.sutReference || '').trim();

  const [attachments, setAttachments] = useState<string[]>([]);
  const [entityParticipants, setEntityParticipants] = useState<NameTitleRow[]>([{ id: 1, name: '', title: '' }]);
  const [kpmgParticipants, setKpmgParticipants] = useState<NameTitleRow[]>([{ id: 1, name: '', title: '' }]);
  const [locations, setLocations] = useState<LocationRow[]>([{ id: 1, date: '', location: '' }]);
  const [serviceOrganizations, setServiceOrganizations] = useState<IdDescriptionRow[]>([
    { id: 1, idField: '', description: '' },
  ]);
  const [walkthroughProcedures, setWalkthroughProcedures] = useState<WalkthroughProcedureRow[]>([
    {
      id: 1,
      description: '',
      initiation: false,
      authorization: false,
      processing: false,
      recording: false,
      observation: false,
      inspection: false,
      inquiry: false,
      transactionsTraced: '',
    },
  ]);
  const [attachRelevantDocuments, setAttachRelevantDocuments] = useState(false);
  const [additionalNarrativeDescription, setAdditionalNarrativeDescription] = useState(false);

  const addNameTitleRow = (
    rows: NameTitleRow[],
    setter: React.Dispatch<React.SetStateAction<NameTitleRow[]>>,
  ) => {
    const newId = Math.max(...rows.map((row) => row.id), 0) + 1;
    setter([...rows, { id: newId, name: '', title: '' }]);
  };

  const updateNameTitleRow = (
    rows: NameTitleRow[],
    setter: React.Dispatch<React.SetStateAction<NameTitleRow[]>>,
    id: number,
    field: 'name' | 'title',
    value: string,
  ) => {
    setter(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeNameTitleRow = (
    rows: NameTitleRow[],
    setter: React.Dispatch<React.SetStateAction<NameTitleRow[]>>,
    id: number,
  ) => {
    setter(rows.filter((row) => row.id !== id));
  };

  const addLocationRow = () => {
    const newId = Math.max(...locations.map((row) => row.id), 0) + 1;
    setLocations([...locations, { id: newId, date: '', location: '' }]);
  };

  const updateLocationRow = (id: number, field: 'date' | 'location', value: string) => {
    setLocations(locations.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeLocationRow = (id: number) => {
    setLocations(locations.filter((row) => row.id !== id));
  };

  const addServiceOrganizationRow = () => {
    const newId = Math.max(...serviceOrganizations.map((row) => row.id), 0) + 1;
    setServiceOrganizations([...serviceOrganizations, { id: newId, idField: '', description: '' }]);
  };

  const updateServiceOrganizationRow = (
    id: number,
    field: 'idField' | 'description',
    value: string,
  ) => {
    setServiceOrganizations(
      serviceOrganizations.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeServiceOrganizationRow = (id: number) => {
    setServiceOrganizations(serviceOrganizations.filter((row) => row.id !== id));
  };

  const addWalkthroughProcedureRow = () => {
    const newId = Math.max(...walkthroughProcedures.map((row) => row.id), 0) + 1;
    setWalkthroughProcedures([
      ...walkthroughProcedures,
      {
        id: newId,
        description: '',
        initiation: false,
        authorization: false,
        processing: false,
        recording: false,
        observation: false,
        inspection: false,
        inquiry: false,
        transactionsTraced: '',
      },
    ]);
  };

  const updateWalkthroughProcedureRow = (
    id: number,
    field:
      | 'description'
      | 'initiation'
      | 'authorization'
      | 'processing'
      | 'recording'
      | 'observation'
      | 'inspection'
      | 'inquiry'
      | 'transactionsTraced',
    value: string | boolean,
  ) => {
    setWalkthroughProcedures(
      walkthroughProcedures.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeWalkthroughProcedureRow = (id: number) => {
    setWalkthroughProcedures(walkthroughProcedures.filter((row) => row.id !== id));
  };

  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }
    setAttachments((prev) => [...prev, ...files.map((file) => file.name)]);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">
            Obtain an understanding of the process and procedures for preparing the financial statements,
            including disclosures
          </CardTitle>
        </CardHeader>
        {!isWalkthroughSelected ? (
          <CardContent className="min-h-[320px]" />
        ) : (
          <CardContent className="space-y-6">
            <div className="space-y-3 rounded-md border p-3">
              <div className="text-lg font-medium">{processTitle || 'Untitled process'}</div>
              <div className="space-y-2 text-sm">
                <div className="rounded border px-3 py-2">
                  Entity&apos;s process and procedures used to initiate, authorize, process and record journal entries and
                  other recurring and non-recurring adjustments
                </div>
                <div className="rounded border px-3 py-2">
                  Entity&apos;s process and procedures for preparing annual (and quarterly) financial statements and related
                  disclosures
                </div>
                <div className="rounded border px-3 py-2">Entity&apos;s process for identifying subsequent events</div>
                <div className="rounded border px-3 py-2">
                  Entity&apos;s process for identifying related parties, relationships and transactions
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">
                Document through a narrative or flowchart, our understanding of the process from initiation through
                reporting/disclosure in the financial statements
              </div>
              <div className="flex items-center gap-2">
                <Label className="inline-flex items-center gap-2 text-sm">
                  <Plus className="h-4 w-4" />
                  Attach flowcharts or a narrative
                </Label>
                <Input type="file" multiple onChange={handleAttachmentUpload} className="max-w-[320px]" />
              </div>
              <div className="rounded border">
                <div className="bg-blue-900 px-3 py-2 text-sm font-medium text-white">Attachment(s)</div>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {attachments.length ? attachments.join(', ') : '-'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold">Perform a walkthrough to understand the financial reporting process</h3>
              <p className="text-sm font-medium">Walkthrough overview:</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Entity participants</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => addNameTitleRow(entityParticipants, setEntityParticipants)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add row
                  </Button>
                </div>
                <Table>
                  <TableHeader className="bg-blue-900 [&_th]:text-white">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entityParticipants.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Input
                            value={row.name}
                            onChange={(event) =>
                              updateNameTitleRow(entityParticipants, setEntityParticipants, row.id, 'name', event.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.title}
                            onChange={(event) =>
                              updateNameTitleRow(entityParticipants, setEntityParticipants, row.id, 'title', event.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {index > 0 && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeNameTitleRow(entityParticipants, setEntityParticipants, row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">KPMG participants</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => addNameTitleRow(kpmgParticipants, setKpmgParticipants)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add row
                  </Button>
                </div>
                <Table>
                  <TableHeader className="bg-blue-900 [&_th]:text-white">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpmgParticipants.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Input
                            value={row.name}
                            onChange={(event) =>
                              updateNameTitleRow(kpmgParticipants, setKpmgParticipants, row.id, 'name', event.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.title}
                            onChange={(event) =>
                              updateNameTitleRow(kpmgParticipants, setKpmgParticipants, row.id, 'title', event.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {index > 0 && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeNameTitleRow(kpmgParticipants, setKpmgParticipants, row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Location walkthrough performed</span>
                  <Button type="button" size="sm" variant="outline" onClick={addLocationRow}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add row
                  </Button>
                </div>
                <Table>
                  <TableHeader className="bg-blue-900 [&_th]:text-white">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Input
                            type="date"
                            value={row.date}
                            onChange={(event) => updateLocationRow(row.id, 'date', event.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.location}
                            onChange={(event) => updateLocationRow(row.id, 'location', event.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          {index > 0 && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeLocationRow(row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Service organization(s) identified</span>
                  <Button type="button" size="sm" variant="outline" onClick={addServiceOrganizationRow}>
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
                    {serviceOrganizations.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Input
                            value={row.idField}
                            onChange={(event) => updateServiceOrganizationRow(row.id, 'idField', event.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.description}
                            onChange={(event) => updateServiceOrganizationRow(row.id, 'description', event.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          {index > 0 && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeServiceOrganizationRow(row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Walkthrough procedures</span>
                  <Button type="button" size="sm" variant="outline" onClick={addWalkthroughProcedureRow}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add row
                  </Button>
                </div>
                <Table>
                  <TableHeader className="bg-blue-900 [&_th]:text-white">
                    <TableRow>
                      <TableHead className="w-[70px]">ID</TableHead>
                      <TableHead>Description of the step in the process</TableHead>
                      <TableHead>Initiation</TableHead>
                      <TableHead>Authorization</TableHead>
                      <TableHead>Processing</TableHead>
                      <TableHead>Recording</TableHead>
                      <TableHead>Observation</TableHead>
                      <TableHead>Inspection</TableHead>
                      <TableHead>Inquiry</TableHead>
                      <TableHead>Transaction(s) traced</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {walkthroughProcedures.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>
                          <Input
                            value={row.description}
                            onChange={(event) =>
                              updateWalkthroughProcedureRow(row.id, 'description', event.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={row.initiation}
                            onCheckedChange={(checked) =>
                              updateWalkthroughProcedureRow(row.id, 'initiation', checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={row.authorization}
                            onCheckedChange={(checked) =>
                              updateWalkthroughProcedureRow(row.id, 'authorization', checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={row.processing}
                            onCheckedChange={(checked) =>
                              updateWalkthroughProcedureRow(row.id, 'processing', checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={row.recording}
                            onCheckedChange={(checked) =>
                              updateWalkthroughProcedureRow(row.id, 'recording', checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={row.observation}
                            onCheckedChange={(checked) =>
                              updateWalkthroughProcedureRow(row.id, 'observation', checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={row.inspection}
                            onCheckedChange={(checked) =>
                              updateWalkthroughProcedureRow(row.id, 'inspection', checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={row.inquiry}
                            onCheckedChange={(checked) =>
                              updateWalkthroughProcedureRow(row.id, 'inquiry', checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.transactionsTraced}
                            onChange={(event) =>
                              updateWalkthroughProcedureRow(row.id, 'transactionsTraced', event.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {index > 0 && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeWalkthroughProcedureRow(row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="attach-relevant-documents"
                    checked={attachRelevantDocuments}
                    onCheckedChange={(checked) => setAttachRelevantDocuments(checked === true)}
                  />
                  <Label htmlFor="attach-relevant-documents">
                    Attach relevant documents and other evidence obtained related to this step in the process.
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="additional-narrative-description"
                    checked={additionalNarrativeDescription}
                    onCheckedChange={(checked) => setAdditionalNarrativeDescription(checked === true)}
                  />
                  <Label htmlFor="additional-narrative-description">Additional narrative description.</Label>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default FinancialReportingRelevantProcessesSection;
