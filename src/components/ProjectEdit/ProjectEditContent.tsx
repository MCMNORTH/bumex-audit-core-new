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
              formData={formData}
              onFormDataChange={onFormDataChange}
              onAssignmentChange={onAssignmentChange}
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
