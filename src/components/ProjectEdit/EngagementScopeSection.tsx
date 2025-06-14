import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface DocumentFile {
  name: string;
  url: string;
  type: string;
}

interface SpecialistTeam {
  id: string;
  description: string;
  name: string;
  title: string;
}

interface FormData {
  financial_statement_audit_report: boolean;
  auditing_standards: string[];
  financial_reporting_framework: string[];
  audit_report_date: string;
  required_audit_file_closeout_date: string;
  // New component reporting and reviewer fields
  component_reporting: boolean;
  component_reporting_details: string;
  group_auditor: boolean;
  engagement_quality_control_reviewer: boolean;
  limited_scope_quality_control_reviewer: boolean;
  other_reviewer: boolean;
  governance_management_same_persons: boolean;
  entity_has_internal_audit_function: boolean;
  // New involvement of others fields
  entity_uses_service_organization: boolean;
  plan_to_involve_specialists: boolean;
  specialist_teams: SpecialistTeam[];
  // IT environment fields
  entity_highly_dependent_on_it: string;
  plan_to_rely_on_automated_controls: string;
  use_it_critically_checklist: boolean;
  // Engagement team fields
  sufficient_appropriate_resources: boolean;
  team_competence_and_capabilities: boolean;
  // Direction and supervision field
  direction_supervision_documentation: string;
  // Other strategy or planning considerations fields
  significant_factors_directing_activities: string;
  additional_information_documentation: string;
  // New audit strategy fields
  gaap_conversion_activity: boolean;
  gaas_conversion_activity: boolean;
  current_period_method: string;
  prior_period_method: string;
  minimum_review_requirement: string;
  mrr_file: string;
}

interface EngagementScopeSectionProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
  projectId?: string;
}

