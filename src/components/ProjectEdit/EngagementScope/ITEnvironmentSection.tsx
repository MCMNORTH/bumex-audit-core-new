
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface ITEnvironmentSectionProps {
  formData: {
    entity_highly_dependent_on_it: string;
    plan_to_rely_on_automated_controls: string;
    use_it_critically_checklist: boolean;
    it_plan_to_rely_on_automated_controls: string;
    it_plan_benchmarking_strategy: string;
    it_key_members_inquired: string;
  };
  onFormDataChange: (updates: any) => void;
}

const ITEnvironmentSection = ({ formData, onFormDataChange }: ITEnvironmentSectionProps) => {
  return (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-900">IT environment</h4>
      <div>
        <Label className="text-sm font-medium">Is the entity highly dependent on IT processes to maintain its financial reporting and accounting books and records, including IT processes performed by service organizations, so we cannot obtain sufficient appropriate audit evidence without relying on automated controls?</Label>
        <RadioGroup
          value={formData.entity_highly_dependent_on_it || ''}
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
        </RadioGroup>
      </div>

      <div>
        <Label className="text-sm font-medium">Do we plan to rely on the operating effectiveness of automated controls to respond to a significant risk?</Label>
        <RadioGroup
          value={formData.plan_to_rely_on_automated_controls || ''}
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

      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Understand the entity's IT organization and IT systems</h4>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Do you plan to rely on automated controls?</Label>
            <RadioGroup
              value={formData.it_plan_to_rely_on_automated_controls || ''}
              onValueChange={(value) => onFormDataChange({ it_plan_to_rely_on_automated_controls: value })}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="it-rely-automated-yes" />
                <Label htmlFor="it-rely-automated-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="it-rely-automated-no" />
                <Label htmlFor="it-rely-automated-no" className="text-sm">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Do you plan to take the benchmarking strategy for testing automated controls?</Label>
            <RadioGroup
              value={formData.it_plan_benchmarking_strategy || ''}
              onValueChange={(value) => onFormDataChange({ it_plan_benchmarking_strategy: value })}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="it-benchmarking-yes" />
                <Label htmlFor="it-benchmarking-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="it-benchmarking-no" />
                <Label htmlFor="it-benchmarking-no" className="text-sm">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="it-key-members" className="text-sm font-medium">We inquired of the following key members of IT organization primarily responsible for the IT environment:</Label>
            <Textarea
              id="it-key-members"
              value={formData.it_key_members_inquired || ''}
              onChange={(e) => onFormDataChange({ it_key_members_inquired: e.target.value })}
              className="mt-2"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITEnvironmentSection;
