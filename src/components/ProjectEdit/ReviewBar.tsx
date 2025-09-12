import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Users } from 'lucide-react';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { 
  getSectionReviewStatus, 
  getCompletedReviewRoles, 
  getPendingReviewRoles,
  getCurrentReviewLevel,
  canUserReviewSection
} from '@/utils/permissions';

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
  onUnreview: (sectionId: string) => void;
}

const ReviewBar: React.FC<ReviewBarProps> = ({
  sectionId,
  formData,
  users,
  currentUser,
  onReview,
  onUnreview
}) => {
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
    switch (status) {
      case 'reviewed':
        return {
          color: 'green',
          icon: Check,
          text: 'Reviewed',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'ready_for_review':
        return {
          color: 'blue',
          icon: Clock,
          text: 'Ready For Review',
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

  const canUnreview = (role: string) => {
    if (!currentUser) return false;
    
    // Dev/admin can unreview anything
    if (currentUser.role === 'dev' || currentUser.role === 'admin') return true;
    
    // User can unreview their own reviews or if they have higher role
    const userProjectRole = formData.team_assignments && Object.entries(formData.team_assignments).find(([key, value]) => {
      if (key === 'lead_partner_id') return value === currentUser.id;
      if (Array.isArray(value)) return value.includes(currentUser.id);
      return false;
    })?.[0];
    
    if (!userProjectRole) return false;
    
    const roleHierarchy = ['staff', 'incharge', 'manager', 'partner', 'lead_partner'];
    const userRoleIndex = roleHierarchy.indexOf(userProjectRole.replace('_ids', '').replace('_id', ''));
    const targetRoleIndex = roleHierarchy.indexOf(role);
    
    return userRoleIndex >= targetRoleIndex;
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
                {status === 'reviewed' && (
                  <span className="text-sm text-green-700 font-medium">
                    Section is locked and read-only
                  </span>
                )}
                {status === 'ready_for_review' && (
                  <span className="text-sm text-blue-700">
                    Awaiting {getRoleDisplayName(currentLevel)} review
                  </span>
                )}
              </div>

              {/* Review Progress */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {['staff', 'incharge', 'manager', 'partner', 'lead_partner'].map((role) => {
                    const reviews = getReviewsForRole(role);
                    const isCompleted = reviews.length > 0;
                    const isPending = pendingRoles.includes(role);
                    const isCurrent = currentLevel === role;

                    return (
                      <div key={role} className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        isCompleted ? 'bg-green-100 text-green-700' :
                        isCurrent ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        <Users className="h-3 w-3" />
                        <span>{getRoleDisplayName(role)}</span>
                        {isCompleted && <Check className="h-3 w-3" />}
                        {isCurrent && <Clock className="h-3 w-3" />}
                      </div>
                    );
                  })}
                </div>

                {/* Show completed reviews */}
                {completedRoles.length > 0 && (
                  <div className="text-xs text-gray-600 space-y-1">
                    {completedRoles.map((role) => {
                      const reviews = getReviewsForRole(role);
                      return reviews.map((review, index) => (
                        <div key={`${role}-${index}`} className="flex items-center justify-between">
                          <span>
                            {getRoleDisplayName(role)}: {review.user_name} on {formatDate(review.reviewed_at)}
                          </span>
                          {canUnreview(role) && (
                            <Button
                              onClick={() => onUnreview(sectionId)}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-red-600 hover:bg-red-50"
                            >
                              Unreview
                            </Button>
                          )}
                        </div>
                      ));
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {canUserReview && status !== 'reviewed' && (
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