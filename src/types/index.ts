
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