const EngagementScopeSection = ({
  formData,
  onFormDataChange,
  projectId
}: EngagementScopeSectionProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleAddAuditingStandard = () => {
    const newStandards = [...formData.auditing_standards, ''];
    onFormDataChange({ auditing_standards: newStandards });
  };

  const handleRemoveAuditingStandard = (index: number) => {
    const newStandards = formData.auditing_standards.filter((_, i) => i !== index);
    onFormDataChange({ auditing_standards: newStandards });
  };

  const handleAuditingStandardChange = (index: number, value: string) => {
    const newStandards = [...formData.auditing_standards];
    newStandards[index] = value;
    onFormDataChange({ auditing_standards: newStandards });
  };

  const handleAddReportingFramework = () => {
    const newFrameworks = [...formData.financial_reporting_framework, ''];
    onFormDataChange({ financial_reporting_framework: newFrameworks });
  };

  const handleRemoveReportingFramework = (index: number) => {
    const newFrameworks = formData.financial_reporting_framework.filter((_, i) => i !== index);
    onFormDataChange({ financial_reporting_framework: newFrameworks });
  };

  const handleReportingFrameworkChange = (index: number, value: string) => {
    const newFrameworks = [...formData.financial_reporting_framework];
    newFrameworks[index] = value;
    onFormDataChange({ financial_reporting_framework: newFrameworks });
  };

  const handleAddSpecialistTeam = () => {
    const newTeam: SpecialistTeam = {
      id: '',
      description: '',
      name: '',
      title: ''
    };
    const newTeams = [...(formData.specialist_teams || []), newTeam];
    onFormDataChange({ specialist_teams: newTeams });
  };

  const handleRemoveSpecialistTeam = (index: number) => {
    const newTeams = (formData.specialist_teams || []).filter((_, i) => i !== index);
    onFormDataChange({ specialist_teams: newTeams });
  };

  const handleSpecialistTeamChange = (index: number, field: keyof SpecialistTeam, value: string) => {
    const newTeams = (formData.specialist_teams || []).map((team, i) =>
      i === index ? { ...team, [field]: value } : team
    );
    onFormDataChange({ specialist_teams: newTeams });
  };

  const handleMRRFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !projectId) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadStatus('uploading');
    
    try {
      const fileName = `mrr-files/${projectId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setUploadedFileName(file.name);
      setUploadStatus('success');
      onFormDataChange({ mrr_file: downloadURL });
      
      toast({
        title: 'File uploaded',
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMRRFile = async () => {
    if (formData.mrr_file && formData.mrr_file.startsWith('https://')) {
      try {
        const storageRef = ref(storage, formData.mrr_file);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
      }
    }

    setUploadedFileName('');
    setUploadStatus('idle');
    onFormDataChange({ mrr_file: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadMRRFile = () => {
    if (formData.mrr_file) {
      const link = document.createElement('a');
      link.href = formData.mrr_file;
      link.download = uploadedFileName || 'mrr-file.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement scope and scale and other strategic matters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Select type of engagement</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="financial_statement_audit_report"
              checked={formData.financial_statement_audit_report}
              onCheckedChange={(checked) => onFormDataChange({ financial_statement_audit_report: checked as boolean })}
            />
            <Label htmlFor="financial_statement_audit_report">Financial statement audit report</Label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-gray-900">Applicable auditing standards and other legislative and regulatory requirements:</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAuditingStandard}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          {formData.auditing_standards.map((standard, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Input
                value={standard}
                onChange={(e) => handleAuditingStandardChange(index, e.target.value)}
                placeholder="Enter auditing standard"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAuditingStandard(index)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-gray-900">Applicable financial reporting framework and other legislative and regulatory requirements:</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddReportingFramework}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          {formData.financial_reporting_framework.map((framework, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Input
                value={framework}
                onChange={(e) => handleReportingFrameworkChange(index, e.target.value)}
                placeholder="Enter financial reporting framework"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveReportingFramework(index)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="audit_report_date">Audit report date</Label>
            <Input
              id="audit_report_date"
              type="date"
              value={formData.audit_report_date}
              onChange={(e) => onFormDataChange({ audit_report_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="required_audit_file_closeout_date">Required audit file closeout date</Label>
            <Input
              id="required_audit_file_closeout_date"
              type="date"
              value={formData.required_audit_file_closeout_date}
              onChange={(e) => onFormDataChange({ required_audit_file_closeout_date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="component_reporting"
              checked={formData.component_reporting}
              onCheckedChange={(checked) => onFormDataChange({ component_reporting: checked as boolean })}
            />
            <Label htmlFor="component_reporting">Component reporting</Label>
          </div>
          
          {formData.component_reporting && (
            <div>
              <Label htmlFor="component_reporting_details">Component reporting details</Label>
              <Textarea
                id="component_reporting_details"
                value={formData.component_reporting_details}
                onChange={(e) => onFormDataChange({ component_reporting_details: e.target.value })}
                placeholder="Describe the nature and scope of component reporting requirements, including any specific instructions received from group auditors..."
                className="min-h-[120px]"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="group_auditor"
              checked={formData.group_auditor}
              onCheckedChange={(checked) => onFormDataChange({ group_auditor: checked as boolean })}
            />
            <Label htmlFor="group_auditor">Group auditor</Label>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Select the type of reviewer(s) which have been identified for the engagement:</h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="engagement_quality_control_reviewer"
                checked={formData.engagement_quality_control_reviewer}
                onCheckedChange={(checked) => onFormDataChange({ engagement_quality_control_reviewer: checked as boolean })}
              />
              <Label htmlFor="engagement_quality_control_reviewer">Engagement quality control reviewer</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="limited_scope_quality_control_reviewer"
                checked={formData.limited_scope_quality_control_reviewer}
                onCheckedChange={(checked) => onFormDataChange({ limited_scope_quality_control_reviewer: checked as boolean })}
              />
              <Label htmlFor="limited_scope_quality_control_reviewer">Limited scope quality control reviewer</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="other_reviewer"
                checked={formData.other_reviewer}
                onCheckedChange={(checked) => onFormDataChange({ other_reviewer: checked as boolean })}
              />
              <Label htmlFor="other_reviewer">Other reviewer</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Management, those charged with governance and internal audit function:</h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="governance_management_same_persons"
                checked={formData.governance_management_same_persons}
                onCheckedChange={(checked) => onFormDataChange({ governance_management_same_persons: checked as boolean })}
              />
              <Label htmlFor="governance_management_same_persons">Those charged with governance and management are the same persons</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="entity_has_internal_audit_function"
                checked={formData.entity_has_internal_audit_function}
                onCheckedChange={(checked) => onFormDataChange({ entity_has_internal_audit_function: checked as boolean })}
              />
              <Label htmlFor="entity_has_internal_audit_function">The entity has an internal audit function or equivalent, including others under the direction of management or those charged with governance</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Involvement of others and specialized skills or knowledge</h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="entity_uses_service_organization"
                checked={formData.entity_uses_service_organization || false}
                onCheckedChange={(checked) => onFormDataChange({ entity_uses_service_organization: checked as boolean })}
              />
              <Label htmlFor="entity_uses_service_organization">The entity uses a service organization(s)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="plan_to_involve_specialists"
                checked={formData.plan_to_involve_specialists || false}
                onCheckedChange={(checked) => onFormDataChange({ plan_to_involve_specialists: checked as boolean })}
              />
              <Label htmlFor="plan_to_involve_specialists">We plan to involve specific team members with specialized skills in accounting and auditing and/or use the work of employed/engaged KPMG specialists and/or management's specialists</Label>
            </div>
          </div>

          {formData.plan_to_involve_specialists && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-gray-900">Specialist Teams</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSpecialistTeam}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {(formData.specialist_teams || []).length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(formData.specialist_teams || []).map((team, index) => (
                      <TableRow key={`specialist-team-${index}`}>
                        <TableCell>
                          <Input
                            value={team.id}
                            onChange={(e) => handleSpecialistTeamChange(index, 'id', e.target.value)}
                            placeholder="ID"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={team.description}
                            onChange={(e) => handleSpecialistTeamChange(index, 'description', e.target.value)}
                            placeholder="Description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={team.name}
                            onChange={(e) => handleSpecialistTeamChange(index, 'name', e.target.value)}
                            placeholder="Name"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={team.title}
                            onChange={(e) => handleSpecialistTeamChange(index, 'title', e.target.value)}
                            placeholder="Title"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSpecialistTeam(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">IT environment</h4>
          <div>
            <Label className="text-sm font-medium">Is the entity highly dependent on IT processes to maintain its financial reporting and accounting books and records, including IT processes performed by service organizations, so we cannot obtain sufficient appropriate audit evidence without relying on automated controls?</Label>
            <RadioGroup
              value={formData.entity_highly_dependent_on_it || 'Not selected'}
              onValueChange={(value) => onFormDataChange({ entity_highly_dependent_on_it: value })}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="it-yes" />
                <Label htmlFor="it-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="it-no" />
                <Label htmlFor="it-no" className="text-sm">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Not selected" id="it-not-selected" />
                <Label htmlFor="it-not-selected" className="text-sm">Not selected</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Do we plan to rely on the operating effectiveness of automated controls to respond to a significant risk?</Label>
            <RadioGroup
              value={formData.plan_to_rely_on_automated_controls || 'Not selected'}
              onValueChange={(value) => onFormDataChange({ plan_to_rely_on_automated_controls: value })}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="automated-controls-yes" />
                <Label htmlFor="automated-controls-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="automated-controls-no" />
                <Label htmlFor="automated-controls-no" className="text-sm">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Not selected" id="automated-controls-not-selected" />
                <Label htmlFor="automated-controls-not-selected" className="text-sm">Not selected</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="use_it_critically_checklist"
              checked={formData.use_it_critically_checklist || false}
              onCheckedChange={(checked) => onFormDataChange({ use_it_critically_checklist: checked as boolean })}
            />
            <Label htmlFor="use_it_critically_checklist" className="text-sm">We decided to use the IT Critically checklist to help us determine whether the entity is highly dependent on IT processes</Label>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Engagement team</h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sufficient_appropriate_resources"
                checked={formData.sufficient_appropriate_resources || false}
                onCheckedChange={(checked) => onFormDataChange({ sufficient_appropriate_resources: checked as boolean })}
              />
              <Label htmlFor="sufficient_appropriate_resources" className="text-sm">Confirm that sufficient and appropriate resources to perform the engagement are assigned or made available to the engagement in a timely manner</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="team_competence_and_capabilities"
                checked={formData.team_competence_and_capabilities || false}
                onCheckedChange={(checked) => onFormDataChange({ team_competence_and_capabilities: checked as boolean })}
              />
              <Label htmlFor="team_competence_and_capabilities" className="text-sm">Confirm that the members of the engagement team, and any engaged BUMEX specialists and internal auditors who provide direct assistance collectively have the appropriate competence and capabilities, including sufficient time, to perform the engagement</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Determine the nature, timing, and extent of direction and supervision of engagement team members, and review of their work</h4>
          
          <div>
            <Label htmlFor="direction_supervision_documentation" className="text-sm font-medium">Document how we plan to direct and supervise engagement team members, including review of their work.</Label>
            <Textarea
              id="direction_supervision_documentation"
              value={formData.direction_supervision_documentation || ''}
              onChange={(e) => onFormDataChange({ direction_supervision_documentation: e.target.value })}
              placeholder="Document your approach to team direction and supervision, including review procedures and communication methods..."
              className="min-h-[120px] mt-2"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Other strategy or planning considerations</h4>
          
          <div>
            <Label htmlFor="significant_factors_directing_activities" className="text-sm font-medium">
              Identify factors that are significant in directing the activities of the engagement team e.g. significant issues and key audit areas.
            </Label>
            <Textarea
              id="significant_factors_directing_activities"
              value={formData.significant_factors_directing_activities || ''}
              onChange={(e) => onFormDataChange({ significant_factors_directing_activities: e.target.value })}
              placeholder="Identify and describe significant factors, issues, and key audit areas that will guide the engagement team's activities..."
              className="min-h-[120px] mt-2"
            />
          </div>

          <div>
            <Label htmlFor="additional_information_documentation" className="text-sm font-medium">
              Document any additional information e.g. overall timing of audit activities and preliminary decisions about which locations we will include in our audit scope.
            </Label>
            <Textarea
              id="additional_information_documentation"
              value={formData.additional_information_documentation || ''}
              onChange={(e) => onFormDataChange({ additional_information_documentation: e.target.value })}
              placeholder="Document additional planning information, including timing of audit activities, location scope decisions, and other relevant considerations..."
              className="min-h-[120px] mt-2"
            />
          </div>
        </div>

        {/* New audit strategy section */}
        <div className="space-y-6 border-t pt-6">
          <div>
            <p className="text-sm text-gray-700 mb-4">
              We consider the information obtained in defining the audit strategy and plan our audit procedures on this screen, in 3.x.1 Understanding, risks and response for each business process and in the following locations:
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">1.4 Communications</button>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">2.1.2 Materiality</button>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">2.2.1 Entity and its environment</button>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">2.2.4 RAPD</button>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">2.3.1 CERAMIC</button>
              </div>
              <div className="space-y-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">3.2 Litigation claims and assessments</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Activate GAAP conversion and/or GAAS differences for this report</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gaap_conversion_activity"
                  checked={formData.gaap_conversion_activity || false}
                  onCheckedChange={(checked) => onFormDataChange({ gaap_conversion_activity: checked as boolean })}
                />
                <Label htmlFor="gaap_conversion_activity">GAAP conversion activity</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gaas_conversion_activity"
                  checked={formData.gaas_conversion_activity || false}
                  onCheckedChange={(checked) => onFormDataChange({ gaas_conversion_activity: checked as boolean })}
                />
                <Label htmlFor="gaas_conversion_activity">GAAS conversion activity</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Method used to evaluate identified misstatements:</h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Current period</Label>
                <Select value={formData.current_period_method || ''} onValueChange={(value) => onFormDataChange({ current_period_method: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dual method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dual-method">Dual method</SelectItem>
                    <SelectItem value="rollover-method">Rollover method</SelectItem>
                    <SelectItem value="iron-curtain-method">Iron curtain method</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Prior period</Label>
                <Select value={formData.prior_period_method || ''} onValueChange={(value) => onFormDataChange({ prior_period_method: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dual method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dual-method">Dual method</SelectItem>
                    <SelectItem value="rollover-method">Rollover method</SelectItem>
                    <SelectItem value="iron-curtain-method">Iron curtain method</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Minimum Review Requirement</Label>
              <Select value={formData.minimum_review_requirement || ''} onValueChange={(value) => onFormDataChange({ minimum_review_requirement: value })}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Global - No EQCR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global-no-eqcr">Global - No EQCR</SelectItem>
                  <SelectItem value="global-eqcr">Global - EQCR</SelectItem>
                  <SelectItem value="local-no-eqcr">Local - No EQCR</SelectItem>
                  <SelectItem value="local-eqcr">Local - EQCR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-medium">Change MRR</Label>
              
              {formData.mrr_file ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{uploadedFileName || 'MRR file uploaded'}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadMRRFile}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveMRRFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadStatus === 'uploading'}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload PDF'}
                </Button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleMRRFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementScopeSection;
