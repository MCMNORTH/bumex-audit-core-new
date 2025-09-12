import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/types';
import { ProjectFormData, getInitialFormData } from '@/types/formData';
import { useLogging } from '@/hooks/useLogging';
import { useAuth } from '@/hooks/useAuth';
import { getProjectRole, isDevOrAdmin, getCurrentReviewLevel } from '@/utils/permissions';

export const useProjectForm = (project: Project | null, projectId?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { logProjectAction } = useLogging();
  const [formData, setFormData] = useState<ProjectFormData>({
    ...getInitialFormData(),
    reviews: {},
    signoffs: {}
  });
  const [saving, setSaving] = useState(false);

  // Initialize form data from project
  const initializeFormData = (projectData: Project) => {
    console.log('Initializing form data with project:', projectData);
    console.log('Project client_id:', projectData.client_id);
    setFormData({
      client_id: projectData.client_id,
      engagement_name: projectData.engagement_name,
      engagement_id: projectData.engagement_id,
      project_id: projectData.project_id || '',
      lead_developer_id: projectData.lead_developer_id || '',
      member_ids: (projectData as any).member_ids || [],
      team_assignments: {
        lead_partner_id: projectData.team_assignments?.lead_partner_id || '',
        partner_ids: projectData.team_assignments?.partner_ids || [],
        manager_ids: projectData.team_assignments?.manager_ids || [],
        in_charge_ids: projectData.team_assignments?.in_charge_ids || [],
        staff_ids: projectData.team_assignments?.staff_ids || [],
      },
      assigned_to: projectData.assigned_to,
      status: projectData.status,
      period_start: projectData.period_start.toISOString().split('T')[0],
      period_end: projectData.period_end.toISOString().split('T')[0],
      expected_start_date: projectData.period_start.toISOString().split('T')[0],
      audit_type: projectData.audit_type,
      jurisdiction: projectData.jurisdiction,
      bumex_office: projectData.bumex_office || '',
      language: projectData.language,
      is_first_audit: projectData.is_first_audit,
      plan_to_roll_forward: false,
      enable_external_documents: false,
      engagement_structure_file: (projectData as any).engagement_structure_file || '',
      engagement_evaluation_id: (projectData as any).engagement_evaluation_id || '',
      engagement_evaluation_status: (projectData as any).engagement_evaluation_status || 'Not Selected',
      evaluation_approval_date: (projectData as any).evaluation_approval_date || '',
      planned_expiration_date: (projectData as any).planned_expiration_date || '',
      sentinel_approval_number: (projectData as any).sentinel_approval_number || '',
      sentinel_approval_status: (projectData as any).sentinel_approval_status || 'Not Selected',
      sentinel_approval_date: (projectData as any).sentinel_approval_date || '',
      sentinel_expiration_date: (projectData as any).sentinel_expiration_date || '',
      first_period_auditing: (projectData as any).first_period_auditing || 'Not selected',
      sentinel_approval_email_files: (projectData as any).sentinel_approval_email_files || [],
      ceac_approval_email_files: (projectData as any).ceac_approval_email_files || [],
      other_documents_files: (projectData as any).other_documents_files || [],
      financial_statement_audit_report: (projectData as any).financial_statement_audit_report || false,
      auditing_standards: (projectData as any).auditing_standards || [],
      financial_reporting_framework: (projectData as any).financial_reporting_framework || [],
      audit_report_date: (projectData as any).audit_report_date || '',
      required_audit_file_closeout_date: (projectData as any).required_audit_file_closeout_date || '',
      component_reporting: (projectData as any).component_reporting || false,
      component_reporting_details: (projectData as any).component_reporting_details || '',
      group_auditor: (projectData as any).group_auditor || false,
      engagement_quality_control_reviewer: (projectData as any).engagement_quality_control_reviewer || false,
      limited_scope_quality_control_reviewer: (projectData as any).limited_scope_quality_control_reviewer || false,
      other_reviewer: (projectData as any).other_reviewer || false,
      governance_management_same_persons: (projectData as any).governance_management_same_persons || false,
      entity_has_internal_audit_function: (projectData as any).entity_has_internal_audit_function || false,
      entity_uses_service_organization: (projectData as any).entity_uses_service_organization || false,
      plan_to_involve_specialists: (projectData as any).plan_to_involve_specialists || false,
      specialist_teams: (projectData as any).specialist_teams || [],
      sufficient_appropriate_resources: (projectData as any).sufficient_appropriate_resources || false,
      team_competence_and_capabilities: (projectData as any).team_competence_and_capabilities || false,
      direction_supervision_documentation: (projectData as any).direction_supervision_documentation || '',
      significant_factors_directing_activities: (projectData as any).significant_factors_directing_activities || '',
      additional_information_documentation: (projectData as any).additional_information_documentation || '',
      gaap_conversion_activity: (projectData as any).gaap_conversion_activity || false,
      gaas_conversion_activity: (projectData as any).gaas_conversion_activity || false,
      current_period_method: (projectData as any).current_period_method || '',
      prior_period_method: (projectData as any).prior_period_method || '',
      minimum_review_requirement: (projectData as any).minimum_review_requirement || '',
      mrr_file: (projectData as any).mrr_file || '',
      entity_revenue_greater_than_billion: (projectData as any).entity_revenue_greater_than_billion || '',
      entity_meets_international_criteria: (projectData as any).entity_meets_international_criteria || false,
      using_sats_not_on_firm_list: (projectData as any).using_sats_not_on_firm_list || '',
      planning_to_use_multi_reporting: (projectData as any).planning_to_use_multi_reporting || 'No',
      reports: (projectData as any).reports || [],
      engagement_partner_id: (projectData as any).engagement_partner_id || '',
      engagement_manager_id: (projectData as any).engagement_manager_id || '',
      engagement_senior_id: (projectData as any).engagement_senior_id || '',
      engagement_associate_id: (projectData as any).engagement_associate_id || '',
      engagement_quality_control_reviewer_id: (projectData as any).engagement_quality_control_reviewer_id || '',
      limited_scope_quality_control_reviewer_id: (projectData as any).limited_scope_quality_control_reviewer_id || '',
      other_reviewer_id: (projectData as any).other_reviewer_id || '',
      engagement_tax_specialist_id: (projectData as any).engagement_tax_specialist_id || '',
      engagement_actuarial_specialist_id: (projectData as any).engagement_actuarial_specialist_id || '',
      engagement_it_specialist_id: (projectData as any).engagement_it_specialist_id || '',
      engagement_valuation_specialist_id: (projectData as any).engagement_valuation_specialist_id || '',
      engagement_forensic_specialist_id: (projectData as any).engagement_forensic_specialist_id || '',
      engagement_sustainability_specialist_id: (projectData as any).engagement_sustainability_specialist_id || '',
      engagement_data_analytics_specialist_id: (projectData as any).engagement_data_analytics_specialist_id || '',
      engagement_regulatory_specialist_id: (projectData as any).engagement_regulatory_specialist_id || '',
      engagement_treasury_specialist_id: (projectData as any).engagement_treasury_specialist_id || '',
      engagement_real_estate_specialist_id: (projectData as any).engagement_real_estate_specialist_id || '',
      engagement_industry_specialist_id: (projectData as any).engagement_industry_specialist_id || '',
      engagement_other_specialist_id: (projectData as any).engagement_other_specialist_id || '',
      trial_balances_electronic_format: (projectData as any).trial_balances_electronic_format || 'Not selected',
      large_batch_journal_entries: (projectData as any).large_batch_journal_entries || 'Not selected',
      significant_circumstances_impair_da: (projectData as any).significant_circumstances_impair_da || 'Not selected',
      ethics_breaches_identified: (projectData as any).ethics_breaches_identified || 'Not selected',
      local_quality_manual_compliance: (projectData as any).local_quality_manual_compliance || 'Not selected',
      member_firm_independence_work_paper: (projectData as any).member_firm_independence_work_paper || 'Not selected',
      communicate_other_independence_matters: (projectData as any).communicate_other_independence_matters || 'Not selected',
      independence_compliance_requirements: (projectData as any).independence_compliance_requirements || 'Not selected',
      // TCWG Communications initialization
      tcwg_communications: (projectData as any).tcwg_communications || [],
      tcwg_main_attachments: (projectData as any).tcwg_main_attachments || [],
      tcwg_inquiries: (projectData as any).tcwg_inquiries || [],
      tcwg_meeting_minutes: (projectData as any).tcwg_meeting_minutes || [],
      tcwg_generate_meeting_agenda: (projectData as any).tcwg_generate_meeting_agenda || false,
      tcwg_responses_unsatisfactory: (projectData as any).tcwg_responses_unsatisfactory || 'Not selected',
      tcwg_results_communications: (projectData as any).tcwg_results_communications || [],
      tcwg_results_attachments: (projectData as any).tcwg_results_attachments || [],
      tcwg_adequate_communication: (projectData as any).tcwg_adequate_communication || 'Not selected',
      // Materiality metrics initialization
      mbt_applicable: (projectData as any).mbt_applicable || '',
      mbt_industry_scenarios: (projectData as any).mbt_industry_scenarios || '',
      financial_info_materiality: (projectData as any).financial_info_materiality || '',
      period_selection: (projectData as any).period_selection || '',
      pbt_pbtco_question: (projectData as any).pbt_pbtco_question || '',
      materiality_metrics_notes: (projectData as any).materiality_metrics_notes || '',
      materiality_metrics_table: (projectData as any).materiality_metrics_table || [],
      not_relevant_metrics_rationale: (projectData as any).not_relevant_metrics_rationale || '',
      current_audit_total_revenues: (projectData as any).current_audit_total_revenues || '',
      prior_audit_total_revenues: (projectData as any).prior_audit_total_revenues || '',
      current_audit_adjusted_amount: (projectData as any).current_audit_adjusted_amount || '',
      prior_audit_adjusted_amount: (projectData as any).prior_audit_adjusted_amount || '',
      prior_audit_benchmark_not_metric: (projectData as any).prior_audit_benchmark_not_metric || false,
      different_benchmark_rationale: (projectData as any).different_benchmark_rationale || '',
      // Qualitative factors initialization
      qualitative_factors_table: (projectData as any).qualitative_factors_table || [],
      // Materiality level initialization
      current_audit_materiality_amount: (projectData as any).current_audit_materiality_amount || '',
      prior_audit_materiality_amount: (projectData as any).prior_audit_materiality_amount || '',
      // Materiality assessment initialization
      materiality_assessment_table: (projectData as any).materiality_assessment_table || [],
      // Additional materiality initialization
      current_audit_materiality_percentage: (projectData as any).current_audit_materiality_percentage || '',
      prior_audit_materiality_percentage: (projectData as any).prior_audit_materiality_percentage || '',
      dpp_consultation_required: (projectData as any).dpp_consultation_required || '',
      lower_materiality_required: (projectData as any).lower_materiality_required || '',
    
    // D&I Section fields
    control_attributes_judgment: '',
    procedure_nature: 'AUTOMATED',
    procedure_type: 'PREVENTIVE',
    procedure_frequency: 'Ad-hoc',
    operator_authority: '',
    information_used: '',
    eval_inquiry: false,
    eval_inspection: false,
    eval_observation: false,
    eval_procedures_documentation: '',
    design_conclusion: '',
    implementation_conclusion: '',
    plan_operating_test: '',
      // Performance materiality aggregation risk factors initialization
      deficiencies_ceramic: (projectData as any).deficiencies_ceramic || '',
      control_deficiencies: (projectData as any).control_deficiencies || '',
      history_misstatements: (projectData as any).history_misstatements || '',
      turnover_management: (projectData as any).turnover_management || '',
      management_preparedness: (projectData as any).management_preparedness || '',
      proportion_accounts: (projectData as any).proportion_accounts || '',
      
      // Additional performance materiality initialization
      document_aggregation_risk_considerations: (projectData as any).document_aggregation_risk_considerations || false,
      aggregation_risk_level: (projectData as any).aggregation_risk_level || '',
      current_audit_aggregation_risk_level: (projectData as any).current_audit_aggregation_risk_level || '',
      prior_audit_aggregation_risk_level: (projectData as any).prior_audit_aggregation_risk_level || '',
      current_audit_performance_materiality_percentage: (projectData as any).current_audit_performance_materiality_percentage || '',
      prior_audit_performance_materiality_percentage: (projectData as any).prior_audit_performance_materiality_percentage || '',
      current_audit_performance_materiality: (projectData as any).current_audit_performance_materiality || '',
      prior_audit_performance_materiality: (projectData as any).prior_audit_performance_materiality || '',
      
      // AMPT initialization
      current_audit_ampt_percentage: (projectData as any).current_audit_ampt_percentage || '',
      prior_audit_ampt_percentage: (projectData as any).prior_audit_ampt_percentage || '',
      current_audit_ampt_amount: (projectData as any).current_audit_ampt_amount || '',
      prior_audit_ampt_amount: (projectData as any).prior_audit_ampt_amount || '',
      
      // Re-evaluate materiality initialization
      materiality_changes_occurred: (projectData as any).materiality_changes_occurred || '',
      materiality_revision_table: (projectData as any).materiality_revision_table || [],
      materiality_significantly_different: (projectData as any).materiality_significantly_different || '',

      // Entity and environment initialization
      entity_industry: (projectData as any).entity_industry || '',
      financial_reporting_framework_main: (projectData as any).financial_reporting_framework_main || '',
      entity_markets: (projectData as any).entity_markets || [],
      provide_brief_understanding: (projectData as any).provide_brief_understanding || false,
      entity_brief_understanding: (projectData as any).entity_brief_understanding || '',
      economic_conditions_confirmation: (projectData as any).economic_conditions_confirmation || '',
      legal_environment_confirmation: (projectData as any).legal_environment_confirmation || '',
      laws_regulations_confirmation: (projectData as any).laws_regulations_confirmation || '',
      technologies_confirmation: (projectData as any).technologies_confirmation || '',
      competitors_confirmation: (projectData as any).competitors_confirmation || '',
      industry_stability_confirmation: (projectData as any).industry_stability_confirmation || '',
      markets_products_confirmation: (projectData as any).markets_products_confirmation || '',
      document_additional_considerations: (projectData as any).document_additional_considerations || false,
      regulatory_factors_relevant: (projectData as any).regulatory_factors_relevant || false,
      entity_nature_ownership_confirmation: (projectData as any).entity_nature_ownership_confirmation || '',
      entity_nature_products_confirmation: (projectData as any).entity_nature_products_confirmation || '',
      entity_nature_facilities_confirmation: (projectData as any).entity_nature_facilities_confirmation || '',
      entity_management_governance_confirmation: (projectData as any).entity_management_governance_confirmation || '',
      entity_steady_state_confirmation: (projectData as any).entity_steady_state_confirmation || '',
      entity_transactions_routine_confirmation: (projectData as any).entity_transactions_routine_confirmation || '',
      entity_capital_consistent_confirmation: (projectData as any).entity_capital_consistent_confirmation || '',
      entity_investments_consistent_confirmation: (projectData as any).entity_investments_consistent_confirmation || '',
      entity_financing_simple_confirmation: (projectData as any).entity_financing_simple_confirmation || '',
      entity_customer_contracts_standard_confirmation: (projectData as any).entity_customer_contracts_standard_confirmation || '',
      entity_vendor_contracts_standard_confirmation: (projectData as any).entity_vendor_contracts_standard_confirmation || '',
      
      // Additional considerations
      additional_considerations_documentation: (projectData as any).additional_considerations_documentation || '',
      
      // Entity objectives, strategies, and business risks
      entity_objectives_strategies_risks: (projectData as any).entity_objectives_strategies_risks || '',
      
      // Performance measures
      performance_measures_table: (projectData as any).performance_measures_table || [],
      
      // Significant changes evaluation
      significant_changes_prior_periods: (projectData as any).significant_changes_prior_periods || '',
      transactions_events_estimates: (projectData as any).transactions_events_estimates || '',
      
      // Information relevance and reliability
      information_relevance_reliability: (projectData as any).information_relevance_reliability || '',
      
      // Other specific procedures
      other_specific_procedures_performed: (projectData as any).other_specific_procedures_performed || false,
      
      // CEAC process and past audits
      ceac_approval_email_attachment: (projectData as any).ceac_approval_email_attachment || '',
      ceac_impact_assessment: (projectData as any).ceac_impact_assessment || '',
      past_audits_significant_matters: (projectData as any).past_audits_significant_matters || '',
      evaluate_past_audit_information: (projectData as any).evaluate_past_audit_information || false,
      
      // Other engagements
      other_services_impact_rmms: (projectData as any).other_services_impact_rmms || '',
      
      // RAPD Section
      rapd_meeting_date: (projectData as any).rapd_meeting_date || '',
      rapd_team_members: (projectData as any).rapd_team_members || [],
      rapd_fraud_brainstorming_same_meeting: (projectData as any).rapd_fraud_brainstorming_same_meeting || '',
      rapd_agenda_confirmation: (projectData as any).rapd_agenda_confirmation || false,
      rapd_document_accounting_policies: (projectData as any).rapd_document_accounting_policies || false,
      rapd_document_accounting_policies_details: (projectData as any).rapd_document_accounting_policies_details || '',
      rapd_document_management_bias: (projectData as any).rapd_document_management_bias || false,
      rapd_document_management_bias_details: (projectData as any).rapd_document_management_bias_details || '',
      rapd_document_misstatement_susceptibility: (projectData as any).rapd_document_misstatement_susceptibility || false,
      rapd_document_misstatement_susceptibility_details: (projectData as any).rapd_document_misstatement_susceptibility_details || '',
      rapd_no_other_significant_decisions: (projectData as any).rapd_no_other_significant_decisions || false,
      rapd_no_other_significant_decisions_details: (projectData as any).rapd_no_other_significant_decisions_details || '',
      rapd_document_other_significant_decisions: (projectData as any).rapd_document_other_significant_decisions || false,
      rapd_document_other_significant_decisions_details: (projectData as any).rapd_document_other_significant_decisions_details || '',

      // CERAMIC initialization
      ceramic_governance_separate: (projectData as any).ceramic_governance_separate || '',
      ceramic_inquiries: (projectData as any).ceramic_inquiries || [],
      ceramic_larger_entity: (projectData as any).ceramic_larger_entity || false,
      ceramic_more_complex: (projectData as any).ceramic_more_complex || false,
      ceramic_lack_knowledge: (projectData as any).ceramic_lack_knowledge || false,
      ceramic_planned_reliance: (projectData as any).ceramic_planned_reliance || false,
      ceramic_extensive_changes: (projectData as any).ceramic_extensive_changes || false,
      ceramic_control_environment_documentation: (projectData as any).ceramic_control_environment_documentation || '',
      ceramic_risk_assessment_documentation: (projectData as any).ceramic_risk_assessment_documentation || '',
      ceramic_communication_documentation: (projectData as any).ceramic_communication_documentation || '',
      ceramic_monitoring_activities_documentation: (projectData as any).ceramic_monitoring_activities_documentation || '',
      // CERAMIC Evaluation initialization
      ceramic_eval_control_deficiencies: (projectData as any).ceramic_eval_control_deficiencies || '',
      ceramic_eval_control_culture: (projectData as any).ceramic_eval_control_culture || '',
      ceramic_eval_control_foundation: (projectData as any).ceramic_eval_control_foundation || '',
      ceramic_eval_risk_identification: (projectData as any).ceramic_eval_risk_identification || '',
      ceramic_eval_risk_process: (projectData as any).ceramic_eval_risk_process || '',
      ceramic_eval_communication_support: (projectData as any).ceramic_eval_communication_support || '',
      ceramic_eval_monitoring_process: (projectData as any).ceramic_eval_monitoring_process || '',
      it_plan_to_rely_on_automated_controls: (projectData as any).it_plan_to_rely_on_automated_controls || '',
      it_plan_benchmarking_strategy: (projectData as any).it_plan_benchmarking_strategy || '',
      it_key_members_inquired: (projectData as any).it_key_members_inquired || '',
      it_interviewees: (projectData as any).it_interviewees || [],
      it_systems_layers: (projectData as any).it_systems_layers || [],
      it_systems_documentation: (projectData as any).it_systems_documentation || '',
      it_attach_documentation: (projectData as any).it_attach_documentation || false,
      it_documentation_details: (projectData as any).it_documentation_details || '',
      it_service_organizations_used: (projectData as any).it_service_organizations_used || false,
      it_service_organizations: (projectData as any).it_service_organizations || [],
      it_new_accounting_software: (projectData as any).it_new_accounting_software || '',
      it_software_effects_description: (projectData as any).it_software_effects_description || '',
      it_processes_understanding: (projectData as any).it_processes_understanding || '',
      it_processes_table: (projectData as any).it_processes_table || [],
      it_risk_assessment_procedures_text: (projectData as any).it_risk_assessment_procedures_text || '',
      it_risk_assessment_procedures: (projectData as any).it_risk_assessment_procedures || [],
      it_information_used_risk_assessment: (projectData as any).it_information_used_risk_assessment || '',
      cybersecurity_risks_understanding: (projectData as any).cybersecurity_risks_understanding || '',
      cybersecurity_incident_awareness: (projectData as any).cybersecurity_incident_awareness || '',
      cybersecurity_bec_risks_understanding: (projectData as any).cybersecurity_bec_risks_understanding || '',
      cybersecurity_additional_inquiries: (projectData as any).cybersecurity_additional_inquiries || false,
      cybersecurity_additional_inquiries_details: (projectData as any).cybersecurity_additional_inquiries_details || '',
      cybersecurity_incidents_experienced: (projectData as any).cybersecurity_incidents_experienced || '',
      cybersecurity_risks_rmm: (projectData as any).cybersecurity_risks_rmm || '',

      // Business processes
      selected_business_processes: (projectData as any).selected_business_processes || [],
      entity_has_material_inventory: (projectData as any).entity_has_material_inventory || '',
      confirm_inventory_workpaper: (projectData as any).confirm_inventory_workpaper || false,
      
      // TOE fields (with defaults)
      comptesAPouvoir_design_procedures_table: (projectData as any).comptesAPouvoir_design_procedures_table || [],
      
      // Fraud Risk Assessment fields (with defaults)
      fraud_risk_financial: (projectData as any).fraud_risk_financial || [],
      fraud_risk_management: (projectData as any).fraud_risk_management || [],
      fraud_risk_other_management: (projectData as any).fraud_risk_other_management || [],
      fraud_risk_other_internal: (projectData as any).fraud_risk_other_internal || [],
      fraud_risk_external: (projectData as any).fraud_risk_external || [],
      fraud_risk_misappropriation: (projectData as any).fraud_risk_misappropriation || [],
      fraud_risk_other_factors: (projectData as any).fraud_risk_other_factors || [],
      fraud_risk_summary: (projectData as any).fraud_risk_summary || '',
      fraud_assertion_level: (projectData as any).fraud_assertion_level || [],
      fraud_financial_statement: (projectData as any).fraud_financial_statement || [],
      revenue_recognition_fraud_risk: (projectData as any).revenue_recognition_fraud_risk || '',
      revenue_recognition_identified: (projectData as any).revenue_recognition_identified || '',
      overall_fraud_response: (projectData as any).overall_fraud_response || '',
      
      reviews: (projectData as any).reviews || {},
      signoffs: (projectData as any).signoffs || {},
    });
  };

  const handleSave = async () => {
    if (!projectId) return;
    
    setSaving(true);
    try {
      const updateData = {
        ...formData,
        period_start: new Date(formData.period_start),
        period_end: new Date(formData.period_end),
        expected_start_date: new Date(formData.expected_start_date),
      };

      await updateDoc(doc(db, 'projects', projectId), updateData);
      
      // Log the project update
      await logProjectAction.update(projectId, `Project ${formData.engagement_name} updated`);
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignmentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormDataChange = (updates: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleReview = async (sectionId: string) => {
    if (!projectId || !user) return;

    const currentLevel = getCurrentReviewLevel(sectionId, formData);
    const userRole = getProjectRole(user, formData);
    
    if (!userRole || userRole !== currentLevel) {
      toast({
        title: 'Error',
        description: 'You cannot review this section at this time',
        variant: 'destructive',
      });
      return;
    }

    const reviewData = {
      user_id: user.id,
      reviewed_at: new Date().toISOString(),
      user_name: `${user.first_name} ${user.last_name}`
    };

    const existingReviews = formData.reviews?.[sectionId] || {
      staff_reviews: [],
      incharge_reviews: [],
      manager_reviews: [],
      partner_reviews: [],
      lead_partner_reviews: [],
      status: 'not_reviewed',
      current_review_level: 'staff'
    };

    const roleKey = `${userRole}_reviews` as keyof typeof existingReviews;
    const updatedReviews = {
      ...existingReviews,
      [roleKey]: [...(existingReviews[roleKey] as any[]), reviewData]
    };

    // Update status and current level
    updatedReviews.current_review_level = getNextReviewLevel(userRole) as any;
    updatedReviews.status = updatedReviews.current_review_level === 'completed' ? 'reviewed' : 'ready_for_review';

    // Update local state
    setFormData(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [sectionId]: updatedReviews
      }
    }));

    // Update database immediately
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        [`reviews.${sectionId}`]: updatedReviews
      });
      
      await logProjectAction.update(projectId, `Section ${sectionId} reviewed by ${userRole}`);
      
      toast({
        title: 'Success',
        description: 'Section reviewed successfully',
      });
    } catch (error) {
      console.error('Error reviewing section:', error);
      toast({
        title: 'Error',
        description: 'Failed to review section',
        variant: 'destructive',
      });
    }
  };

  const handleUnreview = async (sectionId: string) => {
    if (!projectId || !user) return;

    const userRole = getProjectRole(user, formData);
    const canUnreview = isDevOrAdmin(user) || userRole;

    if (!canUnreview) {
      toast({
        title: 'Error',
        description: 'You cannot unreview this section',
        variant: 'destructive',
      });
      return;
    }

    const existingReviews = formData.reviews?.[sectionId];
    if (!existingReviews) return;

    // Reset reviews from the user's level and above
    const roleHierarchy = ['staff', 'incharge', 'manager', 'partner', 'lead_partner'];
    const userRoleIndex = roleHierarchy.indexOf(userRole || '');
    
    const updatedReviews = { ...existingReviews };
    
    // Clear reviews from user's level and higher
    for (let i = userRoleIndex; i < roleHierarchy.length; i++) {
      const roleKey = `${roleHierarchy[i]}_reviews` as keyof typeof updatedReviews;
      (updatedReviews as any)[roleKey] = [];
    }

    // Recalculate status and current level
    const newCurrentLevel = getCurrentReviewLevel(sectionId, { ...formData, reviews: { ...formData.reviews, [sectionId]: updatedReviews } });
    updatedReviews.current_review_level = newCurrentLevel as any;
    updatedReviews.status = newCurrentLevel === 'completed' ? 'reviewed' : 
                           newCurrentLevel === 'staff' ? 'not_reviewed' : 'ready_for_review';

    // Update local state
    setFormData(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [sectionId]: updatedReviews
      }
    }));

    // Update database immediately
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        [`reviews.${sectionId}`]: updatedReviews
      });
      
      await logProjectAction.update(projectId, `Section ${sectionId} unreviewed by ${userRole}`);
      
      toast({
        title: 'Success',
        description: 'Section unreviewed successfully',
      });
    } catch (error) {
      console.error('Error unreviewing section:', error);
      toast({
        title: 'Error',
        description: 'Failed to unreview section',
        variant: 'destructive',
      });
    }
  };

  // Legacy sign off handlers (kept for backward compatibility)
  const handleSignOff = async (sectionId: string, userId: string) => {
    if (!projectId) return;

    const signOffData = {
      signed: true,
      signedBy: userId,
      signedAt: new Date().toISOString()
    };

    // Update local state
    setFormData(prev => ({
      ...prev,
      signoffs: {
        ...prev.signoffs,
        [sectionId]: signOffData
      }
    }));

    // Update database immediately
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        [`signoffs.${sectionId}`]: signOffData
      });
      
      await logProjectAction.update(projectId, `Section ${sectionId} signed off`);
      
      toast({
        title: 'Success',
        description: 'Section signed off successfully',
      });
    } catch (error) {
      console.error('Error signing off section:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign off section',
        variant: 'destructive',
      });
    }
  };

  const handleUnsign = async (sectionId: string) => {
    if (!projectId) return;

    // Update local state
    setFormData(prev => ({
      ...prev,
      signoffs: {
        ...prev.signoffs,
        [sectionId]: { signed: false }
      }
    }));

    // Update database immediately
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        [`signoffs.${sectionId}`]: { signed: false }
      });
      
      await logProjectAction.update(projectId, `Section ${sectionId} unsigned`);
      
      toast({
        title: 'Success',
        description: 'Section unsigned successfully',
      });
    } catch (error) {
      console.error('Error unsigning section:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsign section',
        variant: 'destructive',
      });
    }
  };

  return {
    formData,
    saving,
    handleSave,
    handleAssignmentChange,
    handleFormDataChange,
    handleReview,
    handleUnreview,
    handleSignOff,
    handleUnsign,
    initializeFormData,
    setFormData
  };
};

// Helper function to get next review level
function getNextReviewLevel(currentRole: string): string {
  const roleSequence: { [key: string]: string } = {
    staff: 'incharge',
    incharge: 'manager',
    manager: 'partner',
    partner: 'lead_partner',
    lead_partner: 'completed'
  };
  
  return roleSequence[currentRole] || 'completed';
}
