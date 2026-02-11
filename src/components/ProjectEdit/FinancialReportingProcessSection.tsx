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
import { CommentableQuestion } from './Comments';
import { useTranslation } from '@/contexts/TranslationContext';

interface FinancialReportingProcessSectionProps {
  formData: any;
  onFormDataChange: (updates: any) => void;
}

const FinancialReportingProcessSection: React.FC<FinancialReportingProcessSectionProps> = ({
  formData,
  onFormDataChange
}) => {
  const { t } = useTranslation();
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
              <Checkbox id="translation" />
              <Label htmlFor="translation">{t('financialReporting.translationStatements')}</Label>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                {t('financialReporting.separateSystems')}
              </p>
              <RadioGroup>
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

            <div className="space-y-2">
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
                <TableHeader>
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
            </div>
          </div>

          {/* Information system support */}
          <div className="space-y-2">
            <p className="text-sm">
              {t('financialReporting.informationSystemSupport')}
            </p>
            <RadioGroup>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="info-system-yes" />
                <Label htmlFor="info-system-yes">{t('common.yes')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="info-system-no" />
                <Label htmlFor="info-system-no">{t('common.no')}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Process understanding reference */}
          <div className="space-y-4">
            <h4 className="font-medium bg-blue-900 text-white p-2 rounded">{t('financialReporting.processReference')}</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="service-org" defaultChecked />
              <Label htmlFor="service-org">{t('financialReporting.serviceOrgRelevant')}</Label>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium bg-blue-900 text-white p-2 rounded">{t('financialReporting.addLinkServiceOrg')}</span>
                <Button size="sm" onClick={addServiceOrganization} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('common.add')}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.id')}</TableHead>
                    <TableHead>{t('common.description')}</TableHead>
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
            <h3 className="text-lg font-medium">{t('financialReporting.understandPolicies')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('financialReporting.selectApply')}
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="significant-changes" />
                <Label htmlFor="significant-changes" className="text-sm">
                  {t('financialReporting.significantChanges')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="new-revised" />
                <Label htmlFor="new-revised" className="text-sm">
                  {t('financialReporting.newRevised')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="judgment-required" defaultChecked />
                <Label htmlFor="judgment-required" className="text-sm">
                  {t('financialReporting.judgmentRequired')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="controversial-areas" />
                <Label htmlFor="controversial-areas" className="text-sm">
                  {t('financialReporting.controversialAreas')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="methods-policies" />
                <Label htmlFor="methods-policies" className="text-sm">
                  {t('financialReporting.methodsPolicies')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="alternatives" />
                <Label htmlFor="alternatives" className="text-sm">
                  {t('financialReporting.alternatives')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="management-bias" />
                <Label htmlFor="management-bias" className="text-sm">
                  {t('financialReporting.managementBias')}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                {t('financialReporting.documentUnderstanding')}
              </p>
              <Textarea placeholder={t('financialReporting.documentUnderstanding')} className="min-h-[100px]" />
            </div>
          </div>

          {/* Related parties */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('financialReporting.relatedParties')}</h3>
            
            <div className="space-y-2">
              <p className="text-sm">
                {t('financialReporting.attachListing')}
              </p>
              <div className="bg-blue-900 text-white p-2 rounded">
                <span className="text-sm">{t('common.attachment')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                {t('financialReporting.arrangementsQuestion')}
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="arrangements-yes" />
                  <Label htmlFor="arrangements-yes">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="arrangements-no" />
                  <Label htmlFor="arrangements-no">{t('common.no')}</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('financialReporting.identifyArrangements')}</span>
                <Button size="sm" onClick={addRelatedPartyArrangement} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('common.add')}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.id')}</TableHead>
                    <TableHead>{t('common.description')}</TableHead>
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
                {t('financialReporting.processAuthQuestion')}
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="process-yes" />
                  <Label htmlFor="process-yes">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="process-no" />
                  <Label htmlFor="process-no">{t('common.no')}</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                {t('financialReporting.understandingQuestion')}
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="understanding-yes" />
                  <Label htmlFor="understanding-yes">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="understanding-no" />
                  <Label htmlFor="understanding-no">{t('common.no')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Significant unusual transactions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('financialReporting.unusualTransactions')}</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="service-org-unusual" />
              <Label htmlFor="service-org-unusual">{t('financialReporting.serviceOrgUsed')}</Label>
            </div>

            <Textarea placeholder={t('financialReporting.unusualTransactions')} className="min-h-[100px]" />
          </div>

          {/* Process understanding table */}
          <div className="space-y-4">
            <div className="bg-blue-900 text-white p-2 rounded flex justify-between">
              <span className="font-medium">{t('financialReporting.processUnderstanding')}</span>
              <span className="font-medium">{t('common.reference')}</span>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('businessProcesses.process')}</TableHead>
                  <TableHead>{t('financialReporting.walkthrough')}</TableHead>
                  <TableHead>{t('financialReporting.financialStatementMaking')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="text-sm">
                      {t('financialReporting.understandProcess2')}
                    </div>
                  </TableCell>
                  <TableCell>{t('financialReporting.walkthrough')}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{t('financialReporting.financialStatementMaking')}</span>
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
                      {t('financialReporting.understandProcess2')}
                    </div>
                  </TableCell>
                  <TableCell>{t('financialReporting.walkthrough')}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{t('financialReporting.financialStatementMaking')}</span>
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
                {t('financialReporting.identifySut')}
              </Label>
            </div>
          </div>

          {/* Risk assessment section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('financialReporting.riskAssessment')}
            </h3>
            
            <Textarea placeholder={t('financialReporting.riskAssessment')} className="min-h-[100px]" />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                
                <Button size="sm" onClick={() => {}} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('financialReporting.rmLibrary')}
                </Button>
              </div>

              <Table>
                <TableHeader>
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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                
                <Button size="sm" onClick={() => {}} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('common.add')}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('financialReporting.procedure')}</TableHead>
                    <TableHead>{t('financialReporting.result')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input placeholder={t('financialReporting.procedure')} />
                    </TableCell>
                    <TableCell>
                      <Input placeholder={t('financialReporting.result')} />
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
                  {t('financialReporting.additionalProcedures')}
                </p>
                <RadioGroup>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="additional-procedures-yes" />
                    <Label htmlFor="additional-procedures-yes">{t('common.yes')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="additional-procedures-no" />
                    <Label htmlFor="additional-procedures-no">{t('common.no')}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  {t('financialReporting.discoverRelated')}
                </p>
                <RadioGroup>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="discover-related-yes" />
                    <Label htmlFor="discover-related-yes">{t('common.yes')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="discover-related-no" />
                    <Label htmlFor="discover-related-no">{t('common.no')}</Label>
                  </div>
                </RadioGroup>
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
                <TableHeader>
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
        </CardContent>
      </Card>
    </div>
    </CommentableQuestion>;
};
export default FinancialReportingProcessSection;