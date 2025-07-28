
// Communication item interfaces
export interface CommunicationItem {
  id: string;
  topic: string;
  included: boolean;
  date: string;
}

export interface InquiryItem {
  id: string;
  intervieweeName: string;
  intervieweeRole: string;
  intervieweePosition: string;
  kpmgInterviewer: string;
  dateOfMeeting: string;
}

export interface MeetingMinuteItem {
  id: string;
  bodyCommittee: string;
  dateOfMeeting: string;
  meetingMinutesAvailable: boolean;
  comments: string;
  attachment: string;
}

export interface TCWGResultsCommunicationItem {
  id: string;
  communicationPerformed: string;
  writtenForm: boolean;
  oralForm: boolean;
  when: string;
  toWhom: string;
  byWhom: string;
  potentiallyApplicableCR: boolean;
}

export interface MaterialityMetricItem {
  id: string;
  metrics: string;
  benchmark: string;
  mbt: string;
  amount: string;
  metricType: 'Gross' | 'Net' | '';
  relevant: boolean;
  manualAdjustment: string;
  adjustedAmount: string;
  expectedHigherRange: string;
  expectedLowerRange: string;
}

export interface QualitativeFactorItem {
  id: string;
  factors: string;
  higherLowerAmount: 'Higher' | 'Lower';
  consideration: string;
}

export interface MaterialityAssessmentItem {
  id: string;
  metrics: string;
  benchmark: string;
  amountOfMetric: string;
  materialityPercentage: string;
  guidelineRange: string;
}

export interface ProjectFormData {
  client_id: string;
  engagement_name: string;
  engagement_id: string;
  project_id: string;
  assigned_to: string[];
  status: 'new' | 'inprogress' | 'closed' | 'archived';
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
  // Audit strategy fields
  gaap_conversion_activity: boolean;
  gaas_conversion_activity: boolean;
  current_period_method: string;
  prior_period_method: string;
  minimum_review_requirement: string;
  mrr_file: string;
  // Entity profile fields
  entity_revenue_greater_than_billion: string;
  entity_meets_international_criteria: boolean;
  using_sats_not_on_firm_list: string;
  // Multi-reporting fields
  planning_to_use_multi_reporting: string;
  reports: Array<{
    id: string;
    report_id: string;
    report_name: string;
    legal_entity: string;
    is_primary_report: boolean;
  }>;
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
  // Data considerations fields
  trial_balances_electronic_format: string;
  large_batch_journal_entries: string;
  significant_circumstances_impair_da: string;
  // Independence fields
  ethics_breaches_identified: string;
  local_quality_manual_compliance: string;
  member_firm_independence_work_paper: string;
  communicate_other_independence_matters: string;
  independence_compliance_requirements: string;
  // TCWG Communications fields
  tcwg_communications: CommunicationItem[];
  tcwg_main_attachments: Array<{name: string, url: string, type: string}>;
  tcwg_inquiries: InquiryItem[];
  tcwg_meeting_minutes: MeetingMinuteItem[];
  tcwg_generate_meeting_agenda: boolean;
  tcwg_responses_unsatisfactory: string;
  tcwg_results_communications: TCWGResultsCommunicationItem[];
  tcwg_results_attachments: Array<{name: string, url: string, type: string}>;
  tcwg_adequate_communication: string;
  // Materiality metrics fields
  mbt_applicable: string;
  mbt_industry_scenarios: string;
  financial_info_materiality: string;
  period_selection: string;
  pbt_pbtco_question: string;
  materiality_metrics_notes: string;
  materiality_metrics_table: MaterialityMetricItem[];
  not_relevant_metrics_rationale: string;
  current_audit_total_revenues: string;
  prior_audit_total_revenues: string;
  current_audit_adjusted_amount: string;
  prior_audit_adjusted_amount: string;
  prior_audit_benchmark_not_metric: boolean;
  different_benchmark_rationale: string;
  
  // Qualitative factors fields
  qualitative_factors_table: QualitativeFactorItem[];
  
  // Materiality level fields
  current_audit_materiality_amount: string;
  prior_audit_materiality_amount: string;
  
  // Materiality assessment fields
  materiality_assessment_table: MaterialityAssessmentItem[];
}

