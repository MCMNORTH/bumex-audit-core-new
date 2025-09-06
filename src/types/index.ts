export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'dev' | 'admin' | 'semi-admin' | 'users';
  approved?: boolean;
  blocked?: boolean;
  created_at?: Date;
}

export interface Client {
  id: string;
  name: string;
  client_id?: string;
  country: string;
  sector: string;
  contact_email: string;
  created_at: Date;
}

export interface Project {
  id: string;
  client_id: string;
  engagement_name: string;
  engagement_id: string;
  project_id?: string;
  lead_developer_id: string;
  team_assignments?: {
    lead_partner_id?: string;
    partner_id?: string;
    manager_id?: string;
    in_charge_id?: string;
    staff_id?: string;
  };
  assigned_to: string[]; // Deprecated but kept for backward compatibility
  status: 'new' | 'inprogress' | 'closed' | 'archived';
  period_start: Date;
  period_end: Date;
  audit_type: string;
  jurisdiction: string;
  bumex_office?: string;
  language: string;
  is_first_audit: boolean;
  created_by: string;
  created_at: Date;
  // Engagement evaluation fields
  engagement_evaluation_id?: string;
  engagement_evaluation_status?: string;
  evaluation_approval_date?: string;
  planned_expiration_date?: string;
  // Sentinel approval fields
  sentinel_approval_number?: string;
  sentinel_approval_status?: string;
  sentinel_approval_date?: string;
  sentinel_expiration_date?: string;
  // Radio button field
  first_period_auditing?: string;
  // Document attachment fields
  sentinel_approval_email_files?: string[];
  ceac_approval_email_files?: string[];
  other_documents_files?: string[];
  // Engagement scope and scale fields
  financial_statement_audit_report?: boolean;
  auditing_standards?: string[];
  financial_reporting_framework?: string[];
  audit_report_date?: string;
  required_audit_file_closeout_date?: string;
  // New component reporting and reviewer fields
  component_reporting?: boolean;
  component_reporting_details?: string;
  group_auditor?: boolean;
  engagement_quality_control_reviewer?: boolean;
  limited_scope_quality_control_reviewer?: boolean;
  other_reviewer?: boolean;
  governance_management_same_persons?: boolean;
  entity_has_internal_audit_function?: boolean;
  // New involvement of others fields
  entity_uses_service_organization?: boolean;
  plan_to_involve_specialists?: boolean;
  specialist_teams?: Array<{
    id: string;
    description: string;
    name: string;
    title: string;
  }>;
  // IT environment fields
  entity_highly_dependent_on_it?: string;
  plan_to_rely_on_automated_controls?: string;
  use_it_critically_checklist?: boolean;
  // Engagement team fields
  sufficient_appropriate_resources?: boolean;
  team_competence_and_capabilities?: boolean;
  // Direction and supervision field
  direction_supervision_documentation?: string;
  // Other strategy or planning considerations fields
  significant_factors_directing_activities?: string;
  additional_information_documentation?: string;
}

export interface Log {
  id: string;
  user_id: string;
  action: string;
  target_id: string;
  timestamp: Date;
  details?: string;
}

export interface AppControl {
  maintenance_mode: boolean;
  maintenance_message: string;
  force_update: boolean;
  current_version: string;
}
