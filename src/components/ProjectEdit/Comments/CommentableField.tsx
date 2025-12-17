import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import FieldOptionsMenu from './FieldOptionsMenu';

interface CommentableFieldProps {
  fieldId: string;
  sectionId: string;
  children: React.ReactNode;
  onCreateComment: (fieldId: string, sectionId: string) => void;
  commentCount?: number;
}

const CommentableField: React.FC<CommentableFieldProps> = ({
  fieldId,
  sectionId,
  children,
  onCreateComment,
  commentCount = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!menuOpen) setIsHovered(false);
      }}
    >
      {children}
      
      {/* Comment indicator badge */}
      {commentCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center z-10">
          {commentCount}
        </div>
      )}
      
      {/* 3-dot menu button */}
      {(isHovered || menuOpen) && (
        <div className="absolute top-1 right-1 z-20">
          <FieldOptionsMenu
            onCreateComment={() => onCreateComment(fieldId, sectionId)}
            onOpenChange={(open) => {
              setMenuOpen(open);
              if (!open) setIsHovered(false);
            }}
          >
            <button
              className="p-1 rounded hover:bg-muted transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </FieldOptionsMenu>
        </div>
      )}
    </div>
  );
};

export default CommentableField;
