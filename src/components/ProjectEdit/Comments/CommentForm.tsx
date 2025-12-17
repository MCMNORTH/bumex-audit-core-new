import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CommentFormProps {
  teamMembers: User[];
  onSubmit: (content: string, addressedTo: string | null) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  teamMembers,
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  compact = false,
}) => {
  const [content, setContent] = useState('');
  const [addressedTo, setAddressedTo] = useState<string>('none');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setSubmitting(true);
    try {
      await onSubmit(content.trim(), addressedTo === 'none' ? null : addressedTo);
      setContent('');
      setAddressedTo('none');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`resize-none bg-background ${compact ? 'min-h-[60px]' : 'min-h-[80px]'}`}
        disabled={submitting}
      />
      
      <div className="flex items-center gap-2">
        <Select value={addressedTo} onValueChange={setAddressedTo}>
          <SelectTrigger className={`bg-background ${compact ? 'flex-1' : 'w-48'}`}>
            <SelectValue placeholder="Address to..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-[60]">
            <SelectItem value="none">No one specific</SelectItem>
            {teamMembers.map(member => (
              <SelectItem key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2 ml-auto">
          {onCancel && (
            <Button
              variant="ghost"
              size={compact ? 'sm' : 'default'}
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button
            size={compact ? 'sm' : 'default'}
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
          >
            <Send className="h-4 w-4 mr-1" />
            {submitting ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
