
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ReviewerSelectionSectionProps {
  formData: {
    engagement_quality_control_reviewer: boolean;
    limited_scope_quality_control_reviewer: boolean;
    other_reviewer: boolean;
  };
  onFormDataChange: (updates: any) => void;
}

const ReviewerSelectionSection = ({ formData, onFormDataChange }: ReviewerSelectionSectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Select the type of reviewer(s) which have been identified for the engagement:</h4>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="engagement_quality_control_reviewer"
            checked={formData.engagement_quality_control_reviewer}
            onCheckedChange={(checked) => onFormDataChange({ engagement_quality_control_reviewer: checked as boolean })}
          />
          <Label htmlFor="engagement_quality_control_reviewer">Engagement quality control reviewer</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="limited_scope_quality_control_reviewer"
            checked={formData.limited_scope_quality_control_reviewer}
            onCheckedChange={(checked) => onFormDataChange({ limited_scope_quality_control_reviewer: checked as boolean })}
          />
          <Label htmlFor="limited_scope_quality_control_reviewer">Limited scope quality control reviewer</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="other_reviewer"
            checked={formData.other_reviewer}
            onCheckedChange={(checked) => onFormDataChange({ other_reviewer: checked as boolean })}
          />
          <Label htmlFor="other_reviewer">Other reviewer</Label>
        </div>
      </div>
    </div>
  );
};

export default ReviewerSelectionSection;
