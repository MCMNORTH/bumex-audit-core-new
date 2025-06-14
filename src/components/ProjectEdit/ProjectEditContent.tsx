
import { Card, CardContent } from '@/components/ui/card';
import { Client, User, Project } from '@/types';
import ProjectHeader from './ProjectHeader';
import EngagementProfileSection from './EngagementProfileSection';
import EngagementScopeSection from './EngagementScopeSection';
import FileUploadSection from './FileUploadSection';

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

interface ProjectEditContentProps {
  project: Project | null;
  clients: Client[];
  users: User[];
  formData: FormData;
  activeSection: string;
  saving: boolean;
  uploadedFile: File | null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  onBack: () => void;
  onSave: () => void;
  onFormDataChange: (updates: Partial<FormData>) => void;
  onAssignmentChange: (field: string, value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onDownloadFile: () => void;
  projectId?: string;
}

const ProjectEditContent = ({
  project,
  clients,
  users,
  formData,
  activeSection,
  saving,
  uploadedFile,
  uploadStatus,
  onBack,
  onSave,
  onFormDataChange,
  onAssignmentChange,
  onFileUpload,
  onRemoveFile,
  onDownloadFile,
  projectId
}: ProjectEditContentProps) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'engagement-profile':
        return (
          <div className="space-y-6">
            <EngagementProfileSection
              project={project}
              clients={clients}
              users={users}
              formData={{
                client_id: formData.client_id,
                engagement_name: formData.engagement_name,
                engagement_id: formData.engagement_id,
                project_id: (formData as any).project_id || '',
                assigned_to: (formData as any).assigned_to || [],
                status: (formData as any).status || 'new',
                period_start: (formData as any).period_start || '',
                period_end: (formData as any).period_end || '',
                expected_start_date: (formData as any).expected_start_date || '',
                audit_type: (formData as any).audit_type || '',
                jurisdiction: (formData as any).jurisdiction || '',
                bumex_office: (formData as any).bumex_office || '',
                language: (formData as any).language || 'English',
                is_first_audit: (formData as any).is_first_audit || false,
                plan_to_roll_forward: (formData as any).plan_to_roll_forward || false,
                enable_external_documents: (formData as any).enable_external_documents || false,
                engagement_structure_file: formData.engagement_structure_file,
                engagement_evaluation_id: (formData as any).engagement_evaluation_id || '',
                engagement_evaluation_status: (formData as any).engagement_evaluation_status || 'Not Selected',
                evaluation_approval_date: (formData as any).evaluation_approval_date || '',
                planned_expiration_date: (formData as any).planned_expiration_date || '',
                sentinel_approval_number: (formData as any).sentinel_approval_number || '',
                sentinel_approval_status: (formData as any).sentinel_approval_status || 'Not Selected',
                sentinel_approval_date: (formData as any).sentinel_approval_date || '',
                sentinel_expiration_date: (formData as any).sentinel_expiration_date || '',
                first_period_auditing: (formData as any).first_period_auditing || 'Not selected',
                sentinel_approval_email_files: (formData as any).sentinel_approval_email_files || [],
                ceac_approval_email_files: (formData as any).ceac_approval_email_files || [],
                other_documents_files: (formData as any).other_documents_files || [],
                financial_statement_audit_report: formData.financial_statement_audit_report,
                auditing_standards: formData.auditing_standards,
                financial_reporting_framework: formData.financial_reporting_framework,
                audit_report_date: formData.audit_report_date,
                required_audit_file_closeout_date: formData.required_audit_file_closeout_date,
                component_reporting: formData.component_reporting,
                component_reporting_details: formData.component_reporting_details,
                group_auditor: formData.group_auditor,
                engagement_quality_control_reviewer: formData.engagement_quality_control_reviewer,
                limited_scope_quality_control_reviewer: formData.limited_scope_quality_control_reviewer,
                other_reviewer: formData.other_reviewer,
                governance_management_same_persons: formData.governance_management_same_persons,
                entity_has_internal_audit_function: formData.entity_has_internal_audit_function,
                entity_uses_service_organization: formData.entity_uses_service_organization,
                plan_to_involve_specialists: formData.plan_to_involve_specialists,
                specialist_teams: formData.specialist_teams,
                entity_highly_dependent_on_it: formData.entity_highly_dependent_on_it,
                significant_factors_directing_activities: formData.significant_factors_directing_activities,
                additional_information_documentation: formData.additional_information_documentation,
                gaap_conversion_activity: formData.gaap_conversion_activity,
                gaas_conversion_activity: formData.gaas_conversion_activity,
                current_period_evaluation_method: formData.current_period_evaluation_method,
                prior_period_evaluation_method: formData.prior_period_evaluation_method,
                minimum_review_requirement: formData.minimum_review_requirement,
              }}
              onFormDataChange={onFormDataChange}
              onAssignmentChange={(userId: string, checked: boolean) => {
                if (checked) {
                  const currentAssigned = (formData as any).assigned_to || [];
                  onFormDataChange({ assigned_to: [...currentAssigned, userId] } as any);
                } else {
                  const currentAssigned = (formData as any).assigned_to || [];
                  onFormDataChange({ assigned_to: currentAssigned.filter((id: string) => id !== userId) } as any);
                }
              }}
              uploadedFile={uploadedFile}
              uploadStatus={uploadStatus}
              onFileUpload={onFileUpload}
              onRemoveFile={onRemoveFile}
              onDownloadFile={onDownloadFile}
              projectId={projectId}
            />
            <Card>
              <CardContent className="pt-6">
                <FileUploadSection
                  uploadedFile={uploadedFile}
                  uploadStatus={uploadStatus}
                  onFileUpload={onFileUpload}
                  onRemoveFile={onRemoveFile}
                  onDownloadFile={onDownloadFile}
                />
              </CardContent>
            </Card>
          </div>
        );
      case 'team-assignment':
        return (
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Team Assignment</h2>
            <p className="text-gray-600">Team assignment functionality will be implemented here.</p>
          </div>
        );
      case 'timeline':
        return (
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Timeline & Milestones</h2>
            <p className="text-gray-600">Timeline and milestones functionality will be implemented here.</p>
          </div>
        );
      case 'documentation':
        return (
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Documentation</h2>
            <p className="text-gray-600">Documentation functionality will be implemented here.</p>
          </div>
        );
      case 'risk-assessment':
        return (
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
            <p className="text-gray-600">Risk assessment functionality will be implemented here.</p>
          </div>
        );
      case 'planning':
        return (
          <EngagementScopeSection
            formData={formData}
            onFormDataChange={onFormDataChange}
            projectId={projectId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <ProjectHeader
        projectName={project?.engagement_name || ''}
        engagementId={project?.engagement_id || ''}
        activeSection={activeSection}
        auditType={project?.audit_type || ''}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
      />
      
      <div className="flex-1 overflow-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProjectEditContent;
