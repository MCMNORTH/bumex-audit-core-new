import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ITEnvironmentSectionProps {
  formData: {
    it_plan_to_rely_on_automated_controls: string;
    it_plan_benchmarking_strategy: string;
    it_key_members_inquired: string;
    it_interviewees: Array<{
      id: string;
      intervieweeName: string;
      intervieweePosition: string;
      bumexInterviewers: string;
      dateOfMeeting: string;
    }>;
    it_systems_layers: Array<{
      id: string;
      itLayers: string;
      description: string;
      layerType: string;
      financialReporting: string;
      process: string;
      outsourced: boolean;
    }>;
    it_systems_documentation: string;
    it_attach_documentation: boolean;
    it_documentation_details: string;
    it_service_organizations_used: boolean;
    it_service_organizations: Array<{
      id: string;
      description: string;
    }>;
    it_new_accounting_software: string;
    it_software_effects_description: string;
    it_processes_understanding: string;
    it_processes_table: Array<{
      id: string;
      itProcess: string;
      understanding: string;
    }>;
    it_risk_assessment_procedures_text: string;
    it_risk_assessment_procedures: Array<{
      id: string;
      procedure: string;
    }>;
    it_information_used_risk_assessment: string;
    cybersecurity_risks_understanding: string;
    cybersecurity_incident_awareness: string;
    cybersecurity_bec_risks_understanding: string;
    cybersecurity_additional_inquiries: boolean;
    cybersecurity_additional_inquiries_details: string;
    cybersecurity_incidents_experienced: string;
    cybersecurity_risks_rmm: string;
  };
  onFormDataChange: (updates: any) => void;
}

