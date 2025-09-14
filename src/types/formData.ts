
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
  lead_developer_id: string;
  member_ids: string[];
  team_assignments: {
    lead_partner_id: string;
    partner_ids: string[];
    manager_ids: string[];
    in_charge_ids: string[];
    staff_ids: string[];
  };
  reviews: {
    [sectionId: string]: {
      staff_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
      incharge_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
      manager_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
      partner_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
      lead_partner_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
      status: 'not_reviewed' | 'ready_for_review' | 'reviewed';
      current_review_level: 'staff' | 'incharge' | 'manager' | 'partner' | 'lead_partner' | 'completed';
    };
  };
  // Legacy support - will be migrated to reviews
  signoffs?: {
    [sectionId: string]: {
      signed: boolean;
      signedBy?: string;
      signedAt?: string;
    };
  };
  assigned_to: string[]; // Deprecated but kept for backward compatibility
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
  // Component reporting new fields
  component_reporting_applicable_auditing_standards: string;
  component_reporting_applicable_auditing_standards_other: string;
  component_reporting_applicable_financial_framework: string;
  component_reporting_applicable_financial_framework_other: string;
  component_reporting_date: string;
  group_audit_report_date: string;
  required_component_closeout_date: string;
  independence_rules_iesba: boolean;
  independence_rules_iesba_non_pie: boolean;
  independence_rules_iesba_pie: boolean;
  reporting_to_kpmg_office: boolean;
  reporting_to_non_kpmg_entity: boolean;
  auditing_financial_statements_type: string;
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
  sats_list: Array<{
    id: string;
    name: string;
  }>;
  sats_reliability_evaluation: string;
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
  ethics_breaches_details: string;
  local_quality_manual_compliance: string;
  local_quality_manual_details: string;
  member_firm_independence_work_paper: string;
  member_firm_independence_details: string;
  communicate_other_independence_matters: string;
  communicate_other_independence_details: string;
  independence_compliance_requirements: string;
  independence_compliance_details: string;
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
  
  // D&I Section fields
  control_attributes_judgment?: string;
  procedure_nature?: string;
  procedure_type?: string;
  procedure_frequency?: string;
  operator_authority?: string;
  information_used?: string;
  eval_inquiry?: boolean;
  eval_inspection?: boolean;
  eval_observation?: boolean;
  eval_procedures_documentation?: string;
  design_conclusion?: string;
  implementation_conclusion?: string;
  plan_operating_test?: string;
  // Qualitative factors fields
  qualitative_factors_table: QualitativeFactorItem[];
  
  // Materiality level fields
  current_audit_materiality_amount: string;
  prior_audit_materiality_amount: string;
  
  // Materiality assessment fields
  materiality_assessment_table: MaterialityAssessmentItem[];
  
  // Additional materiality fields
  current_audit_materiality_percentage: string;
  prior_audit_materiality_percentage: string;
  dpp_consultation_required: string;
  lower_materiality_required: string;
  
  // Performance materiality aggregation risk factors
  deficiencies_ceramic: string;
  control_deficiencies: string;
  history_misstatements: string;
  turnover_management: string;
  management_preparedness: string;
  proportion_accounts: string;
  
  // Additional performance materiality fields
  document_aggregation_risk_considerations: boolean;
  aggregation_risk_level: string;
  current_audit_aggregation_risk_level: string;
  prior_audit_aggregation_risk_level: string;
  current_audit_performance_materiality_percentage: string;
  prior_audit_performance_materiality_percentage: string;
  current_audit_performance_materiality: string;
  prior_audit_performance_materiality: string;
  
  // AMPT fields
  current_audit_ampt_percentage: string;
  prior_audit_ampt_percentage: string;
  current_audit_ampt_amount: string;
  prior_audit_ampt_amount: string;
  
  // Re-evaluate materiality fields
  materiality_changes_occurred: string;
  materiality_revision_table: any[];
  materiality_significantly_different: string;

  // Entity and environment fields
  entity_industry: string;
  financial_reporting_framework_main: string;
  entity_markets: string[];
  provide_brief_understanding: boolean;
  entity_brief_understanding: string;
  economic_conditions_confirmation: string;
  legal_environment_confirmation: string;
  laws_regulations_confirmation: string;
  technologies_confirmation: string;
  competitors_confirmation: string;
  industry_stability_confirmation: string;
  markets_products_confirmation: string;
  document_additional_considerations: boolean;
  regulatory_factors_relevant: boolean;
  entity_nature_ownership_confirmation: string;
  entity_nature_products_confirmation: string;
  entity_nature_facilities_confirmation: string;
  entity_management_governance_confirmation: string;
  entity_steady_state_confirmation: string;
  entity_transactions_routine_confirmation: string;
  entity_capital_consistent_confirmation: string;
  entity_investments_consistent_confirmation: string;
  entity_financing_simple_confirmation: string;
  entity_customer_contracts_standard_confirmation: string;
  entity_vendor_contracts_standard_confirmation: string;
  
  // Additional considerations
  additional_considerations_documentation: string;
  
  // Entity objectives, strategies, and business risks
  entity_objectives_strategies_risks: string;
  
  // Performance measures
  performance_measures_table: Array<{
    id: string;
    performance_measure: string;
    definition: string;
  }>;
  
  // Significant changes evaluation
  significant_changes_prior_periods: string;
  transactions_events_estimates: string;
  
  // Information relevance and reliability
  information_relevance_reliability: string;
  
  // Other specific procedures
  other_specific_procedures_performed: boolean;
  
  // CEAC process and past audits
  ceac_approval_email_attachment: string;
  ceac_impact_assessment: string;
  past_audits_significant_matters: string;
  evaluate_past_audit_information: boolean;
  
  // Other engagements
  other_services_impact_rmms: string;
  
  // RAPD Section
  rapd_meeting_date: string;
  rapd_team_members: Array<{
    id: string;
    member: string;
    role: string;
    attendedMeeting: boolean;
    documentMatters: string;
  }>;
  rapd_fraud_brainstorming_same_meeting: string;
  rapd_agenda_confirmation: boolean;
  rapd_document_accounting_policies: boolean;
  rapd_document_accounting_policies_details: string;
  rapd_document_management_bias: boolean;
  rapd_document_management_bias_details: string;
  rapd_document_misstatement_susceptibility: boolean;
  rapd_document_misstatement_susceptibility_details: string;
  rapd_no_other_significant_decisions: boolean;
  rapd_no_other_significant_decisions_details: string;
  rapd_document_other_significant_decisions: boolean;
  rapd_document_other_significant_decisions_details: string;

  // CERAMIC Section
  ceramic_governance_separate: string;
  ceramic_inquiries: Array<{
    id: string;
    dateOfInquiry: string;
    intervieweeName: string;
    intervieweeRole: string;
    kpmgInterviewer: string;
    ceramicComponents: string;
    controlAssessment: string;
  }>;
  ceramic_larger_entity: boolean;
  ceramic_more_complex: boolean;
  ceramic_lack_knowledge: boolean;
  ceramic_planned_reliance: boolean;
  ceramic_extensive_changes: boolean;
  ceramic_control_environment_documentation: string;
  ceramic_risk_assessment_documentation: string;
  ceramic_communication_documentation: string;
  ceramic_monitoring_activities_documentation: string;
  // CERAMIC Evaluation fields
  ceramic_eval_control_deficiencies: string;
  ceramic_eval_control_culture: string;
  ceramic_eval_control_foundation: string;
  ceramic_eval_risk_identification: string;
  ceramic_eval_risk_process: string;
  ceramic_eval_communication_support: string;
  ceramic_eval_monitoring_process: string;
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

  // Business processes
  selected_business_processes: string[];
  entity_has_material_inventory: string;
  confirm_inventory_workpaper: boolean;

  // Comptes à pouvoir section
  comptesaPouvoir_rawtc_impact?: boolean;
  comptesaPouvoir_rawtc_deficiencies?: boolean;
  comptesaPouvoir_rawtc_infrequent?: boolean;
  comptesaPouvoir_rawtc_competence?: boolean;
  comptesaPouvoir_rawtc_complex?: boolean;
  comptesaPouvoir_rawtc_prior_deficiencies?: boolean;
  comptesaPouvoir_rawtc_changes?: boolean;
  comptesaPouvoir_rawtc_judgments?: boolean;
  comptesaPouvoir_rawtc_other?: boolean;
  comptesaPouvoir_rawtc_significant?: string;
  comptesaPouvoir_assessed_rawtc?: string;
  comptesaPouvoir_procedures?: Array<{
    id: string;
    inquire: boolean;
    inspect: boolean;
    observe: boolean;
    reperform: boolean;
    involvesJudgment: string;
  }>;
  comptesaPouvoir_procedures_description?: string;
  comptesaPouvoir_period_start?: string;
  comptesaPouvoir_period_end?: string;
  comptesaPouvoir_extent_description?: string;
  comptesaPouvoir_internal_info?: string;
  comptesaPouvoir_sample_size?: string;
  comptesaPouvoir_increased_sample?: boolean;
  comptesaPouvoir_unpredictability?: boolean;
  comptesaPouvoir_sampling_tool?: boolean;
  comptesaPouvoir_generate_template?: boolean;
  comptesaPouvoir_attach_documentation?: boolean;
  comptesaPouvoir_deviations?: string;
  comptesaPouvoir_test_result?: string;
  comptesaPouvoir_period_result?: string;

  // TOE fields (moved from ComptesAPouvoirSection)
  comptesAPouvoir_gitc_rawtc_assessment?: string;
  comptesAPouvoir_design_procedures_table: ComptesAPouvoirProcedureItem[];
  comptesAPouvoir_timing_procedures?: string;
  comptesAPouvoir_extent_procedures?: string;
  comptesAPouvoir_sample_size?: string;
  comptesAPouvoir_test_operating_effectiveness?: boolean;

  // Fraud Risk Assessment fields
  fraud_risk_financial?: FraudRiskFactor[];
  fraud_risk_management?: FraudRiskFactor[];
  fraud_risk_other_management?: FraudRiskFactor[];
  fraud_risk_other_internal?: FraudRiskFactor[];
  fraud_risk_external?: FraudRiskFactor[];
  fraud_risk_misappropriation?: FraudRiskFactor[];
  fraud_risk_other_factors?: FraudRiskFactor[];
  fraud_risk_summary?: string;
  fraud_assertion_level?: FraudRiskAssessment[];
  fraud_financial_statement?: FinancialStatementFraudRisk[];
  revenue_recognition_fraud_risk?: string;
  revenue_recognition_identified?: string;
  overall_fraud_response?: string;
}

