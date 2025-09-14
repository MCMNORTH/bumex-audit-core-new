import React from 'react';
import ReviewBar from './ReviewBar';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { getSectionReviewStatus } from '@/utils/permissions';

interface SectionWrapperProps {
  sectionId: string;
  children: React.ReactNode;
  formData: ProjectFormData;
  users: User[];
  currentUser: User | null;
  signOffLevel: 'incharge' | 'manager';
  onReview: (sectionId: string) => void;
  onUnreview: (sectionId: string, role: string, userId: string) => void;
  sidebarSections?: any[]; // For hierarchical checking
}

// Utility function to check if all descendants of a section are reviewed
const areAllDescendantsReviewed = (sectionId: string, sidebarSections: any[], formData: ProjectFormData): boolean => {
  const findSectionInHierarchy = (sections: any[], targetId: string): any => {
    for (const section of sections) {
      if (section.id === targetId) return section;
      if (section.children) {
        const found = findSectionInHierarchy(section.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const section = findSectionInHierarchy(sidebarSections || [], sectionId);
  if (!section || !section.children || section.children.length === 0) {
    return true; // Leaf sections are always "ready" for review
  }

  // Check if all immediate children are reviewed AND all their descendants
  return section.children.every((child: any) => {
    const isChildReviewed = child.signOffLevel ? getSectionReviewStatus(child.id, formData) === 'reviewed' : true;
    const areChildDescendantsReviewed = areAllDescendantsReviewed(child.id, sidebarSections || [], formData);
    return isChildReviewed && areChildDescendantsReviewed;
  });
};

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  sectionId,
  children,
  formData,
  users,
  currentUser,
  signOffLevel,
  onReview,
  onUnreview,
  sidebarSections = []
}) => {
  const reviewStatus = getSectionReviewStatus(sectionId, formData);
  
  // Check if all descendants are reviewed (for hierarchical review)
  const areDescendantsReviewed = areAllDescendantsReviewed(sectionId, sidebarSections, formData);
  
  // Only show review bar if all descendants are reviewed
  const showReview = areDescendantsReviewed;
  
  return (
    <div>
      {showReview && (
        <ReviewBar
          sectionId={sectionId}
          formData={formData}
          users={users}
          currentUser={currentUser}
          onReview={onReview}
          onUnreview={onUnreview}
        />
      )}
      
      <div className={reviewStatus === 'reviewed' ? 'relative' : ''}>
        {reviewStatus === 'reviewed' && (
          <div className="absolute inset-0 bg-gray-50/30 z-10 rounded-lg pointer-events-none" />
        )}
        <div className={reviewStatus === 'reviewed' ? 'relative' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionWrapper;