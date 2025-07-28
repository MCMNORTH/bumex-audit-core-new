
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface ITEnvironmentSectionProps {
  formData: {
    it_plan_to_rely_on_automated_controls: string;
    it_plan_benchmarking_strategy: string;
    it_key_members_inquired: string;
  };
  onFormDataChange: (updates: any) => void;
}

const ITEnvironmentSection = ({ formData, onFormDataChange }: ITEnvironmentSectionProps) => {
  return (
    <div className="space-y-6">
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
  );
};

export default ITEnvironmentSection;
