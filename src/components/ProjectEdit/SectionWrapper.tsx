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
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  sectionId,
  children,
  formData,
  users,
  currentUser,
  signOffLevel,
  onSignOff,
  onUnsign
}) => {
  const signOffData = formData.signoffs?.[sectionId] || { signed: false };
  const canSignOff = canSignOffSection(currentUser, formData, signOffLevel);
  const canUnsign = canSignOff; // Same permission for unsigning
  
  return (
    <div>
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
      
      <div className={signOffData.signed ? 'relative' : ''}>
        {signOffData.signed && (
          <div className="absolute inset-0 bg-gray-50/50 z-10 pointer-events-none rounded-lg" />
        )}
        <div className={signOffData.signed ? 'pointer-events-none opacity-70' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionWrapper;