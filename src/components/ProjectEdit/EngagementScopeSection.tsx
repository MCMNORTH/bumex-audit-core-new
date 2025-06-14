import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, Download } from 'lucide-react';
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
  engagement_name: string;
  engagement_id: string;
  client_id: string;
  engagement_partner_id: string;
  engagement_manager_id: string;
  engagement_senior_id: string;
  engagement_associate_id: string;
  nature_of_engagement: string;
  engagement_description: string;
  engagement_structure_file: string;
  // Team assignment fields
  team_partner_id: string;
  team_manager_id: string;
  team_senior_id: string;
  team_associate_id: string;
  // Timeline fields
  planning_start_date: string;
  fieldwork_start_date: string;
  fieldwork_end_date: string;
  report_date: string;
  // Documentation fields
  planning_documentation: DocumentFile[];
  risk_assessment_documentation: DocumentFile[];
  audit_procedures_documentation: DocumentFile[];
  // Risk assessment fields
  risk_assessment_summary: string;
  identified_risks: string;
  // Audit planning fields
  audit_approach: string;
  materiality_assessment: string;
  // Engagement scope fields
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
  // New audit strategy and planning fields
  gaap_conversion_activity: boolean;
  gaas_conversion_activity: boolean;
  current_period_evaluation_method: string;
  prior_period_evaluation_method: string;
  minimum_review_requirement: string;
  // MRR file field
  mrr_file: string;
}

interface EngagementScopeSectionProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
  projectId?: string;
}

