import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from 'lucide-react';
import { Client, User, Project } from '@/types';
import FileUploadSection from './FileUploadSection';
import DocumentAttachmentSection from './DocumentAttachmentSection';
import EngagementScopeSection from './EngagementScopeSection';
import EntityProfileSection from './EngagementScope/EntityProfileSection';
import MultiReportingSection from './MultiReportingSection';
import DataConsiderationsSection from './DataConsiderationsSection';
import { useTranslation } from '@/contexts/TranslationContext';

interface DocumentFile {
  name: string;
  url: string;
  type: string;
}

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
  // New engagement evaluation fields
  engagement_evaluation_id: string;
  engagement_evaluation_status: string;
  evaluation_approval_date: string;
  planned_expiration_date: string;
  // New sentinel approval fields
  sentinel_approval_number: string;
  sentinel_approval_status: string;
  sentinel_approval_date: string;
  sentinel_expiration_date: string;
  // New radio button field
  first_period_auditing: string;
  // Document attachment fields
  sentinel_approval_email_files: DocumentFile[];
  ceac_approval_email_files: DocumentFile[];
  other_documents_files: DocumentFile[];
  // Engagement scope and scale fields
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
  // New involvement of others fields
  entity_uses_service_organization: boolean;
  plan_to_involve_specialists: boolean;
  specialist_teams: Array<{
    id: string;
    description: string;
    name: string;
    title: string;
  }>;
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
  // New entity profile fields
  entity_revenue_greater_than_billion: string;
  entity_meets_international_criteria: boolean;
  using_sats_not_on_firm_list: string;
  // New multi-reporting fields
  planning_to_use_multi_reporting: string;
  reports: Array<{
    id: string;
    report_id: string;
    report_name: string;
    legal_entity: string;
    is_primary_report: boolean;
  }>;
  // New data considerations fields
  trial_balances_electronic_format: string;
  large_batch_journal_entries: string;
  significant_circumstances_impair_da: string;
  // New IT fields
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
}

