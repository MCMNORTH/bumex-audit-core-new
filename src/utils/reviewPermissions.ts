import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { getProjectRole, isDevOrAdmin } from './permissions';

// Check if a user can unreview a specific review entry
export function canUnreviewSpecific(
  user: User | null, 
  formData: ProjectFormData, 
  reviewRole: string,
  reviewUserId: string
): boolean {
  if (!user) return false;
  
  // Dev/admin can unreview anything
  if (isDevOrAdmin(user)) return true;
  
  // Users can unreview their own reviews
  if (user.id === reviewUserId) return false; // Lower roles can't unreview themselves
  
  const userProjectRole = getProjectRole(user, formData);
  if (!userProjectRole) return false;
  
  // Only higher roles can unreview lower roles
  const roleHierarchy = ['staff', 'in_charge', 'manager', 'partner', 'lead_partner'];
  const userRoleIndex = roleHierarchy.indexOf(userProjectRole);
  const reviewRoleIndex = roleHierarchy.indexOf(reviewRole);
  
  return userRoleIndex > reviewRoleIndex;
}

// Get all review entries for a section sorted by date (newest first)
export function getAllSectionReviews(sectionId: string, formData: ProjectFormData) {
  const sectionReviews = formData.reviews?.[sectionId];
  if (!sectionReviews) return [];

  const allReviews: Array<{
    role: string;
    user_id: string;
    user_name: string;
    reviewed_at: string;
  }> = [];

  // Collect all reviews from all roles
  const roles = ['staff', 'incharge', 'manager', 'partner', 'lead_partner'];
  
  roles.forEach(role => {
    const roleKey = `${role}_reviews` as keyof typeof sectionReviews;
    const roleReviews = sectionReviews[roleKey] as Array<{
      user_id: string;
      user_name: string;
      reviewed_at: string;
    }>;
    
    roleReviews.forEach(review => {
      allReviews.push({
        role,
        user_id: review.user_id,
        user_name: review.user_name,
        reviewed_at: review.reviewed_at
      });
    });
  });

  // Sort by date (newest first)
  return allReviews.sort((a, b) => 
    new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime()
  );
}