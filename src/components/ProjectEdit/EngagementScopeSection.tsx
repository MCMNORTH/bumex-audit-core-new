import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EngagementTypeSection from './EngagementScope/EngagementTypeSection';
import AuditingStandardsSection from './EngagementScope/AuditingStandardsSection';
import ReportingFrameworkSection from './EngagementScope/ReportingFrameworkSection';
import ComponentReportingSection from './EngagementScope/ComponentReportingSection';
import ReviewerSelectionSection from './EngagementScope/ReviewerSelectionSection';
import ManagementGovernanceSection from './EngagementScope/ManagementGovernanceSection';
import InvolvementOfOthersSection from './EngagementScope/InvolvementOfOthersSection';
import ITEnvironmentSection from './EngagementScope/ITEnvironmentSection';
import EngagementTeamSection from './EngagementScope/EngagementTeamSection';
import DirectionSupervisionSection from './EngagementScope/DirectionSupervisionSection';
import StrategyConsiderationsSection from './EngagementScope/StrategyConsiderationsSection';
import AuditStrategySection from './EngagementScope/AuditStrategySection';

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
  specialist_teams: SpecialistTeam[];
  entity_highly_dependent_on_it: string;
  plan_to_rely_on_automated_controls: string;
  use_it_critically_checklist: boolean;
  sufficient_appropriate_resources: boolean;
  team_competence_and_capabilities: boolean;
  direction_supervision_documentation: string;
  significant_factors_directing_activities: string;
  additional_information_documentation: string;
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
  mrrUploadedFile?: File | null;
  mrrUploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  onMRRFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMRRFile?: () => void;
  onDownloadMRRFile?: () => void;
  mrrFileInputRef?: React.RefObject<HTMLInputElement>;
}

const EngagementScopeSection = ({
  formData,
  onFormDataChange,
  projectId,
  mrrUploadedFile,
  mrrUploadStatus = 'idle',
  onMRRFileUpload,
  onRemoveMRRFile,
  onDownloadMRRFile,
  mrrFileInputRef
}: EngagementScopeSectionProps) => {
  console.log('EngagementScopeSection - mrrFileInputRef:', mrrFileInputRef);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement scope and scale and other strategic matters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <EngagementTypeSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <AuditingStandardsSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <ReportingFrameworkSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <ComponentReportingSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <ReviewerSelectionSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <ManagementGovernanceSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <InvolvementOfOthersSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <ITEnvironmentSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <EngagementTeamSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <DirectionSupervisionSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <StrategyConsiderationsSection 
          formData={formData} 
          onFormDataChange={onFormDataChange} 
        />

        <AuditStrategySection 
          formData={formData} 
          onFormDataChange={onFormDataChange}
          mrrUploadedFile={mrrUploadedFile}
          mrrUploadStatus={mrrUploadStatus}
          mrrFileInputRef={mrrFileInputRef}
          onMRRFileUpload={onMRRFileUpload}
          onRemoveMRRFile={onRemoveMRRFile}
          onDownloadMRRFile={onDownloadMRRFile}
        />
      </CardContent>
    </Card>
  );
};

export default EngagementScopeSection;
