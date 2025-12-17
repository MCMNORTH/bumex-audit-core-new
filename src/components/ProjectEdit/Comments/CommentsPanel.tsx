import React, { useState, useMemo } from 'react';
import { X, Filter } from 'lucide-react';
import { Comment, User } from '@/types';
import CommentThread from './CommentThread';
import CommentForm from './CommentForm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  users: User[];
  currentUserId: string;
  projectId: string;
  sectionId: string;
  fieldId?: string | null;
  fieldLabel?: string;
  teamMemberIds: string[];
  onCreateComment: (data: {
    project_id: string;
    section_id: string;
    field_id: string;
    parent_comment_id?: string | null;
    author_id: string;
    addressed_to?: string | null;
    content: string;
  }) => Promise<void>;
  onMarkResolved: (commentId: string, resolved: boolean) => Promise<void>;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  isOpen,
  onClose,
  comments,
  users,
  currentUserId,
  projectId,
  sectionId,
  fieldId,
  fieldLabel,
  teamMemberIds,
  onCreateComment,
  onMarkResolved,
}) => {
  const [filter, setFilter] = useState<'all' | 'addressed'>('all');
  const [showNewComment, setShowNewComment] = useState(!!fieldId);

  const teamMembers = useMemo(() => {
    return users.filter(u => teamMemberIds.includes(u.id));
  }, [users, teamMemberIds]);

  const filteredComments = useMemo(() => {
    let filtered = comments;
    
    // Filter by section
    filtered = filtered.filter(c => c.section_id === sectionId);
    
    // Filter by field if specified
    if (fieldId) {
      filtered = filtered.filter(c => c.field_id === fieldId);
    }
    
    // Filter by addressed to me
    if (filter === 'addressed') {
      filtered = filtered.filter(c => c.addressed_to === currentUserId);
    }
    
    // Get only top-level comments (threads)
    return filtered.filter(c => !c.parent_comment_id);
  }, [comments, sectionId, fieldId, filter, currentUserId]);

  const getReplies = (parentId: string) => {
    return comments.filter(c => c.parent_comment_id === parentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const handleSubmitComment = async (content: string, addressedTo: string | null) => {
    await onCreateComment({
      project_id: projectId,
      section_id: sectionId,
      field_id: fieldId || 'general',
      author_id: currentUserId,
      addressed_to: addressedTo,
      content,
    });
    if (!fieldId) {
      setShowNewComment(false);
    }
  };

  const handleReply = async (parentId: string, content: string, addressedTo: string | null) => {
    const parentComment = comments.find(c => c.id === parentId);
    await onCreateComment({
      project_id: projectId,
      section_id: sectionId,
      field_id: parentComment?.field_id || fieldId || 'general',
      parent_comment_id: parentId,
      author_id: currentUserId,
      addressed_to: addressedTo,
      content,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-semibold text-foreground">Comments</h2>
          {fieldLabel && (
            <p className="text-sm text-muted-foreground truncate">{fieldLabel}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('addressed')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            filter === 'addressed'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Addressed to me
        </button>
      </div>

      {/* Comments list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No comments yet</p>
            </div>
          ) : (
            filteredComments.map(comment => (
              <CommentThread
                key={comment.id}
                comment={comment}
                replies={getReplies(comment.id)}
                users={users}
                currentUserId={currentUserId}
                teamMembers={teamMembers}
                onReply={handleReply}
                onMarkResolved={onMarkResolved}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* New comment form */}
      <div className="border-t border-border p-4">
        {showNewComment || fieldId ? (
          <CommentForm
            teamMembers={teamMembers}
            onSubmit={handleSubmitComment}
            onCancel={fieldId ? undefined : () => setShowNewComment(false)}
            placeholder="Write a comment..."
          />
        ) : (
          <Button
            onClick={() => setShowNewComment(true)}
            className="w-full"
            variant="outline"
          >
            New Comment
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;