export const getInitialFormData = (): ProjectFormData => ({
  client_id: '',
  engagement_name: '',
  engagement_id: '',
  project_id: '',
  assigned_to: [],
  status: 'new',
  period_start: '',
  period_end: '',
  expected_start_date: '',
  audit_type: '',
  jurisdiction: '',
  bumex_office: '',
  language: 'English',
  is_first_audit: false,
  plan_to_roll_forward: false,
  enable_external_documents: false,
  engagement_structure_file: '',
  engagement_evaluation_id: '',
  engagement_evaluation_status: 'Not Selected',
  evaluation_approval_date: '',
  planned_expiration_date: '',
  sentinel_approval_number: '',
  sentinel_approval_status: 'Not Selected',
  sentinel_approval_date: '',
  sentinel_expiration_date: '',
  first_period_auditing: 'Not selected',
  sentinel_approval_email_files: [],
  ceac_approval_email_files: [],
  other_documents_files: [],
  financial_statement_audit_report: false,
  auditing_standards: [],
  financial_reporting_framework: [],
  audit_report_date: '',
  required_audit_file_closeout_date: '',
  component_reporting: false,
  component_reporting_details: '',
  group_auditor: false,
  engagement_quality_control_reviewer: false,
  limited_scope_quality_control_reviewer: false,
  other_reviewer: false,
  governance_management_same_persons: false,
  entity_has_internal_audit_function: false,
  entity_uses_service_organization: false,
  plan_to_involve_specialists: false,
  specialist_teams: [],
  entity_highly_dependent_on_it: 'Not selected',
  plan_to_rely_on_automated_controls: 'Not selected',
  use_it_critically_checklist: false,
  sufficient_appropriate_resources: false,
  team_competence_and_capabilities: false,
  direction_supervision_documentation: '',
  significant_factors_directing_activities: '',
  additional_information_documentation: '',
  gaap_conversion_activity: false,
  gaas_conversion_activity: false,
  current_period_method: '',
  prior_period_method: '',
  minimum_review_requirement: '',
  mrr_file: '',
  entity_revenue_greater_than_billion: '',
  entity_meets_international_criteria: false,
  using_sats_not_on_firm_list: '',
  planning_to_use_multi_reporting: 'No',
  reports: [],
  engagement_partner_id: '',
  engagement_manager_id: '',
  engagement_senior_id: '',
  engagement_associate_id: '',
  engagement_quality_control_reviewer_id: '',
  limited_scope_quality_control_reviewer_id: '',
  other_reviewer_id: '',
  engagement_tax_specialist_id: '',
  engagement_actuarial_specialist_id: '',
  engagement_it_specialist_id: '',
  engagement_valuation_specialist_id: '',
  engagement_forensic_specialist_id: '',
  engagement_sustainability_specialist_id: '',
  engagement_data_analytics_specialist_id: '',
  engagement_regulatory_specialist_id: '',
  engagement_treasury_specialist_id: '',
  engagement_real_estate_specialist_id: '',
  engagement_industry_specialist_id: '',
  engagement_other_specialist_id: '',
  trial_balances_electronic_format: 'Not selected',
  large_batch_journal_entries: 'Not selected',
  significant_circumstances_impair_da: 'Not selected',
  ethics_breaches_identified: 'Not selected',
  local_quality_manual_compliance: 'Not selected',
  member_firm_independence_work_paper: 'Not selected',
  communicate_other_independence_matters: 'Not selected',
  independence_compliance_requirements: 'Not selected',
  // TCWG Communications initial values
  tcwg_communications: [],
  tcwg_main_attachments: [],
  tcwg_inquiries: [],
  tcwg_meeting_minutes: [],
  tcwg_generate_meeting_agenda: false,
  tcwg_responses_unsatisfactory: 'Not selected',
  tcwg_results_communications: [],
  tcwg_results_attachments: [],
  tcwg_adequate_communication: 'Not selected',
  // Materiality metrics initial values
  mbt_applicable: '',
  mbt_industry_scenarios: '',
  financial_info_materiality: '',
  period_selection: '',
  pbt_pbtco_question: '',
  materiality_metrics_notes: '',
  materiality_metrics_table: [],
  not_relevant_metrics_rationale: '',
  current_audit_total_revenues: '',
  prior_audit_total_revenues: '',
  current_audit_adjusted_amount: '',
  prior_audit_adjusted_amount: '',
  prior_audit_benchmark_not_metric: false,
  different_benchmark_rationale: '',
  
  // Qualitative factors initial values
  qualitative_factors_table: [],
  
  // Materiality level initial values
  current_audit_materiality_amount: '',
  prior_audit_materiality_amount: '',
  
  // Materiality assessment initial values
  materiality_assessment_table: [],
});
