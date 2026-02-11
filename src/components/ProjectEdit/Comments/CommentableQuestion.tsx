import React, { useState } from 'react';
import { MoreHorizontal, MessageSquare } from 'lucide-react';
import { useCommentsContext } from '@/contexts/CommentsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentableQuestionProps {
  fieldId: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
}

const CommentableQuestion: React.FC<CommentableQuestionProps> = ({
  fieldId,
  label,
  children,
  className = '',
}) => {
  const { activeSection, onCreateComment, getFieldCommentCount } = useCommentsContext();
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const commentCount = getFieldCommentCount(activeSection, fieldId);

  const handleCreateComment = () => {
    onCreateComment(fieldId, activeSection, label || fieldId);
  };

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!menuOpen) setIsHovered(false);
      }}
    >
      {children}
      
      {/* Comment indicator badge */}
      {commentCount > 0 && (
        <button
          onClick={handleCreateComment}
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 min-w-5 px-1 flex items-center justify-center z-10 hover:bg-primary/90 transition-colors"
        >
          <MessageSquare className="h-3 w-3 mr-0.5" />
          {commentCount}
        </button>
      )}
      
      {/* 3-dot menu button */}
      {(isHovered || menuOpen) && !commentCount && (
        <div className="absolute top-0 right-0 z-20">
          <DropdownMenu onOpenChange={(open) => {
            setMenuOpen(open);
            if (!open) setIsHovered(false);
          }}>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-md bg-muted/80 hover:bg-muted transition-colors shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
              <DropdownMenuItem 
                onClick={handleCreateComment}
                className="flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Create a comment</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default CommentableQuestion;
