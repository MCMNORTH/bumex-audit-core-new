
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ITEnvironmentSectionProps {
  formData: {
    entity_highly_dependent_on_it: string;
    plan_to_rely_on_automated_controls: string;
    use_it_critically_checklist: boolean;
  };
  onFormDataChange: (updates: any) => void;
}

const ITEnvironmentSection = ({ formData, onFormDataChange }: ITEnvironmentSectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">IT environment</h4>
      <div>
        <Label className="text-sm font-medium">Is the entity highly dependent on IT processes to maintain its financial reporting and accounting books and records, including IT processes performed by service organizations, so we cannot obtain sufficient appropriate audit evidence without relying on automated controls?</Label>
        <RadioGroup
          value={formData.entity_highly_dependent_on_it || 'Not selected'}
          onValueChange={(value) => onFormDataChange({ entity_highly_dependent_on_it: value })}
          className="flex space-x-6 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Yes" id="it-yes" />
            <Label htmlFor="it-yes" className="text-sm">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="No" id="it-no" />
            <Label htmlFor="it-no" className="text-sm">No</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Not selected" id="it-not-selected" />
            <Label htmlFor="it-not-selected" className="text-sm">Not selected</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-sm font-medium">Do we plan to rely on the operating effectiveness of automated controls to respond to a significant risk?</Label>
        <RadioGroup
          value={formData.plan_to_rely_on_automated_controls || 'Not selected'}
          onValueChange={(value) => onFormDataChange({ plan_to_rely_on_automated_controls: value })}
          className="flex space-x-6 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Yes" id="automated-controls-yes" />
            <Label htmlFor="automated-controls-yes" className="text-sm">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="No" id="automated-controls-no" />
            <Label htmlFor="automated-controls-no" className="text-sm">No</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Not selected" id="automated-controls-not-selected" />
            <Label htmlFor="automated-controls-not-selected" className="text-sm">Not selected</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="use_it_critically_checklist"
          checked={formData.use_it_critically_checklist || false}
          onCheckedChange={(checked) => onFormDataChange({ use_it_critically_checklist: checked as boolean })}
        />
        <Label htmlFor="use_it_critically_checklist" className="text-sm">We decided to use the IT Critically checklist to help us determine whether the entity is highly dependent on IT processes</Label>
      </div>
    </div>
  );
};

export default ITEnvironmentSection;
