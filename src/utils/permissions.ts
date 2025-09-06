import { User, Project } from '@/types';
import { ProjectFormData } from '@/types/formData';

export function isDev(user: User | null): boolean {
  return user?.role === 'dev';
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function isDevOrAdmin(user: User | null): boolean {
  return isDev(user) || isAdmin(user);
}

export function getProjectRole(user: User | null, formData: ProjectFormData): string | null {
  if (!user) return null;
  
  const userId = user.id;
  const teamAssignments = formData.team_assignments;
  
  if (formData.lead_developer_id === userId) return 'lead_developer';
  if (teamAssignments.lead_partner_id === userId) return 'lead_partner';
  if (teamAssignments.partner_ids.includes(userId)) return 'partner';
  if (teamAssignments.manager_ids.includes(userId)) return 'manager';
  if (teamAssignments.in_charge_ids.includes(userId)) return 'in_charge';
  if (teamAssignments.staff_ids.includes(userId)) return 'staff';
  
  return null;
}

export function isStaffUp(projectRole: string | null): boolean {
  const staffUpRoles = ['staff', 'in_charge', 'manager', 'partner', 'lead_partner', 'lead_developer'];
  return projectRole ? staffUpRoles.includes(projectRole) : false;
}

export function isInChargeUp(projectRole: string | null): boolean {
  const inChargeUpRoles = ['in_charge', 'manager', 'partner', 'lead_partner', 'lead_developer'];
  return projectRole ? inChargeUpRoles.includes(projectRole) : false;
}

export function isManagerUp(projectRole: string | null): boolean {
  const managerUpRoles = ['manager', 'partner', 'lead_partner', 'lead_developer'];
  return projectRole ? managerUpRoles.includes(projectRole) : false;
}

export function canEditProject(user: User | null, formData: ProjectFormData): boolean {
  // Developers and admins can always edit
  if (isDevOrAdmin(user)) return true;
  
  // Project team members with staff role and up can edit
  const projectRole = getProjectRole(user, formData);
  return isStaffUp(projectRole);
}

export function canSignOffSection(user: User | null, formData: ProjectFormData, signOffLevel: 'incharge' | 'manager'): boolean {
  // Developers and admins can always sign off
  if (isDevOrAdmin(user)) return true;
  
  const projectRole = getProjectRole(user, formData);
  
  if (signOffLevel === 'incharge') {
    return isInChargeUp(projectRole);
  } else if (signOffLevel === 'manager') {
    return isManagerUp(projectRole);
  }
  
  return false;
}

export function canViewTeamManagement(user: User | null): boolean {
  return isDev(user);
}