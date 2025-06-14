
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface StrategyConsiderationsSectionProps {
  formData: {
    significant_factors_directing_activities: string;
    additional_information_documentation: string;
  };
  onFormDataChange: (updates: any) => void;
}

const StrategyConsiderationsSection = ({ formData, onFormDataChange }: StrategyConsiderationsSectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Other strategy or planning considerations</h4>
      
      <div>
        <Label htmlFor="significant_factors_directing_activities" className="text-sm font-medium">
          Identify factors that are significant in directing the activities of the engagement team e.g. significant issues and key audit areas.
        </Label>
        <Textarea
          id="significant_factors_directing_activities"
          value={formData.significant_factors_directing_activities || ''}
          onChange={(e) => onFormDataChange({ significant_factors_directing_activities: e.target.value })}
          placeholder="Identify and describe significant factors, issues, and key audit areas that will guide the engagement team's activities..."
          className="min-h-[120px] mt-2"
        />
      </div>

      <div>
        <Label htmlFor="additional_information_documentation" className="text-sm font-medium">
          Document any additional information e.g. overall timing of audit activities and preliminary decisions about which locations we will include in our audit scope.
        </Label>
        <Textarea
          id="additional_information_documentation"
          value={formData.additional_information_documentation || ''}
          onChange={(e) => onFormDataChange({ additional_information_documentation: e.target.value })}
          placeholder="Document additional planning information, including timing of audit activities, location scope decisions, and other relevant considerations..."
          className="min-h-[120px] mt-2"
        />
      </div>
    </div>
  );
};

export default StrategyConsiderationsSection;
