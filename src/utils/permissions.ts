import { User, Project } from '@/types';
import { ProjectFormData } from '@/types/formData';

export function isDev(user: User | null): boolean {
  return user?.role === 'dev';
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function isSemiAdmin(user: User | null): boolean {
  return user?.role === 'semi-admin';
}

export function isDevOrAdmin(user: User | null): boolean {
  return isDev(user) || isAdmin(user);
}

export function isPrivilegedUser(user: User | null): boolean {
  return isDev(user) || isAdmin(user) || isSemiAdmin(user);
}

export function isProjectMember(user: User | null, formData: ProjectFormData): boolean {
  if (!user) return false;
  
  const userId = user.id;
  const memberIds = formData.member_ids || [];
  
  return memberIds.includes(userId) || formData.lead_developer_id === userId;
}

export function getProjectRole(user: User | null, formData: ProjectFormData): string | null {
  if (!user) return null;
  
  const userId = user.id;
  const teamAssignments = formData.team_assignments || {
    lead_partner_id: '',
    partner_ids: [],
    manager_ids: [],
    in_charge_ids: [],
    staff_ids: [],
  };
  
  if (formData.lead_developer_id === userId) return 'lead_developer';
  if (teamAssignments.lead_partner_id === userId) return 'lead_partner';
  if (teamAssignments.partner_ids && teamAssignments.partner_ids.includes(userId)) return 'partner';
  if (teamAssignments.manager_ids && teamAssignments.manager_ids.includes(userId)) return 'manager';
  if (teamAssignments.in_charge_ids && teamAssignments.in_charge_ids.includes(userId)) return 'in_charge';
  if (teamAssignments.staff_ids && teamAssignments.staff_ids.includes(userId)) return 'staff';
  
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
  // Privileged users can always edit
  if (isPrivilegedUser(user)) return true;
  
  // Project team members with staff role and up can edit
  const projectRole = getProjectRole(user, formData);
  return isStaffUp(projectRole);
}

export function canViewProject(user: User | null, formData: ProjectFormData): boolean {
  // Privileged users can view all projects
  if (isPrivilegedUser(user)) return true;
  
  // Project members can view their projects
  return isProjectMember(user, formData);
}

export function getRequiredReviewRoles(sectionId: string, sidebarSections: any[]): string[] {
  const findSection = (sections: any[], targetId: string): any => {
    for (const section of sections) {
      if (section.id === targetId) return section;
      if (section.children) {
        const found = findSection(section.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const section = findSection(sidebarSections, sectionId);
  const signOffLevel = section?.signOffLevel || 'incharge';
  
  if (signOffLevel === 'manager') {
    return ['staff', 'incharge', 'manager', 'partner', 'lead_partner'];
  } else {
    return ['staff', 'incharge', 'manager', 'partner', 'lead_partner'];
  }
}

export function getCurrentReviewLevel(sectionId: string, formData: ProjectFormData): string {
  const sectionReviews = formData.reviews?.[sectionId];
  if (!sectionReviews) return 'pending';

  // Check if all roles have reviewed
  if (sectionReviews.lead_partner_reviews.length > 0 &&
      sectionReviews.partner_reviews.length > 0 &&
      sectionReviews.manager_reviews.length > 0 &&
      sectionReviews.incharge_reviews.length > 0 &&
      sectionReviews.staff_reviews.length > 0) {
    return 'completed';
  }
  
  return 'in_progress';
}

export function canUserReviewSection(user: User | null, formData: ProjectFormData, sectionId: string): boolean {
  if (!user) return false;
  if (isDevOrAdmin(user)) return true;

  const userRole = getProjectRole(user, formData);
  if (!userRole || userRole === 'lead_developer') return false;

  // Any role can review at any time - no sequential restriction
  const validReviewRoles = ['staff', 'in_charge', 'manager', 'partner', 'lead_partner'];
  return validReviewRoles.includes(userRole);
}

export function getSectionReviewStatus(sectionId: string, formData: ProjectFormData): 'not_reviewed' | 'ready_for_review' | 'reviewed' {
  const sectionReviews = formData.reviews?.[sectionId];
  if (!sectionReviews) return 'not_reviewed';

  if (sectionReviews.lead_partner_reviews.length > 0) return 'reviewed';
  if (sectionReviews.staff_reviews.length > 0 || 
      sectionReviews.incharge_reviews.length > 0 || 
      sectionReviews.manager_reviews.length > 0 || 
      sectionReviews.partner_reviews.length > 0) {
    return 'ready_for_review';
  }
  
  return 'not_reviewed';
}

export function getCompletedReviewRoles(sectionId: string, formData: ProjectFormData): string[] {
  const sectionReviews = formData.reviews?.[sectionId];
  if (!sectionReviews) return [];

  const completed: string[] = [];
  if (sectionReviews.staff_reviews.length > 0) completed.push('staff');
  if (sectionReviews.incharge_reviews.length > 0) completed.push('incharge');
  if (sectionReviews.manager_reviews.length > 0) completed.push('manager');
  if (sectionReviews.partner_reviews.length > 0) completed.push('partner');
  if (sectionReviews.lead_partner_reviews.length > 0) completed.push('lead_partner');
  
  return completed;
}

export function getPendingReviewRoles(sectionId: string, formData: ProjectFormData): string[] {
  const completed = getCompletedReviewRoles(sectionId, formData);
  const allRoles = ['staff', 'incharge', 'manager', 'partner', 'lead_partner'];
  
  return allRoles.filter(role => !completed.includes(role));
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

export function canManageUsers(user: User | null): boolean {
  return isDevOrAdmin(user);
}

export function canManageClients(user: User | null): boolean {
  return isPrivilegedUser(user);
}

export function canViewTeamManagement(user: User | null): boolean {
  return isDev(user);
}

export function getSectionReviewIndicator(
  sectionId: string, 
  formData: ProjectFormData, 
  user: User | null
): 'grey' | 'orange' | 'blue' | 'green' {
  if (!user) return 'grey';
  
  const userRole = getProjectRole(user, formData);
  const sectionReviews = formData.reviews?.[sectionId];
  
  if (!sectionReviews) return 'grey';
  
  // Green dot: All roles have reviewed (completed)
  if (sectionReviews.lead_partner_reviews.length > 0 &&
      sectionReviews.partner_reviews.length > 0 &&
      sectionReviews.manager_reviews.length > 0 &&
      sectionReviews.incharge_reviews.length > 0 &&
      sectionReviews.staff_reviews.length > 0) {
    return 'green';
  }
  
  // Check if user's role has reviewed
  const userHasReviewed = (() => {
    switch (userRole) {
      case 'staff': return sectionReviews.staff_reviews.length > 0;
      case 'in_charge': return sectionReviews.incharge_reviews.length > 0;
      case 'manager': return sectionReviews.manager_reviews.length > 0;
      case 'partner': return sectionReviews.partner_reviews.length > 0;
      case 'lead_partner': return sectionReviews.lead_partner_reviews.length > 0;
      default: return false;
    }
  })();
  
  // Blue dot: Reviewed by user's role
  if (userHasReviewed) return 'blue';
  
  // Orange dot: Can review but hasn't yet
  if (canUserReviewSection(user, formData, sectionId)) return 'orange';
  
  // Grey dot: Cannot review or no reviews yet
  return 'grey';
}