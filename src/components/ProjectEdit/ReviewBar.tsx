import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Check, X, Clock, Users, ChevronDown, ChevronUp, History } from 'lucide-react';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { 
  getSectionReviewStatus, 
  getCompletedReviewRoles, 
  getPendingReviewRoles,
  getCurrentReviewLevel,
  canUserReviewSection
} from '@/utils/permissions';
import { canUnreviewSpecific, getAllSectionReviews } from '@/utils/reviewPermissions';

interface ReviewData {
  staff_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
  incharge_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
  manager_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
  partner_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
  lead_partner_reviews: { user_id: string; reviewed_at: string; user_name: string }[];
  status: 'not_reviewed' | 'ready_for_review' | 'reviewed';
  current_review_level: 'staff' | 'incharge' | 'manager' | 'partner' | 'lead_partner' | 'completed';
}

interface ReviewBarProps {
  sectionId: string;
  formData: ProjectFormData;
  users: User[];
  currentUser: User | null;
  onReview: (sectionId: string) => void;
  onUnreview: (sectionId: string, role: string, userId: string) => void;
}

const ReviewBar: React.FC<ReviewBarProps> = ({
  sectionId,
  formData,
  users,
  currentUser,
  onReview,
  onUnreview
}) => {
  const [isLogExpanded, setIsLogExpanded] = useState(false);
  const reviewData = formData.reviews?.[sectionId] || {
    staff_reviews: [],
    incharge_reviews: [],
    manager_reviews: [],
    partner_reviews: [],
    lead_partner_reviews: [],
    status: 'not_reviewed',
    current_review_level: 'staff'
  };

  const status = getSectionReviewStatus(sectionId, formData);
  const completedRoles = getCompletedReviewRoles(sectionId, formData);
  const pendingRoles = getPendingReviewRoles(sectionId, formData);
  const currentLevel = getCurrentReviewLevel(sectionId, formData);
  const canUserReview = canUserReviewSection(currentUser, formData, sectionId);
  const allReviews = getAllSectionReviews(sectionId, formData);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      staff: 'Staff',
      incharge: 'In Charge',
      manager: 'Manager',
      partner: 'Partner',
      lead_partner: 'Lead Partner'
    };
    return roleNames[role] || role;
  };

  const getStatusConfig = () => {
    if (currentLevel === 'completed') {
      return {
        color: 'green',
        icon: Check,
        text: 'All Reviews Complete',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
    
    switch (status) {
      case 'reviewed':
        return {
          color: 'blue',
          icon: Clock,
          text: 'Partially Reviewed',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'ready_for_review':
        return {
          color: 'blue',
          icon: Clock,
          text: 'In Progress',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          color: 'yellow',
          icon: X,
          text: 'Not Reviewed',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const getReviewsForRole = (role: string) => {
    const roleKey = `${role}_reviews` as keyof ReviewData;
    return reviewData[roleKey] as { user_id: string; reviewed_at: string; user_name: string }[];
  };

  const handleUnreview = (role: string, userId: string) => {
    onUnreview(sectionId, role, userId);
  };

  return (
    <Card className={`mb-6 border-2 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <StatusIcon className={`h-5 w-5 text-${statusConfig.color}-600 mt-0.5`} />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className={`bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}>
                  {statusConfig.text}
                </Badge>
                {currentLevel === 'completed' && (
                  <span className="text-sm text-green-700 font-medium">
                    All reviews complete - section locked
                  </span>
                )}
                {status === 'ready_for_review' && currentLevel !== 'completed' && (
                  <span className="text-sm text-blue-700">
                    Review in progress - any role can review
                  </span>
                )}
              </div>

              {/* Review Progress */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {['staff', 'incharge', 'manager', 'partner', 'lead_partner'].map((role) => {
                    const reviews = getReviewsForRole(role);
                    const isCompleted = reviews.length > 0;

                    return (
                      <div key={role} className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Users className="h-3 w-3" />
                        <span>{getRoleDisplayName(role)}</span>
                        {isCompleted && <Check className="h-3 w-3" />}
                      </div>
                    );
                  })}
                </div>

                {/* Review Log */}
                {allReviews.length > 0 && (
                  <div className="border-t pt-3">
                    <Collapsible open={isLogExpanded} onOpenChange={setIsLogExpanded}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-sm text-gray-600 hover:text-gray-800">
                          <History className="h-4 w-4 mr-1" />
                          Review Log ({allReviews.length})
                          {isLogExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <ScrollArea className="h-32 border rounded p-2">
                          <div className="space-y-2">
                            {allReviews.slice(0, 10).map((review, index) => (
                              <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                <span className="flex-1">
                                  <span className="font-medium">{getRoleDisplayName(review.role)}</span>: {review.user_name}
                                  <span className="text-gray-500 ml-2">{formatDate(review.reviewed_at)}</span>
                                </span>
                                {canUnreviewSpecific(currentUser, formData, review.role, review.user_id) && (
                                  <Button
                                    onClick={() => handleUnreview(review.role, review.user_id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-red-600 hover:bg-red-50 ml-2"
                                  >
                                    Unreview
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {canUserReview && currentLevel !== 'completed' && (
              <Button
                onClick={() => onReview(sectionId)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewBar;