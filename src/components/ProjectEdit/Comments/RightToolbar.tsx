import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RightToolbarProps {
  onOpenComments: () => void;
  commentCount?: number;
}

const RightToolbar: React.FC<RightToolbarProps> = ({
  onOpenComments,
  commentCount = 0,
}) => {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col bg-sidebar-background border-l border-sidebar-border shadow-lg rounded-l-lg">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenComments}
              className="relative p-3 hover:bg-sidebar-accent transition-colors rounded-l-lg"
            >
              <MessageSquare className="h-5 w-5 text-sidebar-foreground" />
              {commentCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {commentCount > 99 ? '99+' : commentCount}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Comments</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default RightToolbar;
