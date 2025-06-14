
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/types';
import { ProjectFormData, getInitialFormData } from '@/types/formData';

export const useProjectForm = (project: Project | null, projectId?: string) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProjectFormData>(getInitialFormData());
  const [saving, setSaving] = useState(false);

  // Initialize form data from project
  const initializeFormData = (projectData: Project) => {
    setFormData({
      client_id: projectData.client_id,
      engagement_name: projectData.engagement_name,
      engagement_id: projectData.engagement_id,
      project_id: projectData.project_id || '',
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
      entity_highly_dependent_on_it: (projectData as any).entity_highly_dependent_on_it || 'Not selected',
      plan_to_rely_on_automated_controls: (projectData as any).plan_to_rely_on_automated_controls || 'Not selected',
      use_it_critically_checklist: (projectData as any).use_it_critically_checklist || false,
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

  return {
    formData,
    saving,
    handleSave,
    handleAssignmentChange,
    handleFormDataChange,
    initializeFormData,
    setFormData
  };
};