// Fraud Risk Factor interface
export interface FraudRiskFactor {
  id: string;
  description: string;
  identified: boolean;
  incentives: boolean;
  opportunities: boolean;
  attitudes: boolean;
  conditions: string | boolean;
  attachment: string;
}

// Fraud Risk Assessment interface
export interface FraudRiskAssessment {
  id: string;
  description: string;
  inherentRisk: string;
  assertions: string;
  controlApproach: string;
}

// Financial Statement Fraud Risk interface
export interface FinancialStatementFraudRisk {
  id: string;
  description: string;
  fraudulentReporting: boolean;
  misappropriationAssets: boolean;
}

// ComptesAPouvoir Procedure Item interface (needed for TOE section)
export interface ComptesAPouvoirProcedureItem {
  id: string;
  inquire: boolean;
  inspect: boolean;
  observe: boolean;
  reperform: boolean;
  involvesJudgment: string;
}

export const getInitialFormData = (): ProjectFormData => ({
  client_id: '',
  engagement_name: '',
  engagement_id: '',
  project_id: '',
  lead_developer_id: '',
  member_ids: [],
  team_assignments: {
    lead_partner_id: '',
    partner_ids: [],
    manager_ids: [],
    in_charge_ids: [],
    staff_ids: [],
  },
  reviews: {},
  signoffs: {},
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
  financial_statement_audit_report: true,
  auditing_standards: [],
  financial_reporting_framework: [],
  audit_report_date: '',
  required_audit_file_closeout_date: '',
  component_reporting: false,
  component_reporting_details: '',
  group_auditor: false,
  // Component reporting new fields defaults
  component_reporting_applicable_auditing_standards: '',
  component_reporting_applicable_auditing_standards_other: '',
  component_reporting_applicable_financial_framework: '',
  component_reporting_applicable_financial_framework_other: '',
  component_reporting_date: '',
  group_audit_report_date: '',
  required_component_closeout_date: '',
  independence_rules_iesba: false,
  independence_rules_iesba_non_pie: false,
  independence_rules_iesba_pie: false,
  reporting_to_kpmg_office: false,
  reporting_to_non_kpmg_entity: false,
  auditing_financial_statements_type: 'No',
  engagement_quality_control_reviewer: false,
  limited_scope_quality_control_reviewer: false,
  other_reviewer: false,
  governance_management_same_persons: false,
  entity_has_internal_audit_function: false,
  entity_uses_service_organization: false,
  plan_to_involve_specialists: false,
  specialist_teams: [],
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
  sats_list: [],
  sats_reliability_evaluation: '',
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
  ethics_breaches_details: '',
  local_quality_manual_compliance: 'Not selected',
  local_quality_manual_details: '',
  member_firm_independence_work_paper: 'Not selected',
  member_firm_independence_details: '',
  communicate_other_independence_matters: 'Not selected',
  communicate_other_independence_details: '',
  independence_compliance_requirements: 'Not selected',
  independence_compliance_details: '',
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
  
  // Additional materiality initial values
  current_audit_materiality_percentage: '',
  prior_audit_materiality_percentage: '',
  dpp_consultation_required: '',
  lower_materiality_required: '',
  
  // Performance materiality aggregation risk factors initial values
  deficiencies_ceramic: '',
  control_deficiencies: '',
  history_misstatements: '',
  turnover_management: '',
  management_preparedness: '',
  proportion_accounts: '',
  
  // Additional performance materiality initial values
  document_aggregation_risk_considerations: false,
  aggregation_risk_level: '',
  current_audit_aggregation_risk_level: '',
  prior_audit_aggregation_risk_level: '',
  current_audit_performance_materiality_percentage: '',
  prior_audit_performance_materiality_percentage: '',
  current_audit_performance_materiality: '',
  prior_audit_performance_materiality: '',
  
  // AMPT initial values
  current_audit_ampt_percentage: '',
  prior_audit_ampt_percentage: '',
  current_audit_ampt_amount: '',
  prior_audit_ampt_amount: '',
  
  // Re-evaluate materiality initial values
  materiality_changes_occurred: '',
  materiality_revision_table: [],
  materiality_significantly_different: '',

  // Entity and environment initial values
  entity_industry: '',
  financial_reporting_framework_main: '',
  entity_markets: [],
  provide_brief_understanding: false,
  entity_brief_understanding: '',
  economic_conditions_confirmation: '',
  legal_environment_confirmation: '',
  laws_regulations_confirmation: '',
  technologies_confirmation: '',
  competitors_confirmation: '',
  industry_stability_confirmation: '',
  markets_products_confirmation: '',
  document_additional_considerations: false,
  regulatory_factors_relevant: false,
  entity_nature_ownership_confirmation: '',
  entity_nature_products_confirmation: '',
  entity_nature_facilities_confirmation: '',
  entity_management_governance_confirmation: '',
  entity_steady_state_confirmation: '',
  entity_transactions_routine_confirmation: '',
  entity_capital_consistent_confirmation: '',
  entity_investments_consistent_confirmation: '',
  entity_financing_simple_confirmation: '',
    entity_customer_contracts_standard_confirmation: '',
    entity_vendor_contracts_standard_confirmation: '',
    
    // Additional considerations
    additional_considerations_documentation: '',
    
    // Entity objectives, strategies, and business risks
    entity_objectives_strategies_risks: '',
    
    // Performance measures
    performance_measures_table: [],
    
    // Significant changes evaluation
    significant_changes_prior_periods: '',
    transactions_events_estimates: '',
    
    // Information relevance and reliability
    information_relevance_reliability: '',
    
    // Other specific procedures
    other_specific_procedures_performed: false,
    
    // CEAC process and past audits
    ceac_approval_email_attachment: '',
    ceac_impact_assessment: '',
    past_audits_significant_matters: '',
    evaluate_past_audit_information: false,
    
    // Other engagements
    other_services_impact_rmms: '',
    
    // RAPD Section
    rapd_meeting_date: '',
  rapd_team_members: [],
  rapd_fraud_brainstorming_same_meeting: '',
  rapd_agenda_confirmation: false,
  rapd_document_accounting_policies: false,
  rapd_document_accounting_policies_details: '',
  rapd_document_management_bias: false,
  rapd_document_management_bias_details: '',
  rapd_document_misstatement_susceptibility: false,
  rapd_document_misstatement_susceptibility_details: '',
  rapd_no_other_significant_decisions: false,
  rapd_no_other_significant_decisions_details: '',
  rapd_document_other_significant_decisions: false,
  rapd_document_other_significant_decisions_details: '',

  // CERAMIC initial values
  ceramic_governance_separate: '',
  ceramic_inquiries: [],
  ceramic_larger_entity: false,
  ceramic_more_complex: false,
  ceramic_lack_knowledge: false,
  ceramic_planned_reliance: false,
  ceramic_extensive_changes: false,
  ceramic_control_environment_documentation: '',
  ceramic_risk_assessment_documentation: '',
  ceramic_communication_documentation: '',
  ceramic_monitoring_activities_documentation: '',
  // CERAMIC Evaluation initial values
  ceramic_eval_control_deficiencies: '',
  ceramic_eval_control_culture: '',
  ceramic_eval_control_foundation: '',
  ceramic_eval_risk_identification: '',
  ceramic_eval_risk_process: '',
  ceramic_eval_communication_support: '',
  ceramic_eval_monitoring_process: '',
  it_plan_to_rely_on_automated_controls: '',
  it_plan_benchmarking_strategy: '',
  it_key_members_inquired: '',
  it_interviewees: [],
  it_systems_layers: [],
  it_systems_documentation: '',
  it_attach_documentation: false,
  it_documentation_details: '',
  it_service_organizations_used: false,
  it_service_organizations: [],
  it_new_accounting_software: '',
  it_software_effects_description: '',
  it_processes_understanding: '',
  it_processes_table: [],
  it_risk_assessment_procedures_text: '',
  it_risk_assessment_procedures: [],
  it_information_used_risk_assessment: '',
  cybersecurity_risks_understanding: '',
  cybersecurity_incident_awareness: '',
  cybersecurity_bec_risks_understanding: '',
  cybersecurity_additional_inquiries: false,
  cybersecurity_additional_inquiries_details: '',
  cybersecurity_incidents_experienced: '',
  cybersecurity_risks_rmm: '',

  // Business processes
  selected_business_processes: [],
  entity_has_material_inventory: '',
  confirm_inventory_workpaper: false,

  // TOE fields initial values  
  comptesAPouvoir_design_procedures_table: [],

  // Fraud Risk Assessment initial values
  fraud_risk_financial: [],
  fraud_risk_management: [],
  fraud_risk_other_management: [],
  fraud_risk_other_internal: [],
  fraud_risk_external: [],
  fraud_risk_misappropriation: [],
  fraud_risk_other_factors: [],
  fraud_risk_summary: '',
  fraud_assertion_level: [],
  fraud_financial_statement: [],
  revenue_recognition_fraud_risk: '',
  revenue_recognition_identified: '',
  overall_fraud_response: '',
});
