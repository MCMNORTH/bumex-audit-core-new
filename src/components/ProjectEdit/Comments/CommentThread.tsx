import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Reply, CheckCircle, Circle } from 'lucide-react';
import { Comment, User } from '@/types';
import CommentForm from './CommentForm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  users: User[];
  currentUserId: string;
  teamMembers: User[];
  onReply: (parentId: string, content: string, addressedTo: string | null) => Promise<void>;
  onMarkResolved: (commentId: string, resolved: boolean) => Promise<void>;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  replies,
  users,
  currentUserId,
  teamMembers,
  onReply,
  onMarkResolved,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const author = users.find(u => u.id === comment.author_id);
  const addressedUser = comment.addressed_to ? users.find(u => u.id === comment.addressed_to) : null;

  const getInitials = (user: User | undefined) => {
    if (!user) return '?';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || '?';
  };

  const handleReplySubmit = async (content: string, addressedTo: string | null) => {
    await onReply(comment.id, content, addressedTo);
    setShowReplyForm(false);
  };

  const canMarkResolved = comment.addressed_to === currentUserId || comment.author_id === currentUserId;

  return (
    <div className={`rounded-lg border border-border p-3 ${comment.resolved ? 'opacity-60 bg-muted/30' : 'bg-card'}`}>
      {/* Main comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(author)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">
              {author ? `${author.first_name} ${author.last_name}` : 'Unknown'}
            </span>
            {addressedUser && (
              <span className="text-xs text-muted-foreground">
                → {addressedUser.first_name} {addressedUser.last_name}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{comment.content}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            
            {canMarkResolved && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onMarkResolved(comment.id, !comment.resolved)}
              >
                {comment.resolved ? (
                  <>
                    <Circle className="h-3 w-3 mr-1" />
                    Reopen
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-8 mt-3 space-y-3 border-l-2 border-border pl-3">
          {replies.map(reply => {
            const replyAuthor = users.find(u => u.id === reply.author_id);
            const replyAddressedUser = reply.addressed_to ? users.find(u => u.id === reply.addressed_to) : null;
            
            return (
              <div key={reply.id} className="flex gap-2">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                    {getInitials(replyAuthor)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-xs text-foreground">
                      {replyAuthor ? `${replyAuthor.first_name} ${replyAuthor.last_name}` : 'Unknown'}
                    </span>
                    {replyAddressedUser && (
                      <span className="text-xs text-muted-foreground">
                        → {replyAddressedUser.first_name} {replyAddressedUser.last_name}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply form */}
      {showReplyForm && (
        <div className="ml-8 mt-3">
          <CommentForm
            teamMembers={teamMembers}
            onSubmit={handleReplySubmit}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
            compact
          />
        </div>
      )}
    </div>
  );
};

export default CommentThread;