const ITEnvironmentSection = ({ formData, onFormDataChange }: ITEnvironmentSectionProps) => {
  const addInterviewee = () => {
    const newInterviewee = {
      id: Date.now().toString(),
      intervieweeName: '',
      intervieweePosition: '',
      bumexInterviewers: '',
      dateOfMeeting: '',
    };
    
    onFormDataChange({
      it_interviewees: [...(formData.it_interviewees || []), newInterviewee]
    });
  };

  const updateInterviewee = (id: string, field: string, value: string) => {
    const updatedInterviewees = (formData.it_interviewees || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ it_interviewees: updatedInterviewees });
  };

  const deleteInterviewee = (id: string) => {
    const updatedInterviewees = (formData.it_interviewees || []).filter(item => item.id !== id);
    onFormDataChange({ it_interviewees: updatedInterviewees });
  };

  const addSystemLayer = () => {
    const newLayer = {
      id: Date.now().toString(),
      itLayers: '',
      description: '',
      layerType: '',
      financialReporting: '',
      process: '',
      outsourced: false,
    };
    
    onFormDataChange({
      it_systems_layers: [...(formData.it_systems_layers || []), newLayer]
    });
  };

  const updateSystemLayer = (id: string, field: string, value: string | boolean) => {
    const updatedLayers = (formData.it_systems_layers || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ it_systems_layers: updatedLayers });
  };

  const deleteSystemLayer = (id: string) => {
    const updatedLayers = (formData.it_systems_layers || []).filter(item => item.id !== id);
    onFormDataChange({ it_systems_layers: updatedLayers });
  };

  const addServiceOrganization = () => {
    const newServiceOrg = {
      id: Date.now().toString(),
      description: '',
    };
    
    onFormDataChange({
      it_service_organizations: [...(formData.it_service_organizations || []), newServiceOrg]
    });
  };

  const updateServiceOrganization = (id: string, field: string, value: string) => {
    const updatedServiceOrgs = (formData.it_service_organizations || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ it_service_organizations: updatedServiceOrgs });
  };

  const deleteServiceOrganization = (id: string) => {
    const updatedServiceOrgs = (formData.it_service_organizations || []).filter(item => item.id !== id);
    onFormDataChange({ it_service_organizations: updatedServiceOrgs });
  };

  const addITProcess = () => {
    const newProcess = {
      id: Date.now().toString(),
      itProcess: '',
      understanding: '',
    };
    
    onFormDataChange({
      it_processes_table: [...(formData.it_processes_table || []), newProcess]
    });
  };

  const updateITProcess = (id: string, field: string, value: string) => {
    const updatedProcesses = (formData.it_processes_table || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ it_processes_table: updatedProcesses });
  };

  const deleteITProcess = (id: string) => {
    const updatedProcesses = (formData.it_processes_table || []).filter(item => item.id !== id);
    onFormDataChange({ it_processes_table: updatedProcesses });
  };

  const addRiskAssessmentProcedure = () => {
    const newProcedure = {
      id: Date.now().toString(),
      procedure: '',
    };
    
    onFormDataChange({
      it_risk_assessment_procedures: [...(formData.it_risk_assessment_procedures || []), newProcedure]
    });
  };

  const updateRiskAssessmentProcedure = (id: string, field: string, value: string) => {
    const updatedProcedures = (formData.it_risk_assessment_procedures || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ it_risk_assessment_procedures: updatedProcedures });
  };

  const deleteRiskAssessmentProcedure = (id: string) => {
    const updatedProcedures = (formData.it_risk_assessment_procedures || []).filter(item => item.id !== id);
    onFormDataChange({ it_risk_assessment_procedures: updatedProcedures });
  };

  const reliesOnAutomatedControls = formData.it_plan_to_rely_on_automated_controls === 'Yes';
  const hasNewSoftwareOrMajorUpgrades = formData.it_new_accounting_software === 'Yes';

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-900 mb-4">Understand the entity's IT organization and IT systems</h4>
        
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Do you plan to rely on automated controls?</Label>
          <RadioGroup
            value={formData.it_plan_to_rely_on_automated_controls || ''}
            onValueChange={(value) => onFormDataChange({ it_plan_to_rely_on_automated_controls: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="it-rely-automated-yes" />
              <Label htmlFor="it-rely-automated-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="it-rely-automated-no" />
              <Label htmlFor="it-rely-automated-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>

        {reliesOnAutomatedControls ? (
          <div>
            <Label className="text-sm font-medium">Do you plan to take the benchmarking strategy for testing automated controls?</Label>
            <RadioGroup
              value={formData.it_plan_benchmarking_strategy || ''}
              onValueChange={(value) => onFormDataChange({ it_plan_benchmarking_strategy: value })}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="it-benchmarking-yes" />
                <Label htmlFor="it-benchmarking-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="it-benchmarking-no" />
                <Label htmlFor="it-benchmarking-no" className="text-sm">No</Label>
              </div>
            </RadioGroup>
          </div>
        ) : null}

        <div>
          <Label htmlFor="it-key-members" className="text-sm font-medium">We inquired of the following key members of IT organization primarily responsible for the IT environment:</Label>
          <Textarea
            id="it-key-members"
            value={formData.it_key_members_inquired || ''}
            onChange={(e) => onFormDataChange({ it_key_members_inquired: e.target.value })}
            className="mt-2"
            rows={4}
          />
        </div>

        {/* Interviewees Table */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-medium">IT Organization Interviewees</Label>
            <Button onClick={addInterviewee} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Interviewee
            </Button>
          </div>
          
          {(formData.it_interviewees || []).length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Interviewee Name</TableHead>
                    <TableHead>Interviewee Position</TableHead>
                    <TableHead>Bumex Interviewers</TableHead>
                    <TableHead>Date of Meeting</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.it_interviewees || []).map((interviewee) => (
                    <TableRow key={interviewee.id}>
                      <TableCell>
                        <Input
                          value={interviewee.intervieweeName}
                          onChange={(e) => updateInterviewee(interviewee.id, 'intervieweeName', e.target.value)}
                          placeholder="Enter interviewee name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={interviewee.intervieweePosition}
                          onChange={(e) => updateInterviewee(interviewee.id, 'intervieweePosition', e.target.value)}
                          placeholder="Enter position"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={interviewee.bumexInterviewers}
                          onChange={(e) => updateInterviewee(interviewee.id, 'bumexInterviewers', e.target.value)}
                          placeholder="Enter Bumex interviewers"
                        />
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !interviewee.dateOfMeeting && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {interviewee.dateOfMeeting ? format(new Date(interviewee.dateOfMeeting), "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={interviewee.dateOfMeeting ? new Date(interviewee.dateOfMeeting) : undefined}
                              onSelect={(date) => updateInterviewee(interviewee.id, 'dateOfMeeting', date ? date.toISOString() : '')}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteInterviewee(interviewee.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* IT Layers Documentation */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Document the IT layer(s) (including the title and version) that comprise the IT systems used by the entity as part of their financial reporting and business processes, including the process(es) using each IT system(s) (by IT layer), and indication of outsourcing:
          </Label>
          
          <div className="flex justify-between items-center mb-3">
            <span></span>
            <Button onClick={addSystemLayer} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add IT Layer
            </Button>
          </div>
          
          {(formData.it_systems_layers || []).length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>IT Layer(s)</TableHead>
                    <TableHead>Description of IT system layer</TableHead>
                    <TableHead>Layer type</TableHead>
                    <TableHead>Financial Reporting</TableHead>
                    <TableHead>Process</TableHead>
                    <TableHead>Outsourced</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.it_systems_layers || []).map((layer) => (
                    <TableRow key={layer.id}>
                      <TableCell>
                        <Input
                          value={layer.id}
                          onChange={(e) => updateSystemLayer(layer.id, 'id', e.target.value)}
                          placeholder="Enter ID"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.itLayers}
                          onChange={(e) => updateSystemLayer(layer.id, 'itLayers', e.target.value)}
                          placeholder="Enter IT layers"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.description}
                          onChange={(e) => updateSystemLayer(layer.id, 'description', e.target.value)}
                          placeholder="Enter description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.layerType}
                          onChange={(e) => updateSystemLayer(layer.id, 'layerType', e.target.value)}
                          placeholder="Enter layer type"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.financialReporting}
                          onChange={(e) => updateSystemLayer(layer.id, 'financialReporting', e.target.value)}
                          placeholder="Enter financial reporting"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.process}
                          onChange={(e) => updateSystemLayer(layer.id, 'process', e.target.value)}
                          placeholder="Enter process"
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={layer.outsourced}
                          onCheckedChange={(checked) => updateSystemLayer(layer.id, 'outsourced', checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSystemLayer(layer.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* IT Systems Documentation */}
        <div>
          <Label htmlFor="it-systems-doc" className="text-sm font-medium mb-2 block">
            Document the IT system(s) comprised by the above IT layer(s), the purpose of each IT system, components using these IT system(s), indication of customization and/or changes (including parameters or settings), extent of outsourcing and any other relevant information.
          </Label>
          <Textarea
            id="it-systems-doc"
            value={formData.it_systems_documentation || ''}
            onChange={(e) => onFormDataChange({ it_systems_documentation: e.target.value })}
            rows={4}
            placeholder="Enter IT systems documentation..."
          />
        </div>

        {/* Attach Documentation */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="attach-it-docs"
              checked={formData.it_attach_documentation || false}
              onCheckedChange={(checked) => onFormDataChange({ it_attach_documentation: checked === true })}
            />
            <Label htmlFor="attach-it-docs" className="text-sm font-medium">
              Check if we choose to attach documentation related to our understanding of IT systems, such as IT Systems Diagrams (ISD).
            </Label>
          </div>
          
          {formData.it_attach_documentation && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <Textarea
                value={formData.it_documentation_details || ''}
                onChange={(e) => onFormDataChange({ it_documentation_details: e.target.value })}
                placeholder="Enter documentation details..."
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Service Organizations */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="service-organizations-used"
              checked={formData.it_service_organizations_used || false}
              onCheckedChange={(checked) => onFormDataChange({ it_service_organizations_used: checked === true })}
            />
            <Label htmlFor="service-organizations-used" className="text-sm font-medium">
              Check if service organizations are used to support the entity's IT organization.
            </Label>
          </div>
          
          {formData.it_service_organizations_used && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-medium">Service Organizations</Label>
                <Button onClick={addServiceOrganization} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Service Organization
                </Button>
              </div>
              
              {(formData.it_service_organizations || []).length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Service organization's description</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(formData.it_service_organizations || []).map((serviceOrg) => (
                        <TableRow key={serviceOrg.id}>
                          <TableCell>
                            <Input
                              value={serviceOrg.id}
                              onChange={(e) => updateServiceOrganization(serviceOrg.id, 'id', e.target.value)}
                              placeholder="Enter ID"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={serviceOrg.description}
                              onChange={(e) => updateServiceOrganization(serviceOrg.id, 'description', e.target.value)}
                              placeholder="Enter service organization description"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteServiceOrganization(serviceOrg.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* New Accounting Software */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Has the client purchased a new accounting software application in the current year, or made any significant upgrades to IT systems / layers of technology compared to the versions used in the prior year?
          </Label>
          <RadioGroup
            value={formData.it_new_accounting_software || ''}
            onValueChange={(value) => onFormDataChange({ it_new_accounting_software: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="new-software-yes" />
              <Label htmlFor="new-software-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="new-software-no" />
              <Label htmlFor="new-software-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Software Effects Description */}
        {hasNewSoftwareOrMajorUpgrades && (
          <div>
            <Label htmlFor="software-effects" className="text-sm font-medium mb-2 block">
              Briefly describe the effects (if any) on the processing of accounting transactions, or on the summarization of financial data and preparation of financial statements, and on the related risks of material misstatement.
            </Label>
            <Textarea
              id="software-effects"
              value={formData.it_software_effects_description || ''}
              onChange={(e) => onFormDataChange({ it_software_effects_description: e.target.value })}
              rows={4}
              placeholder="Enter description of effects..."
            />
          </div>
        )}
      </div>

      {/* New Container - IT Processes */}
      <div className="border-t pt-6 mt-8">
        <h4 className="font-medium text-gray-900 mb-4">Understand the entity's IT processes</h4>
        
        <div>
          <Label htmlFor="it-processes" className="text-sm font-medium mb-2 block">
            Document our understanding of how the entity manages IT processes
          </Label>
          <Textarea
            id="it-processes"
            value={formData.it_processes_understanding || ''}
            onChange={(e) => onFormDataChange({ it_processes_understanding: e.target.value })}
            rows={4}
            placeholder="Enter understanding of IT processes..."
          />
        </div>

        {/* IT Processes Table */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-medium">IT Processes Details</Label>
            <Button onClick={addITProcess} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add IT Process
            </Button>
          </div>
          
          {(formData.it_processes_table || []).length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IT Process</TableHead>
                    <TableHead>Understanding of how the entity manages the IT process</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.it_processes_table || []).map((process) => (
                    <TableRow key={process.id}>
                      <TableCell>
                        <Input
                          value={process.itProcess}
                          onChange={(e) => updateITProcess(process.id, 'itProcess', e.target.value)}
                          placeholder="Enter IT process"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={process.understanding}
                          onChange={(e) => updateITProcess(process.id, 'understanding', e.target.value)}
                          placeholder="Enter understanding"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteITProcess(process.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Risk Assessment Procedures */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Document the risk assessment procedures performed to obtain an understanding of how the entity uses IT as part of financial reporting (i.e., understanding of the IT systems, IT organization and IT processes).
          </Label>

          <div className="flex justify-between items-center mb-3">
            <span></span>
            <Button onClick={addRiskAssessmentProcedure} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Procedure
            </Button>
          </div>
          
          {(formData.it_risk_assessment_procedures || []).length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedure performed</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.it_risk_assessment_procedures || []).map((procedure) => (
                    <TableRow key={procedure.id}>
                      <TableCell>
                        <Input
                          value={procedure.procedure}
                          onChange={(e) => updateRiskAssessmentProcedure(procedure.id, 'procedure', e.target.value)}
                          placeholder="Enter procedure performed"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRiskAssessmentProcedure(procedure.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Information Used in Risk Assessment */}
        <div>
          <Label className="text-sm font-medium">Is information used in our risk assessment procedures performed to obtain an understanding of how the entity uses IT as part of financial reporting?</Label>
          <RadioGroup
            value={formData.it_information_used_risk_assessment || ''}
            onValueChange={(value) => onFormDataChange({ it_information_used_risk_assessment: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="info-used-yes" />
              <Label htmlFor="info-used-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="info-used-no" />
              <Label htmlFor="info-used-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* New Container - Cybersecurity */}
      <div className="border-t pt-6 mt-8">
        <h4 className="font-medium text-gray-900 mb-4">Understand the entity's cybersecurity risks and incidents</h4>
        
        <div>
          <Label htmlFor="cybersecurity-risks" className="text-sm font-medium mb-2 block">
            Document who of those primarily responsible and knowledgeable about cybersecurity matters and risks we met with and the results of inquiries into how management's risk assessment process evaluated cybersecurity risks across the entity, including cybersecurity risks at service organizations relevant to the audit, how they analyzed and assessed the significance of the risks to financial reporting and how they manage the risks.
          </Label>
          <Textarea
            id="cybersecurity-risks"
            value={formData.cybersecurity_risks_understanding || ''}
            onChange={(e) => onFormDataChange({ cybersecurity_risks_understanding: e.target.value })}
            rows={4}
            placeholder="Enter cybersecurity risks understanding..."
          />
        </div>

        <div>
          <Label htmlFor="cybersecurity-incident-awareness" className="text-sm font-medium mb-2 block">
            Document the results of inquiries into how the entity would be aware on a timely basis if its IT application, databases, operating systems and/or network had been subject to a cybersecurity incident that could impact the integrity of information used in the financial reporting process.
          </Label>
          <Textarea
            id="cybersecurity-incident-awareness"
            value={formData.cybersecurity_incident_awareness || ''}
            onChange={(e) => onFormDataChange({ cybersecurity_incident_awareness: e.target.value })}
            rows={4}
            placeholder="Enter cybersecurity incident awareness documentation..."
          />
        </div>

        <div>
          <Label htmlFor="cybersecurity-bec-risks" className="text-sm font-medium mb-2 block">
            Document the results of our inquiries into how the entity:
            <br />- identifies, assesses, and responds to risks related to attacks perpetrated through business e-mail compromise (BEC) scams or spoofing or phishing
            <br />- assessed its internal accounting controls in light of risks arising from cyber-related frauds (e.g. BEC scams, spoofing, phishing, etc.)
          </Label>
          <Textarea
            id="cybersecurity-bec-risks"
            value={formData.cybersecurity_bec_risks_understanding || ''}
            onChange={(e) => onFormDataChange({ cybersecurity_bec_risks_understanding: e.target.value })}
            rows={4}
            placeholder="Enter BEC risks and controls documentation..."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="additional-inquiries"
              checked={formData.cybersecurity_additional_inquiries || false}
              onCheckedChange={(checked) => onFormDataChange({ cybersecurity_additional_inquiries: checked === true })}
            />
            <Label htmlFor="additional-inquiries" className="text-sm font-medium">
              We made additional inquiries, where appropriate.
            </Label>
          </div>
          
          {formData.cybersecurity_additional_inquiries && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <Textarea
                value={formData.cybersecurity_additional_inquiries_details || ''}
                onChange={(e) => onFormDataChange({ cybersecurity_additional_inquiries_details: e.target.value })}
                placeholder="Enter additional inquiries details..."
                rows={3}
              />
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">Based on the results of inquiries, has the entity experienced any cybersecurity incidents in the period under audit to date or in prior periods that impacts the current period?</Label>
          <RadioGroup
            value={formData.cybersecurity_incidents_experienced || ''}
            onValueChange={(value) => onFormDataChange({ cybersecurity_incidents_experienced: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="incidents-yes" />
              <Label htmlFor="incidents-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="incidents-no" />
              <Label htmlFor="incidents-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium">Based on the results of inquiries, did we identify cybersecurity risks that may give rise to an RMM?</Label>
          <RadioGroup
            value={formData.cybersecurity_risks_rmm || ''}
            onValueChange={(value) => onFormDataChange({ cybersecurity_risks_rmm: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="rmm-yes" />
              <Label htmlFor="rmm-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="rmm-no" />
              <Label htmlFor="rmm-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default ITEnvironmentSection;
