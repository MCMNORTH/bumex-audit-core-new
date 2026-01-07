
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import CommentableQuestion from '../Comments/CommentableQuestion';

interface EntityProfileSectionProps {
  formData: {
    entity_revenue_greater_than_billion: string;
    entity_meets_international_criteria: boolean;
    using_sats_not_on_firm_list: string;
    sats_list: Array<{
      id: string;
      name: string;
    }>;
    sats_reliability_evaluation: string;
  };
  onFormDataChange: (updates: any) => void;
}

const EntityProfileSection = ({ formData, onFormDataChange }: EntityProfileSectionProps) => {
  const addSATItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: ''
    };
    const currentList = formData.sats_list || [];
    onFormDataChange({
      sats_list: [...currentList, newItem]
    });
  };

  const removeSATItem = (id: string) => {
    const currentList = formData.sats_list || [];
    onFormDataChange({
      sats_list: currentList.filter(item => item.id !== id)
    });
  };

  const updateSATItem = (id: string, name: string) => {
    const currentList = formData.sats_list || [];
    onFormDataChange({
      sats_list: currentList.map(item => 
        item.id === id ? { ...item, name } : item
      )
    });
  };

  return (
    <CommentableQuestion fieldId="entity-profile-section" label="Entity Profile">
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
              Besides Bumex Auditcore – Standard, are you using <span className="underline">SATs</span> on the engagement which are not <span className="underline">already</span> on the <span className="underline">member firm SAT list</span>?
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

          {/* SATs Table - shown when Yes is selected */}
          {formData.using_sats_not_on_firm_list === 'yes' && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">SATs List</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSATItem}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add SAT
                </Button>
              </div>
              
              {(formData.sats_list || []).length > 0 && (
                <div className="border rounded-md">
                  <div className="bg-muted/50 px-4 py-2 border-b">
                    <div className="grid grid-cols-[1fr,auto] gap-4 font-medium text-sm">
                      <div>Name</div>
                      <div className="w-10"></div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {(formData.sats_list || []).map((item) => (
                      <div key={item.id} className="px-4 py-3">
                        <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
                          <Input
                            value={item.name}
                            onChange={(e) => updateSATItem(item.id, e.target.value)}
                            placeholder="Enter SAT name"
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSATItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reliability Evaluation Section */}
        <div className="space-y-4">
          <div className="text-sm text-gray-700">
            Consider the reliability of the output provided by evaluating the design and testing the consistent operation of those tools to the extent necessary.
          </div>
          <div>
            <Textarea
              value={formData.sats_reliability_evaluation || ''}
              onChange={(e) => onFormDataChange({ sats_reliability_evaluation: e.target.value })}
              placeholder="Enter your evaluation of the reliability..."
              rows={4}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </CommentableQuestion>
  );
};

export default EntityProfileSection;
