
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'dev' | 'partner' | 'manager' | 'incharge' | 'staff';
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
  assigned_to: string[];
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