interface EngagementProfileSectionProps {
  formData: FormData;
  clients: Client[];
  users: User[];
  uploadedFile: File | null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  onFormDataChange: (updates: Partial<FormData>) => void;
  onAssignmentChange: (userId: string, checked: boolean) => void;
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

const EngagementProfileSection = ({
  formData,
  clients,
  users,
  uploadedFile,
  uploadStatus,
  onFormDataChange,
  onAssignmentChange,
  onFileUpload,
  onRemoveFile,
  onDownloadFile,
  projectId = '',
  // MRR file upload props
  mrrUploadedFile,
  mrrUploadStatus,
  mrrFileInputRef,
  onMRRFileUpload,
  onRemoveMRRFile,
  onDownloadMRRFile
}: EngagementProfileSectionProps) => {
  const { t } = useTranslation();
  
  const auditTypes = [
    { value: 'Financial Audit', label: t('engagement.auditTypes.financial') },
    { value: 'Compliance Audit', label: t('engagement.auditTypes.compliance') },
    { value: 'Operational Audit', label: t('engagement.auditTypes.operational') },
    { value: 'IT Audit', label: t('engagement.auditTypes.it') },
    { value: 'Internal Audit', label: t('engagement.auditTypes.internal') },
    { value: 'Tax Audit', label: t('engagement.auditTypes.tax') },
    { value: 'Forensic Audit', label: t('engagement.auditTypes.forensic') },
    { value: 'Environmental Audit', label: t('engagement.auditTypes.environmental') }
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Other'];
  const bumexOffices = ['Nouakchott'];
  const approvalStatuses = [
    { value: 'Not Selected', label: t('engagement.statuses.notSelected') },
    { value: 'Approved', label: t('engagement.statuses.approved') }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('engagement.basicInformation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">{t('engagement.client')}</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => onFormDataChange({ client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('engagement.placeholders.selectClient')} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">{t('engagement.status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onFormDataChange({ status: value as Project['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t('engagement.statuses.new')}</SelectItem>
                  <SelectItem value="inprogress">{t('engagement.statuses.inprogress')}</SelectItem>
                  <SelectItem value="closed">{t('engagement.statuses.closed')}</SelectItem>
                  <SelectItem value="archived">{t('engagement.statuses.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="engagement_name">{t('engagement.engagementName')}</Label>
            <Input
              id="engagement_name"
              value={formData.engagement_name}
              onChange={(e) => onFormDataChange({ engagement_name: e.target.value })}
              placeholder={t('engagement.placeholders.engagementName')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engagement_id">{t('engagement.engagementId')}</Label>
              <Input
                id="engagement_id"
                value={formData.engagement_id}
                onChange={(e) => onFormDataChange({ engagement_id: e.target.value })}
                placeholder={t('engagement.placeholders.engagementId')}
              />
            </div>
            <div>
              <Label htmlFor="project_id">{t('engagement.projectId')}</Label>
              <Input
                id="project_id"
                value={formData.project_id}
                onChange={(e) => onFormDataChange({ project_id: e.target.value })}
                placeholder={t('engagement.placeholders.projectId')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="audit_type">{t('engagement.auditType')}</Label>
              <Select
                value={formData.audit_type}
                onValueChange={(value) => onFormDataChange({ audit_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('engagement.placeholders.selectAuditType')} />
                </SelectTrigger>
                <SelectContent>
                  {auditTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">{t('engagement.language')}</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => onFormDataChange({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jurisdiction">{t('engagement.jurisdiction')}</Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => onFormDataChange({ jurisdiction: e.target.value })}
                placeholder={t('engagement.placeholders.jurisdiction')}
              />
            </div>
            <div>
              <Label htmlFor="bumex_office">{t('engagement.bumexOffice')}</Label>
              <Select
                value={formData.bumex_office}
                onValueChange={(value) => onFormDataChange({ bumex_office: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('engagement.placeholders.selectBumexOffice')} />
                </SelectTrigger>
                <SelectContent>
                  {bumexOffices.map((office) => (
                    <SelectItem key={office} value={office}>
                      {office}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="period_start">{t('engagement.periodStart')}</Label>
              <Input
                id="period_start"
                type="date"
                value={formData.period_start}
                onChange={(e) => onFormDataChange({ period_start: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="period_end">{t('engagement.periodEnd')}</Label>
              <Input
                id="period_end"
                type="date"
                value={formData.period_end}
                onChange={(e) => onFormDataChange({ period_end: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="expected_start_date">{t('engagement.expectedStartDate')}</Label>
              <div className="relative">
                <Input
                  id="expected_start_date"
                  type="date"
                  value={formData.expected_start_date}
                  onChange={(e) => onFormDataChange({ expected_start_date: e.target.value })}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_first_audit"
                checked={formData.is_first_audit}
                onCheckedChange={(checked) => onFormDataChange({ is_first_audit: checked as boolean })}
              />
              <Label htmlFor="is_first_audit">{t('engagement.firstTimeAudit')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="plan_to_roll_forward"
                checked={formData.plan_to_roll_forward}
                onCheckedChange={(checked) => onFormDataChange({ plan_to_roll_forward: checked as boolean })}
              />
              <Label htmlFor="plan_to_roll_forward">{t('engagement.planToRollForward')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable_external_documents"
                checked={formData.enable_external_documents}
                onCheckedChange={(checked) => onFormDataChange({ enable_external_documents: checked as boolean })}
              />
              <Label htmlFor="enable_external_documents">{t('engagement.enableExternalDocuments')}</Label>
            </div>
          </div>

          <FileUploadSection
            uploadedFile={uploadedFile}
            uploadStatus={uploadStatus}
            onFileUpload={onFileUpload}
            onRemoveFile={onRemoveFile}
            onDownloadFile={onDownloadFile}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('engagement.evaluationInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="engagement_evaluation_id">{t('engagement.evaluationId')}</Label>
              <Input
                id="engagement_evaluation_id"
                value={formData.engagement_evaluation_id}
                onChange={(e) => onFormDataChange({ engagement_evaluation_id: e.target.value })}
                placeholder={t('engagement.placeholders.evaluationId')}
              />
            </div>
            <div>
              <Label htmlFor="engagement_evaluation_status">{t('engagement.evaluationStatus')}</Label>
              <Select
                value={formData.engagement_evaluation_status}
                onValueChange={(value) => onFormDataChange({ engagement_evaluation_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {approvalStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="evaluation_approval_date">{t('engagement.evaluationApprovalDate')}</Label>
              <Input
                id="evaluation_approval_date"
                type="date"
                value={formData.evaluation_approval_date}
                onChange={(e) => onFormDataChange({ evaluation_approval_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="planned_expiration_date">{t('engagement.plannedExpirationDate')}</Label>
              <Input
                id="planned_expiration_date"
                type="date"
                value={formData.planned_expiration_date}
                onChange={(e) => onFormDataChange({ planned_expiration_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="sentinel_approval_number">{t('engagement.sentinelApprovalNumber')}</Label>
              <Input
                id="sentinel_approval_number"
                value={formData.sentinel_approval_number}
                onChange={(e) => onFormDataChange({ sentinel_approval_number: e.target.value })}
                placeholder={t('engagement.placeholders.sentinelNumber')}
              />
            </div>
            <div>
              <Label htmlFor="sentinel_approval_status">{t('engagement.sentinelApprovalStatus')}</Label>
              <Select
                value={formData.sentinel_approval_status}
                onValueChange={(value) => onFormDataChange({ sentinel_approval_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {approvalStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sentinel_approval_date">{t('engagement.sentinelApprovalDate')}</Label>
              <Input
                id="sentinel_approval_date"
                type="date"
                value={formData.sentinel_approval_date}
                onChange={(e) => onFormDataChange({ sentinel_approval_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sentinel_expiration_date">{t('engagement.sentinelExpirationDate')}</Label>
              <Input
                id="sentinel_expiration_date"
                type="date"
                value={formData.sentinel_expiration_date}
                onChange={(e) => onFormDataChange({ sentinel_expiration_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{t('engagement.performProcedures')}</h4>
            <div>
              <Label className="text-sm font-medium">{t('engagement.isFirstPeriod')}</Label>
              <RadioGroup
                value={formData.first_period_auditing || ''}
                onValueChange={(value) => onFormDataChange({ first_period_auditing: value })}
                className="flex space-x-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="yes" />
                  <Label htmlFor="yes" className="text-sm">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="no" />
                  <Label htmlFor="no" className="text-sm">{t('common.no')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{t('engagement.attachDocuments')}</h4>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <DocumentAttachmentSection
                title={t('engagement.sentinelApprovalEmail')}
                files={formData.sentinel_approval_email_files}
                onFilesChange={(files) => onFormDataChange({ sentinel_approval_email_files: files })}
                projectId={projectId}
                storagePrefix="sentinel-approval"
              />
              
              <DocumentAttachmentSection
                title={t('engagement.ceacApprovalEmail')}
                files={formData.ceac_approval_email_files}
                onFilesChange={(files) => onFormDataChange({ ceac_approval_email_files: files })}
                projectId={projectId}
                storagePrefix="ceac-approval"
              />
              
              <DocumentAttachmentSection
                title={t('engagement.otherDocuments')}
                files={formData.other_documents_files}
                onFilesChange={(files) => onFormDataChange({ other_documents_files: files })}
                projectId={projectId}
                storagePrefix="other-documents"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <EngagementScopeSection
        formData={{
          financial_statement_audit_report: formData.financial_statement_audit_report,
          auditing_standards: formData.auditing_standards,
          financial_reporting_framework: formData.financial_reporting_framework,
          audit_report_date: formData.audit_report_date,
          required_audit_file_closeout_date: formData.required_audit_file_closeout_date,
          component_reporting: formData.component_reporting || false,
          component_reporting_details: formData.component_reporting_details || '',
          group_auditor: formData.group_auditor || false,
          engagement_quality_control_reviewer: formData.engagement_quality_control_reviewer || false,
          limited_scope_quality_control_reviewer: formData.limited_scope_quality_control_reviewer || false,
          other_reviewer: formData.other_reviewer || false,
          governance_management_same_persons: formData.governance_management_same_persons || false,
          entity_has_internal_audit_function: formData.entity_has_internal_audit_function || false,
          // New involvement of others fields
          entity_uses_service_organization: formData.entity_uses_service_organization || false,
          plan_to_involve_specialists: formData.plan_to_involve_specialists || false,
          specialist_teams: formData.specialist_teams || [],
          // IT environment fields
          it_plan_to_rely_on_automated_controls: formData.it_plan_to_rely_on_automated_controls || '',
          it_plan_benchmarking_strategy: formData.it_plan_benchmarking_strategy || '',
          it_key_members_inquired: formData.it_key_members_inquired || '',
          it_interviewees: formData.it_interviewees || [],
          it_systems_layers: formData.it_systems_layers || [],
          it_systems_documentation: formData.it_systems_documentation || '',
          it_attach_documentation: formData.it_attach_documentation || false,
          it_documentation_details: formData.it_documentation_details || '',
          it_service_organizations_used: formData.it_service_organizations_used || false,
          it_service_organizations: formData.it_service_organizations || [],
          it_new_accounting_software: formData.it_new_accounting_software || '',
          it_software_effects_description: formData.it_software_effects_description || '',
          it_processes_understanding: formData.it_processes_understanding || '',
          it_processes_table: formData.it_processes_table || [],
          it_risk_assessment_procedures_text: formData.it_risk_assessment_procedures_text || '',
          it_risk_assessment_procedures: formData.it_risk_assessment_procedures || [],
          it_information_used_risk_assessment: formData.it_information_used_risk_assessment || '',
          cybersecurity_risks_understanding: formData.cybersecurity_risks_understanding || '',
          cybersecurity_incident_awareness: formData.cybersecurity_incident_awareness || '',
          cybersecurity_bec_risks_understanding: formData.cybersecurity_bec_risks_understanding || '',
          cybersecurity_additional_inquiries: formData.cybersecurity_additional_inquiries || false,
          cybersecurity_additional_inquiries_details: formData.cybersecurity_additional_inquiries_details || '',
          cybersecurity_incidents_experienced: formData.cybersecurity_incidents_experienced || '',
          cybersecurity_risks_rmm: formData.cybersecurity_risks_rmm || '',
          // Engagement team fields
          sufficient_appropriate_resources: (formData as any).sufficient_appropriate_resources || false,
          team_competence_and_capabilities: (formData as any).team_competence_and_capabilities || false,
          // Direction and supervision field
          direction_supervision_documentation: (formData as any).direction_supervision_documentation || '',
          // Other strategy or planning considerations fields
          significant_factors_directing_activities: (formData as any).significant_factors_directing_activities || '',
          additional_information_documentation: (formData as any).additional_information_documentation || '',
          // New audit strategy fields
          gaap_conversion_activity: (formData as any).gaap_conversion_activity || false,
          gaas_conversion_activity: (formData as any).gaas_conversion_activity || false,
          current_period_method: (formData as any).current_period_method || '',
          prior_period_method: (formData as any).prior_period_method || '',
          minimum_review_requirement: (formData as any).minimum_review_requirement || '',
          mrr_file: (formData as any).mrr_file || '',
        }}
        onFormDataChange={onFormDataChange}
        projectId={projectId}
        mrrUploadedFile={mrrUploadedFile}
        mrrUploadStatus={mrrUploadStatus}
        mrrFileInputRef={mrrFileInputRef}
        onMRRFileUpload={onMRRFileUpload}
        onRemoveMRRFile={onRemoveMRRFile}
        onDownloadMRRFile={onDownloadMRRFile}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('engagement.entityProfile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityProfileSection
            formData={{
              entity_revenue_greater_than_billion: formData.entity_revenue_greater_than_billion,
              entity_meets_international_criteria: formData.entity_meets_international_criteria,
              using_sats_not_on_firm_list: formData.using_sats_not_on_firm_list,
            }}
            onFormDataChange={onFormDataChange}
          />
        </CardContent>
      </Card>

      <MultiReportingSection
        formData={{
          planning_to_use_multi_reporting: formData.planning_to_use_multi_reporting || 'No',
          reports: formData.reports || []
        }}
        onFormDataChange={onFormDataChange}
      />

      <DataConsiderationsSection
        formData={{
          trial_balances_electronic_format: formData.trial_balances_electronic_format || '',
          large_batch_journal_entries: formData.large_batch_journal_entries || '',
          significant_circumstances_impair_da: formData.significant_circumstances_impair_da || ''
        }}
        onFormDataChange={onFormDataChange}
      />

    </div>
  );
};

export default EngagementProfileSection;
