
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EntityProfileSectionProps {
  formData: {
    entity_revenue_greater_than_billion: string;
    entity_meets_international_criteria: boolean;
    using_sats_not_on_firm_list: string;
  };
  onFormDataChange: (updates: any) => void;
}

const EntityProfileSection = ({ formData, onFormDataChange }: EntityProfileSectionProps) => {
  return (
    <div className="space-y-6 border-t pt-6">
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="entity_meets_international_criteria" 
            checked={formData.entity_meets_international_criteria || false} 
            onCheckedChange={(checked) => onFormDataChange({ entity_meets_international_criteria: checked as boolean })} 
          />
          <Label htmlFor="entity_meets_international_criteria" className="text-sm font-medium leading-relaxed">
            We confirm the entity/engagement meets all the following International-standard criteria:
          </Label>
        </div>
        
        <div className="ml-6 space-y-2 text-sm text-gray-700">
          <div className="font-medium">The entity:</div>
          <div className="italic">- is not a Public Interest Entity (PIE), as determined by the member firm based on the definition in the Global Quality & Risk Management Manual (GQ&RMM)</div>
          <div className="italic">- is not a publicly traded entity</div>
          <div className="italic">- is not a Bank, as defined for the International Enhanced PIE criteria</div>
          <div className="italic">- is not an insurance entity, one of whose main functions is to provide insurance to the public</div>
        </div>
      </div>

      <div className="space-y-4">
        <h5 className="font-medium text-gray-900">Create a list of SATs to be used on the engagement</h5>
        
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Besides Bumex workflow – Standard, are you using <span className="underline">SATs</span> on the engagement which are not <span className="underline">already</span> on the <span className="underline">member firm SAT list</span>?
          </Label>
          <RadioGroup 
            value={formData.using_sats_not_on_firm_list || ''} 
            onValueChange={(value) => onFormDataChange({ using_sats_not_on_firm_list: value })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="sats-yes" />
              <Label htmlFor="sats-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="sats-no" />
              <Label htmlFor="sats-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default EntityProfileSection;
