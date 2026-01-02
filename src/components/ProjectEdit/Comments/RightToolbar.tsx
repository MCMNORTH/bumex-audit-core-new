import React, { useState } from 'react';
import { MessageSquare, Users, ClipboardCheck, FileCheck, ChevronDown, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UnsignedSection {
  id: string;
  title: string;
  number?: string;
}

interface PendingReview {
  sectionId: string;
  sectionTitle: string;
  pendingRoles: string[];
}

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
  unsignedSections?: UnsignedSection[];
  pendingReviews?: PendingReview[];
  onNavigateToSection?: (sectionId: string) => void;
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
  unsignedSections = [],
  pendingReviews = [],
  onNavigateToSection,
}) => {
  const [signOffsOpen, setSignOffsOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  
  const signedCount = totalSectionsCount - unsignedSectionsCount;
  const allSigned = totalSectionsCount > 0 && unsignedSectionsCount === 0;
  const pendingReviewsCount = pendingReviews.length;

  const handleNavigateToSection = (sectionId: string) => {
    onNavigateToSection?.(sectionId);
    setSignOffsOpen(false);
    setReviewsOpen(false);
  };

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

          {/* Pending Reviews Button */}
          {pendingReviewsCount > 0 && (
            <Popover open={reviewsOpen} onOpenChange={setReviewsOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className={`relative p-3 transition-colors ${
                        reviewsOpen 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <AlertCircle className="h-5 w-5" />
                      <span className="absolute -top-1 -left-1 bg-orange-500 text-white text-xs font-medium rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                        {pendingReviewsCount > 99 ? '99+' : pendingReviewsCount}
                      </span>
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Pending Reviews ({pendingReviewsCount})</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent side="left" align="start" className="w-72 p-0">
                <div className="p-3 border-b bg-orange-50">
                  <h4 className="font-medium text-sm text-orange-800">Pending Reviews</h4>
                  <p className="text-xs text-orange-600">{pendingReviewsCount} section(s) need review</p>
                </div>
                <ScrollArea className="max-h-64">
                  <div className="p-2">
                    {pendingReviews.map((review) => (
                      <button
                        key={review.sectionId}
                        onClick={() => handleNavigateToSection(review.sectionId)}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {review.sectionTitle}
                        </p>
                        <p className="text-xs text-orange-600">
                          Pending: {review.pendingRoles.join(', ')}
                        </p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}

          {/* Project Sign-offs Button with Dropdown */}
          {onNavigateToSignOffs && (
            <Popover open={signOffsOpen} onOpenChange={setSignOffsOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className={`relative p-3 transition-colors ${
                        activeSection === 'project-signoffs-summary' || signOffsOpen
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
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Project Sign-offs ({signedCount}/{totalSectionsCount} signed)</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent side="left" align="start" className="w-72 p-0">
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Sign-off Status</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      allSigned 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {signedCount}/{totalSectionsCount}
                    </span>
                  </div>
                </div>
                
                {unsignedSections.length > 0 ? (
                  <ScrollArea className="max-h-64">
                    <div className="p-2">
                      <p className="text-xs text-gray-500 px-2 py-1">Unsigned sections:</p>
                      {unsignedSections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleNavigateToSection(section.id)}
                          className="w-full text-left p-2 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
                        >
                          <FileCheck className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            {section.number && <span className="text-gray-400">{section.number} </span>}
                            {section.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-4 text-center">
                    <FileCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-green-700 font-medium">All sections signed!</p>
                  </div>
                )}
                
                <div className="p-2 border-t">
                  <button
                    onClick={() => {
                      onNavigateToSignOffs();
                      setSignOffsOpen(false);
                    }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    View all sign-offs
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default RightToolbar;
