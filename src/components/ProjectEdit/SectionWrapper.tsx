import React from 'react';
import SignOffBar from './SignOffBar';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { canSignOffSection } from '@/utils/permissions';

interface SectionWrapperProps {
  sectionId: string;
  children: React.ReactNode;
  formData: ProjectFormData;
  users: User[];
  currentUser: User | null;
  signOffLevel: 'incharge' | 'manager';
  onSignOff: (sectionId: string) => void;
  onUnsign: (sectionId: string) => void;
  sidebarSections?: any[]; // For hierarchical checking
}

// Utility function to check if all descendants of a section are signed off
const areAllDescendantsSignedOff = (sectionId: string, sidebarSections: any[], formData: ProjectFormData): boolean => {
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
    return true; // Leaf sections are always "ready" for sign-off
  }

  // Check if all immediate children are signed off AND all their descendants
  return section.children.every((child: any) => {
    const isChildSignedOff = child.signOffLevel ? formData.signoffs?.[child.id]?.signed || false : true;
    const areChildDescendantsSignedOff = areAllDescendantsSignedOff(child.id, sidebarSections || [], formData);
    return isChildSignedOff && areChildDescendantsSignedOff;
  });
};

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  sectionId,
  children,
  formData,
  users,
  currentUser,
  signOffLevel,
  onSignOff,
  onUnsign,
  sidebarSections = []
}) => {
  const signOffData = formData.signoffs?.[sectionId] || { signed: false };
  const canSignOff = canSignOffSection(currentUser, formData, signOffLevel);
  const canUnsign = canSignOff; // Same permission for unsigning
  
  // Check if all descendants are signed off (for hierarchical sign-off)
  const areDescendantsSignedOff = areAllDescendantsSignedOff(sectionId, sidebarSections, formData);
  
  // Only show sign-off if all descendants are signed off
  const showSignOff = areDescendantsSignedOff;
  
  return (
    <div>
      {showSignOff && (
        <SignOffBar
          sectionId={sectionId}
          signOffData={signOffData}
          users={users}
          canSignOff={canSignOff}
          canUnsign={canUnsign}
          onSignOff={onSignOff}
          onUnsign={onUnsign}
          signOffLevel={signOffLevel}
        />
      )}
      
      <div className={signOffData.signed ? 'relative' : ''}>
        {signOffData.signed && (
          <div className="absolute inset-0 bg-gray-50/30 z-10 rounded-lg pointer-events-none" />
        )}
        <div className={signOffData.signed ? 'relative' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionWrapper;