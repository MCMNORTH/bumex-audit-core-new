import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

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
  // IT environment field
  entity_highly_dependent_on_it: string;
}

interface EngagementScopeSectionProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
}

const EngagementScopeSection = ({
  formData,
  onFormDataChange
}: EngagementScopeSectionProps) => {
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
                placeholder="En complément de l'opinion d'audit statuaire au 31 décembre 2023, nous avons reçu des instructions de nos collègues dans les pays où opèrent les filiales de Company X en vue de tester des contrôles JSOX sur le scope B, soit les PLC (revenues, receivables & inventories)"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementScopeSection;