const EngagementScopeSection = ({ formData, onFormDataChange, projectId }: EngagementScopeSectionProps) => {
  const { toast } = useToast();
  const mrrFileInputRef = useRef<HTMLInputElement>(null);

  const handleMrrFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    try {
      const fileName = `mrr-files/${projectId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      onFormDataChange({ mrr_file: downloadURL });
      
      toast({
        title: 'File uploaded',
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading MRR file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMrrFileRemove = async () => {
    if (formData.mrr_file && formData.mrr_file.startsWith('https://')) {
      try {
        const storageRef = ref(storage, formData.mrr_file);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting MRR file from storage:', error);
      }
    }

    onFormDataChange({ mrr_file: '' });
    if (mrrFileInputRef.current) {
      mrrFileInputRef.current.value = '';
    }
  };

  const handleMrrFileDownload = () => {
    if (formData.mrr_file) {
      const link = document.createElement('a');
      link.href = formData.mrr_file;
      link.download = 'mrr-file.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getMrrFileName = () => {
    if (!formData.mrr_file) return '';
    try {
      const decodedUrl = decodeURIComponent(formData.mrr_file);
      const urlParts = decodedUrl.split('/');
      const fileNameWithPath = urlParts[urlParts.length - 1].split('?')[0];
      const fileName = fileNameWithPath.split('/').pop() || fileNameWithPath;
      return fileName.includes('-') && /^\d+/.test(fileName)
        ? fileName.substring(fileName.indexOf('-') + 1)
        : fileName;
    } catch (error) {
      console.error('Error extracting filename:', error);
      return 'mrr-file.pdf';
    }
  };

  const handleSpecialistAdd = () => {
    const newSpecialist = {
      id: `specialist-${Date.now()}`,
      description: '',
      name: '',
      title: '',
    };
    onFormDataChange({
      specialist_teams: [...formData.specialist_teams, newSpecialist],
    });
  };

  const handleSpecialistRemove = (id: string) => {
    onFormDataChange({
      specialist_teams: formData.specialist_teams.filter(team => team.id !== id),
    });
  };

  const handleSpecialistChange = (id: string, field: keyof SpecialistTeam, value: string) => {
    onFormDataChange({
      specialist_teams: formData.specialist_teams.map(team => 
        team.id === id ? { ...team, [field]: value } : team
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Engagement scope and scale */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Scope and Scale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="financial_statement_audit_report"
              checked={formData.financial_statement_audit_report}
              onCheckedChange={(checked) => 
                onFormDataChange({ financial_statement_audit_report: checked as boolean })
              }
            />
            <Label htmlFor="financial_statement_audit_report">Financial Statement Audit Report</Label>
          </div>

          <div>
            <Label>Auditing Standards</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['PCAOB', 'US GAAS', 'ISA', 'Other'].map((standard) => (
                <div key={standard} className="flex items-center space-x-2">
                  <Checkbox
                    id={`standard-${standard}`}
                    checked={formData.auditing_standards.includes(standard)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFormDataChange({
                          auditing_standards: [...formData.auditing_standards, standard],
                        });
                      } else {
                        onFormDataChange({
                          auditing_standards: formData.auditing_standards.filter(s => s !== standard),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`standard-${standard}`}>{standard}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Financial Reporting Framework</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['US GAAP', 'IFRS', 'Other GAAP', 'Other'].map((framework) => (
                <div key={framework} className="flex items-center space-x-2">
                  <Checkbox
                    id={`framework-${framework}`}
                    checked={formData.financial_reporting_framework.includes(framework)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFormDataChange({
                          financial_reporting_framework: [...formData.financial_reporting_framework, framework],
                        });
                      } else {
                        onFormDataChange({
                          financial_reporting_framework: formData.financial_reporting_framework.filter(f => f !== framework),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`framework-${framework}`}>{framework}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="audit_report_date">Audit Report Date</Label>
              <Input
                id="audit_report_date"
                type="date"
                value={formData.audit_report_date}
                onChange={(e) => onFormDataChange({ audit_report_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="required_audit_file_closeout_date">Required Audit File Closeout Date</Label>
              <Input
                id="required_audit_file_closeout_date"
                type="date"
                value={formData.required_audit_file_closeout_date}
                onChange={(e) => onFormDataChange({ required_audit_file_closeout_date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Reporting and Reviewers */}
      <Card>
        <CardHeader>
          <CardTitle>Component Reporting and Reviewers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="component_reporting"
              checked={formData.component_reporting}
              onCheckedChange={(checked) => 
                onFormDataChange({ component_reporting: checked as boolean })
              }
            />
            <Label htmlFor="component_reporting">Component Reporting</Label>
          </div>

          {formData.component_reporting && (
            <div>
              <Label htmlFor="component_reporting_details">Component Reporting Details</Label>
              <Textarea
                id="component_reporting_details"
                value={formData.component_reporting_details}
                onChange={(e) => onFormDataChange({ component_reporting_details: e.target.value })}
                placeholder="Enter component reporting details"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="group_auditor"
                checked={formData.group_auditor}
                onCheckedChange={(checked) => 
                  onFormDataChange({ group_auditor: checked as boolean })
                }
              />
              <Label htmlFor="group_auditor">Group Auditor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="engagement_quality_control_reviewer"
                checked={formData.engagement_quality_control_reviewer}
                onCheckedChange={(checked) => 
                  onFormDataChange({ engagement_quality_control_reviewer: checked as boolean })
                }
              />
              <Label htmlFor="engagement_quality_control_reviewer">Engagement Quality Control Reviewer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="limited_scope_quality_control_reviewer"
                checked={formData.limited_scope_quality_control_reviewer}
                onCheckedChange={(checked) => 
                  onFormDataChange({ limited_scope_quality_control_reviewer: checked as boolean })
                }
              />
              <Label htmlFor="limited_scope_quality_control_reviewer">Limited Scope Quality Control Reviewer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="other_reviewer"
                checked={formData.other_reviewer}
                onCheckedChange={(checked) => 
                  onFormDataChange({ other_reviewer: checked as boolean })
                }
              />
              <Label htmlFor="other_reviewer">Other Reviewer</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Entity Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="governance_management_same_persons"
              checked={formData.governance_management_same_persons}
              onCheckedChange={(checked) => 
                onFormDataChange({ governance_management_same_persons: checked as boolean })
              }
            />
            <Label htmlFor="governance_management_same_persons">Those Charged with Governance and Management are the Same Persons</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="entity_has_internal_audit_function"
              checked={formData.entity_has_internal_audit_function}
              onCheckedChange={(checked) => 
                onFormDataChange({ entity_has_internal_audit_function: checked as boolean })
              }
            />
            <Label htmlFor="entity_has_internal_audit_function">Entity has an Internal Audit Function</Label>
          </div>
        </CardContent>
      </Card>

      {/* Involvement of Others */}
      <Card>
        <CardHeader>
          <CardTitle>Involvement of Others</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="entity_uses_service_organization"
              checked={formData.entity_uses_service_organization}
              onCheckedChange={(checked) => 
                onFormDataChange({ entity_uses_service_organization: checked as boolean })
              }
            />
            <Label htmlFor="entity_uses_service_organization">Entity Uses a Service Organization</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="plan_to_involve_specialists"
              checked={formData.plan_to_involve_specialists}
              onCheckedChange={(checked) => 
                onFormDataChange({ plan_to_involve_specialists: checked as boolean })
              }
            />
            <Label htmlFor="plan_to_involve_specialists">Plan to Involve Specialists</Label>
          </div>

          {formData.plan_to_involve_specialists && (
            <div className="space-y-4">
              <Label>Specialist Teams</Label>
              {formData.specialist_teams.map((team) => (
                <div key={team.id} className="grid grid-cols-3 gap-2 items-start">
                  <Input
                    placeholder="Description"
                    value={team.description}
                    onChange={(e) => handleSpecialistChange(team.id, 'description', e.target.value)}
                  />
                  <Input
                    placeholder="Name"
                    value={team.name}
                    onChange={(e) => handleSpecialistChange(team.id, 'name', e.target.value)}
                  />
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Title"
                      value={team.title}
                      onChange={(e) => handleSpecialistChange(team.id, 'title', e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpecialistRemove(team.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleSpecialistAdd}>
                Add Specialist
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* IT Environment */}
      <Card>
        <CardHeader>
          <CardTitle>IT Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="entity_highly_dependent_on_it">Is the Entity Highly Dependent on IT?</Label>
            <Select
              value={formData.entity_highly_dependent_on_it}
              onValueChange={(value) => onFormDataChange({ entity_highly_dependent_on_it: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not selected">Not selected</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="plan_to_rely_on_automated_controls">Do You Plan to Rely on Automated Controls?</Label>
            <Select
              value={formData.plan_to_rely_on_automated_controls}
              onValueChange={(value) => onFormDataChange({ plan_to_rely_on_automated_controls: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not selected">Not selected</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="use_it_critically_checklist"
              checked={formData.use_it_critically_checklist}
              onCheckedChange={(checked) => 
                onFormDataChange({ use_it_critically_checklist: checked as boolean })
              }
            />
            <Label htmlFor="use_it_critically_checklist">Use IT Critically Checklist</Label>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Team */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sufficient_appropriate_resources"
              checked={formData.sufficient_appropriate_resources}
              onCheckedChange={(checked) => 
                onFormDataChange({ sufficient_appropriate_resources: checked as boolean })
              }
            />
            <Label htmlFor="sufficient_appropriate_resources">Sufficient Appropriate Resources</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="team_competence_and_capabilities"
              checked={formData.team_competence_and_capabilities}
              onCheckedChange={(checked) => 
                onFormDataChange({ team_competence_and_capabilities: checked as boolean })
              }
            />
            <Label htmlFor="team_competence_and_capabilities">Team Competence and Capabilities</Label>
          </div>
        </CardContent>
      </Card>

      {/* Direction and Supervision */}
      <Card>
        <CardHeader>
          <CardTitle>Direction and Supervision</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="direction_supervision_documentation">Direction, Supervision, and Review Documentation</Label>
            <Textarea
              id="direction_supervision_documentation"
              value={formData.direction_supervision_documentation}
              onChange={(e) => onFormDataChange({ direction_supervision_documentation: e.target.value })}
              placeholder="Enter direction, supervision, and review documentation"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Other Strategy or Planning Considerations */}
      <Card>
        <CardHeader>
          <CardTitle>Other Strategy or Planning Considerations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="significant_factors_directing_activities">Significant Factors Directing Activities</Label>
            <Textarea
              id="significant_factors_directing_activities"
              value={formData.significant_factors_directing_activities}
              onChange={(e) => onFormDataChange({ significant_factors_directing_activities: e.target.value })}
              placeholder="Enter significant factors directing activities"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="additional_information_documentation">Additional Information Documentation</Label>
            <Textarea
              id="additional_information_documentation"
              value={formData.additional_information_documentation}
              onChange={(e) => onFormDataChange({ additional_information_documentation: e.target.value })}
              placeholder="Enter additional information documentation"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Strategy and Planning */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Strategy and Planning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gaap_conversion_activity"
                checked={formData.gaap_conversion_activity}
                onCheckedChange={(checked) => 
                  onFormDataChange({ gaap_conversion_activity: checked as boolean })
                }
              />
              <Label htmlFor="gaap_conversion_activity">GAAP Conversion Activity</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gaas_conversion_activity"
                checked={formData.gaas_conversion_activity}
                onCheckedChange={(checked) => 
                  onFormDataChange({ gaas_conversion_activity: checked as boolean })
                }
              />
              <Label htmlFor="gaas_conversion_activity">GAAS Conversion Activity</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current_period_evaluation_method">Current Period Evaluation Method</Label>
              <Select
                value={formData.current_period_evaluation_method}
                onValueChange={(value) => onFormDataChange({ current_period_evaluation_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dual method">Dual method</SelectItem>
                  <SelectItem value="Substantive approach">Substantive approach</SelectItem>
                  <SelectItem value="Combined approach">Combined approach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prior_period_evaluation_method">Prior Period Evaluation Method</Label>
              <Select
                value={formData.prior_period_evaluation_method}
                onValueChange={(value) => onFormDataChange({ prior_period_evaluation_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dual method">Dual method</SelectItem>
                  <SelectItem value="Substantive approach">Substantive approach</SelectItem>
                  <SelectItem value="Combined approach">Combined approach</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Minimum Review Requirement */}
      <Card>
        <CardHeader>
          <CardTitle>Minimum Review Requirement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="minimum_review_requirement">Minimum Review Requirement</Label>
            <Select
              value={formData.minimum_review_requirement}
              onValueChange={(value) => onFormDataChange({ minimum_review_requirement: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select minimum review requirement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Global - No EQCR">Global - No EQCR</SelectItem>
                <SelectItem value="Global - EQCR">Global - EQCR</SelectItem>
                <SelectItem value="Local - No EQCR">Local - No EQCR</SelectItem>
                <SelectItem value="Local - EQCR">Local - EQCR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={mrrFileInputRef}
              onChange={handleMrrFileUpload}
              accept=".pdf"
              className="hidden"
            />
            
            {!formData.mrr_file ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => mrrFileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Change MRR
              </Button>
            ) : (
              <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 flex-1">{getMrrFileName()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMrrFileDownload}
                  className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                  title="Download file"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMrrFileRemove}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  title="Remove file"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementScopeSection;
