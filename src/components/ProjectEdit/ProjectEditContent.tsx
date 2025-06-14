import { Card, CardContent } from '@/components/ui/card';
import { Client, User, Project } from '@/types';
import ProjectHeader from './ProjectHeader';
import EngagementProfileSection from './EngagementProfileSection';

interface FormData {
  client_id: string;
  engagement_name: string;
  engagement_id: string;
  project_id: string;
  assigned_to: string[];
  status: Project['status'];
  period_start: string;
  period_end: string;
  expected_start_date: string;
  audit_type: string;
  jurisdiction: string;
  bumex_office: string;
  language: string;
  is_first_audit: boolean;
  plan_to_roll_forward: boolean;
  enable_external_documents: boolean;
  engagement_structure_file: string;
  engagement_evaluation_id: string;
  engagement_evaluation_status: string;
  evaluation_approval_date: string;
  planned_expiration_date: string;
  sentinel_approval_number: string;
  sentinel_approval_status: string;
  sentinel_approval_date: string;
  sentinel_expiration_date: string;
  first_period_auditing: string;
  sentinel_approval_email_files: Array<{name: string, url: string, type: string}>;
  ceac_approval_email_files: Array<{name: string, url: string, type: string}>;
  other_documents_files: Array<{name: string, url: string, type: string}>;
  financial_statement_audit_report: boolean;
  auditing_standards: string[];
  financial_reporting_framework: string[];
  audit_report_date: string;
  required_audit_file_closeout_date: string;
  component_reporting: boolean;
  component_reporting_details: string;
  group_auditor: boolean;
  engagement_quality_control_reviewer: boolean;
  limited_scope_quality_control_reviewer: boolean;
  other_reviewer: boolean;
  governance_management_same_persons: boolean;
  entity_has_internal_audit_function: boolean;
  entity_uses_service_organization: boolean;
  plan_to_involve_specialists: boolean;
  specialist_teams: Array<{
    id: string;
    description: string;
    name: string;
    title: string;
  }>;
  entity_highly_dependent_on_it: string;
  plan_to_rely_on_automated_controls: string;
  use_it_critically_checklist: boolean;
  sufficient_appropriate_resources: boolean;
  team_competence_and_capabilities: boolean;
  direction_supervision_documentation: string;
  significant_factors_directing_activities: string;
  additional_information_documentation: string;
  // New audit strategy fields
  gaap_conversion_activity: boolean;
  gaas_conversion_activity: boolean;
  current_period_method: string;
  prior_period_method: string;
  minimum_review_requirement: string;
  mrr_file: string;
  // New entity profile fields
  entity_revenue_greater_than_billion: string;
  entity_meets_international_criteria: boolean;
  using_sats_not_on_firm_list: string;
  // Team assignment fields
  engagement_partner_id: string;
  engagement_manager_id: string;
  engagement_senior_id: string;
  engagement_associate_id: string;
  engagement_quality_control_reviewer_id: string;
  limited_scope_quality_control_reviewer_id: string;
  other_reviewer_id: string;
  engagement_tax_specialist_id: string;
  engagement_actuarial_specialist_id: string;
  engagement_it_specialist_id: string;
  engagement_valuation_specialist_id: string;
  engagement_forensic_specialist_id: string;
  engagement_sustainability_specialist_id: string;
  engagement_data_analytics_specialist_id: string;
  engagement_regulatory_specialist_id: string;
  engagement_treasury_specialist_id: string;
  engagement_real_estate_specialist_id: string;
  engagement_industry_specialist_id: string;
  engagement_other_specialist_id: string;
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
  fileInputRef: React.RefObject<HTMLInputElement>;
  onBack: () => void;
  onSave: () => void;
  onFormDataChange: (updates: Partial<FormData>) => void;
  onAssignmentChange: (field: string, value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onDownloadFile: () => void;
  projectId?: string;
  // MRR file upload props
  mrrUploadedFile: File | null;
  mrrUploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  mrrFileInputRef: React.RefObject<HTMLInputElement>;
  onMRRFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMRRFile: () => void;
  onDownloadMRRFile: () => void;
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
  fileInputRef,
  onBack,
  onSave,
  onFormDataChange,
  onAssignmentChange,
  onFileUpload,
  onRemoveFile,
  onDownloadFile,
  projectId,
  // MRR file upload props
  mrrUploadedFile,
  mrrUploadStatus,
  mrrFileInputRef,
  onMRRFileUpload,
  onRemoveMRRFile,
  onDownloadMRRFile
}: ProjectEditContentProps) => {
  const selectedClient = clients.find(c => c.id === formData.client_id);

  const handleAssignmentChange = (userId: string, checked: boolean) => {
    const currentAssignments = formData.assigned_to || [];
    const updatedAssignments = checked 
      ? [...currentAssignments, userId]
      : currentAssignments.filter(id => id !== userId);
    
    onFormDataChange({ assigned_to: updatedAssignments });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <ProjectHeader
            projectName={project?.engagement_name || ''}
            engagementId={project?.engagement_id || ''}
            activeSection={activeSection}
            clientName={selectedClient?.name}
            auditType={formData.audit_type}
            onBack={onBack}
            onSave={onSave}
            saving={saving}
          />

          {activeSection === 'engagement-profile' && (
            <EngagementProfileSection
              formData={formData}
              clients={clients}
              users={users}
              uploadedFile={uploadedFile}
              uploadStatus={uploadStatus}
              onFormDataChange={onFormDataChange}
              onAssignmentChange={handleAssignmentChange}
              onFileUpload={onFileUpload}
              onRemoveFile={onRemoveFile}
              onDownloadFile={onDownloadFile}
              projectId={projectId}
              mrrUploadedFile={mrrUploadedFile}
              mrrUploadStatus={mrrUploadStatus}
              mrrFileInputRef={mrrFileInputRef}
              onMRRFileUpload={onMRRFileUpload}
              onRemoveMRRFile={onRemoveMRRFile}
              onDownloadMRRFile={onDownloadMRRFile}
            />
          )}

          {activeSection === 'team-assignment' && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Team assignment section coming soon</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEditContent;
