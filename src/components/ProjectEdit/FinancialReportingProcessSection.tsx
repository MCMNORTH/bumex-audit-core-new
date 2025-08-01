import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
interface FinancialReportingProcessSectionProps {
  formData: any;
  onFormDataChange: (updates: any) => void;
}
const FinancialReportingProcessSection: React.FC<FinancialReportingProcessSectionProps> = ({
  formData,
  onFormDataChange
}) => {
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
  const [serviceOrganizations, setServiceOrganizations] = useState([{
    id: 1,
    description: ''
  }]);
  const [relatedPartyArrangements, setRelatedPartyArrangements] = useState([{
    id: 1,
    idField: '',
    description: ''
  }]);
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
  const removeItSystem = (id: number) => {
    setItSystems(itSystems.filter(s => s.id !== id));
  };
  const updateItSystem = (id: number, field: string, value: any) => {
    setItSystems(itSystems.map(s => s.id === id ? {
      ...s,
      [field]: value
    } : s));
  };
  const addServiceOrganization = () => {
    const newId = Math.max(...serviceOrganizations.map(s => s.id), 0) + 1;
    setServiceOrganizations([...serviceOrganizations, {
      id: newId,
      description: ''
    }]);
  };
  const removeServiceOrganization = (id: number) => {
    setServiceOrganizations(serviceOrganizations.filter(s => s.id !== id));
  };
  const updateServiceOrganization = (id: number, field: string, value: string) => {
    setServiceOrganizations(serviceOrganizations.map(s => s.id === id ? {
      ...s,
      [field]: value
    } : s));
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
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Financial reporting process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Understand the financial reporting process */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Understand the financial reporting process</h3>
            <p className="text-sm text-muted-foreground">
              The following are relevant to the process and procedures to enter transaction totals into the general ledger:
            </p>
            <Textarea placeholder="Document the process and procedures to enter transaction totals into the general ledger..." className="min-h-[100px]" />
          </div>

          {/* Translation of financial statements */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="translation" />
              <Label htmlFor="translation">Translation of financial statements</Label>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                Does the entity have separate transaction processing IT systems that were not included in our walkthroughs of related business processes?
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="separate-systems-yes" />
                  <Label htmlFor="separate-systems-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="separate-systems-no" />
                  <Label htmlFor="separate-systems-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                Indicate which of the listed layers of technology comprising IT systems used in the financial reporting process are involved in the initiation, authorization, processing and recording of automated and/or manual journal entries
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">IT Systems</span>
                <Button size="sm" onClick={addItSystem} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>IT system layer(s)</TableHead>
                    <TableHead>Description of IT system layer</TableHead>
                    <TableHead>Layer type</TableHead>
                    <TableHead>Outsourced</TableHead>
                    <TableHead>Automated</TableHead>
                    <TableHead>Manual</TableHead>
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
            </div>
          </div>

          {/* Information system support */}
          <div className="space-y-2">
            <p className="text-sm">
              Based on our understanding obtained of the entity's overall IT environment, the entity's business processes and financial reporting process, does the entity's information system appropriately support the preparation of the entity's financial statements in accordance with the applicable financial reporting framework?
            </p>
            <RadioGroup>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="info-system-yes" />
                <Label htmlFor="info-system-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="info-system-no" />
                <Label htmlFor="info-system-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Process understanding reference */}
          <div className="space-y-4">
            <h4 className="font-medium bg-blue-900 text-white p-2 rounded">Process understanding reference</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="service-org" defaultChecked />
              <Label htmlFor="service-org">The entity uses a service organization that is relevant to this process</Label>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium bg-blue-900 text-white p-2 rounded">Add / link service organization(s)</span>
                <Button size="sm" onClick={addServiceOrganization} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceOrganizations.map(org => <TableRow key={org.id}>
                      <TableCell>
                        <Input value={org.id.toString()} readOnly />
                      </TableCell>
                      <TableCell>
                        <Input value={org.description} onChange={e => updateServiceOrganization(org.id, 'description', e.target.value)} placeholder="Service organization description" />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeServiceOrganization(org.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Accounting policies */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Understand the selection and application of accounting policies or principles</h3>
            <p className="text-sm text-muted-foreground">
              From the list below, select all the items that apply to entity's circumstances which are not already documented in accounting processes
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="significant-changes" />
                <Label htmlFor="significant-changes" className="text-sm">
                  There are significant changes in the entity's accounting policies or principles, financial reporting policies or principles, or disclosures
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="new-revised" />
                <Label htmlFor="new-revised" className="text-sm">
                  There are new or revised financial reporting standards, laws or regulations that affect the entity's accounting policies or practices, including related disclosures
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="judgment-required" defaultChecked />
                <Label htmlFor="judgment-required" className="text-sm">
                  Judgment is required by management in the application of significant accounting policies or principles
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="controversial-areas" />
                <Label htmlFor="controversial-areas" className="text-sm">
                  There are accounting policies or principles in controversial or emerging areas lacking authoritative guidance
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="methods-policies" />
                <Label htmlFor="methods-policies" className="text-sm">
                  There are policies or principles relating to methods the entity uses to account for significant and unusual transaction(s)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="alternatives" />
                <Label htmlFor="alternatives" className="text-sm">
                  There are alternatives in the selection and application of accounting principles
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="management-bias" />
                <Label htmlFor="management-bias" className="text-sm">
                  There are indicators of management bias present in the entity's selection and application of significant accounting policies or principles
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                Document our understanding and include, if applicable, financial reporting standards, laws, and regulations that are new to the entity, setting out when and how the entity will adopt such requirements.
              </p>
              <Textarea placeholder="Document understanding of financial reporting standards, laws, and regulations new to the entity..." className="min-h-[100px]" />
            </div>
          </div>

          {/* Related parties */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Understand the entity's process for related parties</h3>
            
            <div className="space-y-2">
              <p className="text-sm">
                Attach a listing of the entity's related parties, including our understanding of the nature of the entity's relationships and transactions with those related parties.
              </p>
              <div className="bg-blue-900 text-white p-2 rounded">
                <span className="text-sm">Attachment</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                Has management identified any arrangements or transactions with related parties?
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="arrangements-yes" />
                  <Label htmlFor="arrangements-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="arrangements-no" />
                  <Label htmlFor="arrangements-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Identify arrangements or transactions with related parties, including related party significant unusual transactions</span>
                <Button size="sm" onClick={addRelatedPartyArrangement} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedPartyArrangements.map(arrangement => <TableRow key={arrangement.id}>
                      <TableCell>
                        <Input value={arrangement.idField} onChange={e => updateRelatedPartyArrangement(arrangement.id, 'idField', e.target.value)} placeholder="Arrangement ID" />
                      </TableCell>
                      <TableCell>
                        <Input value={arrangement.description} onChange={e => updateRelatedPartyArrangement(arrangement.id, 'description', e.target.value)} placeholder="Description of related party arrangement" />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeRelatedPartyArrangement(arrangement.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                Does the entity have a process for authorizing and approving significant transactions and arrangements with related parties and a process for accounting for and disclosing relationships with related parties in the financial statements within the respective accounting process(es)?
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="process-yes" />
                  <Label htmlFor="process-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="process-no" />
                  <Label htmlFor="process-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                Have we obtained an understanding of the entity's process for authorizing and approving significant transactions and arrangements with related parties and the entity's process for accounting for and disclosing relationships with related parties in the financial statements within the respective accounting process(es)?
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="understanding-yes" />
                  <Label htmlFor="understanding-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="understanding-no" />
                  <Label htmlFor="understanding-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Significant unusual transactions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Understand the entity's process for identifying significant unusual transactions</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="service-org-unusual" />
              <Label htmlFor="service-org-unusual">The entity uses a service organization that is relevant to this process</Label>
            </div>

            <Textarea placeholder="Document understanding of entity's process for identifying significant unusual transactions..." className="min-h-[100px]" />
          </div>

          {/* Process understanding table */}
          <div className="space-y-4">
            <div className="bg-blue-900 text-white p-2 rounded flex justify-between">
              <span className="font-medium">Process understanding</span>
              <span className="font-medium">Reference</span>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Process</TableHead>
                  <TableHead>Walkthrough</TableHead>
                  <TableHead>Financial Statement Making</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="text-sm">
                      Understand the entity's process to identify, authorize, and approve significant unusual transactions.
                    </div>
                  </TableCell>
                  <TableCell>Walkthrough</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>Financial Statement Making</span>
                      <Button variant="ghost" size="sm">
                        <span className="text-blue-600">🔗</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="text-sm">
                      Understand the entity's process to identify, authorize, and approve significant unusual transactions.
                    </div>
                  </TableCell>
                  <TableCell>Walkthrough</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>Financial Statement Making</span>
                      <Button variant="ghost" size="sm">
                        <span className="text-blue-600">🔗</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex items-center space-x-2">
              <Checkbox id="identify-sut" />
              <Label htmlFor="identify-sut" className="text-sm">
                Identify significant unusual transactions (except for related party SUTs identified based on our inquiries with management)
              </Label>
            </div>
          </div>

          {/* Risk assessment section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Assess risk of misstatement, identify PRPs and evaluate controls related to the identification of related parties and significant unusual transactions
            </h3>
            
            <Textarea placeholder="Document assessment of risks related to identification of related parties and significant unusual transactions..." className="min-h-[100px]" />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                
                <Button size="sm" onClick={() => {}} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>CAR</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input placeholder="Risk ID" />
                    </TableCell>
                    <TableCell>
                      <Input placeholder="Risk description" />
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
              Evaluate whether all related parties, relationships and transactions have been identified
            </h3>
            
            <p className="text-sm text-muted-foreground">
              To address the identified risks, perform procedures to evaluate whether the entity has identified its related parties, relationships and transactions:
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                
                <Button size="sm" onClick={() => {}} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input placeholder="Describe procedure to evaluate related parties identification" />
                    </TableCell>
                    <TableCell>
                      <Input placeholder="Document procedure result" />
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

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  Are additional procedures necessary to obtain sufficient appropriate evidence?
                </p>
                <RadioGroup>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="additional-procedures-yes" />
                    <Label htmlFor="additional-procedures-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="additional-procedures-no" />
                    <Label htmlFor="additional-procedures-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  Did we discover related parties, or significant related party transactions that management did not identify or disclose to us?
                </p>
                <RadioGroup>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="discover-related-yes" />
                    <Label htmlFor="discover-related-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="discover-related-no" />
                    <Label htmlFor="discover-related-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Design response section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Design a response to address the RMM(s) related to subsequent events
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                
                <Button size="sm" onClick={() => {}} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>CAR</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input placeholder="Response ID" />
                    </TableCell>
                    <TableCell>
                      <Input placeholder="Response description for subsequent events RMM" />
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
                Sufficient appropriate audit evidence obtained for all RMMs associated with the subsequent events:
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="sufficient-evidence-yes" />
                  <Label htmlFor="sufficient-evidence-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="sufficient-evidence-no" />
                  <Label htmlFor="sufficient-evidence-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default FinancialReportingProcessSection;