import React from 'react';
import { MessageSquare, Users, ClipboardCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RightToolbarProps {
  onOpenComments: () => void;
  commentCount?: number;
  onNavigateToTeam?: () => void;
  onNavigateToSignOffs?: () => void;
  showTeamManagement?: boolean;
  activeSection?: string;
  teamMemberCount?: number;
  unsignedSectionsCount?: number;
  totalSectionsCount?: number;
}

const RightToolbar: React.FC<RightToolbarProps> = ({
  onOpenComments,
  commentCount = 0,
  onNavigateToTeam,
  onNavigateToSignOffs,
  showTeamManagement = false,
  activeSection,
  teamMemberCount = 0,
  unsignedSectionsCount = 0,
  totalSectionsCount = 0,
}) => {
  const signedCount = totalSectionsCount - unsignedSectionsCount;
  const allSigned = totalSectionsCount > 0 && unsignedSectionsCount === 0;
  return (
    <div className="fixed right-0 top-0 h-full z-40 flex flex-col bg-white border-l border-gray-200">
      <TooltipProvider>
        <div className="flex flex-col items-center py-4 gap-2">
          {/* Comments Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenComments}
                className="relative p-3 hover:bg-gray-100 transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-gray-600" />
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

          {/* Team Management Button - Only show for dev users */}
          {showTeamManagement && onNavigateToTeam && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onNavigateToTeam}
                  className={`relative p-3 transition-colors ${
                    activeSection === 'team-section' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  {teamMemberCount > 0 && (
                    <span className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs font-medium rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                      {teamMemberCount > 99 ? '99+' : teamMemberCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Team Management ({teamMemberCount} members)</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Project Sign-offs Button */}
          {onNavigateToSignOffs && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onNavigateToSignOffs}
                  className={`relative p-3 transition-colors ${
                    activeSection === 'project-signoffs-summary' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ClipboardCheck className="h-5 w-5" />
                  {totalSectionsCount > 0 && (
                    <span className={`absolute -top-1 -left-1 text-white text-xs font-medium rounded-full h-5 min-w-5 px-1 flex items-center justify-center ${
                      allSigned ? 'bg-green-500' : 'bg-amber-500'
                    }`}>
                      {signedCount}/{totalSectionsCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Project Sign-offs ({signedCount}/{totalSectionsCount} signed)</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default RightToolbar;
