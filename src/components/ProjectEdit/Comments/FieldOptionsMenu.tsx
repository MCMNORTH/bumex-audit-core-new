import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FieldOptionsMenuProps {
  children: React.ReactNode;
  onCreateComment: () => void;
  onOpenChange?: (open: boolean) => void;
}

const FieldOptionsMenu: React.FC<FieldOptionsMenuProps> = ({
  children,
  onCreateComment,
  onOpenChange,
}) => {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
        <DropdownMenuItem 
          onClick={onCreateComment}
          className="flex items-center gap-2 cursor-pointer"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>Create a comment</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FieldOptionsMenu;
