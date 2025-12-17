import React, { createContext, useContext, useState, useCallback } from 'react';

interface CommentsContextType {
  activeSection: string;
  onCreateComment: (fieldId: string, sectionId: string, fieldLabel?: string) => void;
  getFieldCommentCount: (sectionId: string, fieldId: string) => number;
}

const CommentsContext = createContext<CommentsContextType | null>(null);

export const useCommentsContext = () => {
  const context = useContext(CommentsContext);
  // Return a default context if not provided (for components used outside of project edit)
  if (!context) {
    return {
      activeSection: '',
      onCreateComment: () => {},
      getFieldCommentCount: () => 0,
    };
  }
  return context;
};

interface CommentsProviderProps {
  children: React.ReactNode;
  activeSection: string;
  onCreateComment: (fieldId: string, sectionId: string, fieldLabel?: string) => void;
  getFieldCommentCount: (sectionId: string, fieldId: string) => number;
}

export const CommentsProvider: React.FC<CommentsProviderProps> = ({
  children,
  activeSection,
  onCreateComment,
  getFieldCommentCount,
}) => {
  return (
    <CommentsContext.Provider value={{ activeSection, onCreateComment, getFieldCommentCount }}>
      {children}
    </CommentsContext.Provider>
  );
};
