import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X, Users, Save, Loader2, ArrowUp } from 'lucide-react';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { 
  getSectionReviewStatus, 
  getCompletedReviewRoles, 
  getCurrentReviewLevel,
  canUserReviewSection
} from '@/utils/permissions';

interface CompactReviewFooterProps {
  sectionId: string;
  formData: ProjectFormData;
  currentUser: User | null;
  onReview: (sectionId: string) => void;
  onSave: () => void;
  saving: boolean;
}

const CompactReviewFooter: React.FC<CompactReviewFooterProps> = ({
  sectionId,
  formData,
  currentUser,
  onReview,
  onSave,
  saving
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const status = getSectionReviewStatus(sectionId, formData);
  const currentLevel = getCurrentReviewLevel(sectionId, formData);
  const canUserReview = canUserReviewSection(currentUser, formData, sectionId);

  const reviewData = formData.reviews?.[sectionId] || {
    staff_reviews: [],
    incharge_reviews: [],
    manager_reviews: [],
    partner_reviews: [],
    lead_partner_reviews: [],
    status: 'not_reviewed',
    current_review_level: 'staff'
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

  const getReviewsForRole = (role: string) => {
    const roleKey = `${role}_reviews` as keyof typeof reviewData;
    const reviews = reviewData[roleKey];
    return Array.isArray(reviews) ? reviews : [];
  };

  const getStatusConfig = () => {
    if (currentLevel === 'completed') {
      return {
        color: 'green',
        icon: Check,
        text: 'Completed',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      };
    }
    
    switch (status) {
      case 'reviewed':
      case 'ready_for_review':
        return {
          color: 'blue',
          icon: Clock,
          text: 'In Progress',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700'
        };
      default:
        return {
          color: 'yellow',
          icon: X,
          text: 'Not Reviewed',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`fixed bottom-0 left-64 right-0 z-40 border-t-2 ${statusConfig.bgColor} ${statusConfig.borderColor} shadow-lg`}>
      <div className="max-w-4xl mx-auto px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Status and role badges */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <StatusIcon className={`h-4 w-4 ${statusConfig.textColor}`} />
              <Badge variant="outline" className={`${statusConfig.bgColor} ${statusConfig.textColor} border-current text-xs`}>
                {statusConfig.text}
              </Badge>
            </div>
            
            {/* Role badges - scrollable on small screens */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
              {['staff', 'incharge', 'manager', 'partner', 'lead_partner'].map((role) => {
                const reviews = getReviewsForRole(role);
                const isCompleted = reviews.length > 0;

                return (
                  <div 
                    key={role} 
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs whitespace-nowrap shrink-0 ${
                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Users className="h-3 w-3" />
                    <span>{getRoleDisplayName(role)}</span>
                    {isCompleted && <Check className="h-3 w-3" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-2 shrink-0">
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
            
            <Button
              onClick={onSave}
              size="sm"
              disabled={saving}
              variant="default"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>

            {showScrollTop && (
              <Button
                onClick={scrollToTop}
                size="sm"
                variant="outline"
                className="ml-1"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactReviewFooter;