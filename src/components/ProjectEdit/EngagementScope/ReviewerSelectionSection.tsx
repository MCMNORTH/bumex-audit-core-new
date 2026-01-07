
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/contexts/TranslationContext';
import CommentableQuestion from '../Comments/CommentableQuestion';

interface ReviewerSelectionSectionProps {
  formData: {
    engagement_quality_control_reviewer: boolean;
    limited_scope_quality_control_reviewer: boolean;
    other_reviewer: boolean;
    reviewer_not_applicable: boolean;
  };
  onFormDataChange: (updates: any) => void;
}

const ReviewerSelectionSection = ({ formData, onFormDataChange }: ReviewerSelectionSectionProps) => {
  const { t } = useTranslation();
  
  return (
    <CommentableQuestion fieldId="reviewer-selection-section" label="Reviewer Selection">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{t('reviewerSelection.title')}</h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="engagement_quality_control_reviewer"
              checked={formData.engagement_quality_control_reviewer}
              onCheckedChange={(checked) => onFormDataChange({ engagement_quality_control_reviewer: checked as boolean })}
            />
            <Label htmlFor="engagement_quality_control_reviewer">{t('reviewerSelection.engagementQualityControlReviewer')}</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="limited_scope_quality_control_reviewer"
              checked={formData.limited_scope_quality_control_reviewer}
              onCheckedChange={(checked) => onFormDataChange({ limited_scope_quality_control_reviewer: checked as boolean })}
            />
            <Label htmlFor="limited_scope_quality_control_reviewer">{t('reviewerSelection.limitedScopeQualityControlReviewer')}</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="other_reviewer"
              checked={formData.other_reviewer}
              onCheckedChange={(checked) => onFormDataChange({ other_reviewer: checked as boolean })}
            />
            <Label htmlFor="other_reviewer">{t('reviewerSelection.otherReviewer')}</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="reviewer_not_applicable"
              checked={formData.reviewer_not_applicable}
              onCheckedChange={(checked) => onFormDataChange({ reviewer_not_applicable: checked as boolean })}
            />
            <Label htmlFor="reviewer_not_applicable">{t('reviewerSelection.notApplicable')}</Label>
          </div>
        </div>
      </div>
    </CommentableQuestion>
  );
};

export default ReviewerSelectionSection;
