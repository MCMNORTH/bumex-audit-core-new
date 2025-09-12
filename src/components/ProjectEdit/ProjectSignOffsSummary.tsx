import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, ChevronRight, ChevronDown, User as UserIcon, Eye, AlertCircle } from 'lucide-react';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { canSignOffSection, getSectionReviewIndicator, getSectionReviewStatus, getCompletedReviewRoles, getPendingReviewRoles } from '@/utils/permissions';

interface ProjectSignOffsSummaryProps {
  formData: ProjectFormData;
  users: User[];
  sidebarSections: any[];
  currentUser: User | null;
  onUnsign?: (sectionId: string) => void;
}

interface TreeNodeProps {
  section: any;
  formData: ProjectFormData;
  users: User[];
  currentUser: User | null;
  level: number;
  onUnsign?: (sectionId: string) => void;
  sidebarSections: any[];
}

// Utility function to check if all descendants of a section are signed off
const areAllDescendantsSignedOff = (sectionId: string, sidebarSections: any[], formData: ProjectFormData): boolean => {
  const findSectionInHierarchy = (sections: any[], targetId: string): any => {
    for (const section of sections) {
      if (section.id === targetId) return section;
      if (section.children) {
        const found = findSectionInHierarchy(section.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const section = findSectionInHierarchy(sidebarSections, sectionId);
  if (!section || !section.children || section.children.length === 0) {
    return true; // Leaf sections are always "ready" for sign-off
  }

  // Check if all immediate children are signed off AND all their descendants
  return section.children.every((child: any) => {
    const isChildSignedOff = child.signOffLevel ? formData.signoffs?.[child.id]?.signed || false : true;
    const areChildDescendantsSignedOff = areAllDescendantsSignedOff(child.id, sidebarSections, formData);
    return isChildSignedOff && areChildDescendantsSignedOff;
  });
};

const TreeNode: React.FC<TreeNodeProps> = ({ 
  section, 
  formData, 
  users, 
  currentUser, 
  level, 
  onUnsign,
  sidebarSections
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const signOffData = formData.signoffs?.[section.id] || { signed: false };
  const signedByUser = signOffData.signedBy ? users.find(u => u.id === signOffData.signedBy) : null;
  
  // Check if this section has sign-off capability
  const hasSignOff = section.signOffLevel && ['incharge', 'manager'].includes(section.signOffLevel);
  
  // Check if user can unsign this section
  const canUnsign = hasSignOff && currentUser && canSignOffSection(currentUser, formData, section.signOffLevel);
  
  // Check if all descendants are signed off (for hierarchical sign-off)
  const areDescendantsSignedOff = areAllDescendantsSignedOff(section.id, sidebarSections, formData);
  const isBlocked = hasSignOff && !areDescendantsSignedOff && !signOffData.signed;
  
  // Get review status for non-excluded sections
  const excludedSections = ['team-management', 'project-signoffs-summary'];
  const shouldShowReview = !excludedSections.includes(section.id) && currentUser;
  const reviewIndicator = shouldShowReview ? getSectionReviewIndicator(section.id, formData, currentUser) : null;
  const reviewStatus = shouldShowReview ? getSectionReviewStatus(section.id, formData) : 'not_reviewed';
  const completedReviewRoles = shouldShowReview ? getCompletedReviewRoles(section.id, formData) : [];
  const pendingReviewRoles = shouldShowReview ? getPendingReviewRoles(section.id, formData) : [];
  
  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
  };

  const handleUnsign = () => {
    if (onUnsign && section.id) {
      onUnsign(section.id);
    }
  };

  const getIndicatorColor = (color: string) => {
    switch (color) {
      case 'orange': return 'bg-orange-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'grey':
      default: return 'bg-gray-400';
    }
  };

  const getReviewStatusText = (indicator: string) => {
    switch (indicator) {
      case 'orange': return 'Ready for your review';
      case 'blue': return 'Reviewed by your role';
      case 'green': return 'Reviewed by lead partner';
      case 'grey':
      default: return 'Not reviewed';
    }
  };

  const indent = level * 24;
  const hasChildren = section.children && section.children.length > 0;

  return (
    <div className="border-l border-gray-200 ml-4">
      <div 
        className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-md transition-colors"
        style={{ marginLeft: `${indent}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-5 h-5 mr-2 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        
        {!hasChildren && <div className="w-7" />}

        <div className="flex items-center space-x-3 flex-1">
          {hasSignOff && (
            <>
              {signOffData.signed ? (
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              ) : isBlocked ? (
                <X className="h-4 w-4 text-red-400 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
            </>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{section.number}</span>
              <span className={`font-medium truncate ${isBlocked ? 'text-red-600' : 'text-gray-900'}`}>
                {section.title}
              </span>
              
              {/* Review status indicator */}
              {reviewIndicator && (
                <div className="flex items-center space-x-1">
                  <div 
                    className={`w-2 h-2 rounded-full ${getIndicatorColor(reviewIndicator)}`}
                    title={getReviewStatusText(reviewIndicator)}
                  />
                  <span className="text-xs text-gray-500">
                    {getReviewStatusText(reviewIndicator)}
                  </span>
                </div>
              )}
              
              {hasSignOff && (
                <Badge 
                  variant={signOffData.signed ? "default" : isBlocked ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {isBlocked ? 'Blocked' : section.signOffLevel === 'manager' ? 'Manager+' : 'In Charge+'}
                </Badge>
              )}
              
              {isBlocked && (
                <span className="text-xs text-red-600 italic">
                  (Complete children first)
                </span>
              )}
            </div>
            
            {/* Review progress details */}
            {shouldShowReview && (completedReviewRoles.length > 0 || pendingReviewRoles.length > 0) && (
              <div className="mt-1 space-y-1">
                {completedReviewRoles.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <Eye className="h-3 w-3" />
                    <span>Reviewed by: {completedReviewRoles.join(', ')}</span>
                  </div>
                )}
                {pendingReviewRoles.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-orange-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Pending review: {pendingReviewRoles.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
            
            {hasSignOff && signOffData.signed && signedByUser && signOffData.signedAt && (
              <div className="flex items-center space-x-4 mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <UserIcon className="h-3 w-3" />
                  <span>Signed by: {signedByUser.first_name} {signedByUser.last_name}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(signOffData.signedAt)}</span>
                </div>
                {canUnsign && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnsign}
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Unsign
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {section.children.map((child: any) => (
            <TreeNode
              key={child.id}
              section={child}
              formData={formData}
              users={users}
              currentUser={currentUser}
              level={level + 1}
              onUnsign={onUnsign}
              sidebarSections={sidebarSections}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectSignOffsSummary: React.FC<ProjectSignOffsSummaryProps> = ({
  formData,
  users,
  sidebarSections,
  currentUser,
  onUnsign
}) => {
  // Get all sections that can be signed off
  const getAllSignOffSections = (sections: any[]): any[] => {
    const result: any[] = [];
    
    const traverse = (sectionList: any[]) => {
      sectionList.forEach(section => {
        if (section.signOffLevel) {
          result.push(section);
        }
        if (section.children) {
          traverse(section.children);
        }
      });
    };
    
    traverse(sections);
    return result;
  };

  const signOffSections = getAllSignOffSections(sidebarSections);
  
  const getProgressStats = () => {
    const total = signOffSections.length;
    const signed = signOffSections.filter(section => 
      formData.signoffs?.[section.id]?.signed
    ).length;
    const percentage = total > 0 ? Math.round((signed / total) * 100) : 0;
    
    return { total, signed, percentage };
  };

  const { total, signed, percentage } = getProgressStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Project Sign-offs Summary</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {signed}/{total} Complete ({percentage}%)
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Overall Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{signed}</div>
              <div className="text-sm text-gray-500">Signed Off</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{total - signed}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Review Status Legend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm">Ready for your review</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Reviewed by your role</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Reviewed by lead partner</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm">Not reviewed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Tree View */}
      <Card>
        <CardHeader>
          <CardTitle>Project Structure & Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sidebarSections
              .filter(section => !section.devOnly)
              .map((section) => (
                <TreeNode
                  key={section.id}
                  section={section}
                  formData={formData}
                  users={users}
                  currentUser={currentUser}
                  level={0}
                  onUnsign={onUnsign}
                  sidebarSections={sidebarSections}
                />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSignOffsSummary;