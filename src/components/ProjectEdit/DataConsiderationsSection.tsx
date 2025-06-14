
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface DataConsiderationsFormData {
  trial_balances_electronic_format: string;
  large_batch_journal_entries: string;
  significant_circumstances_impair_da: string;
}

interface DataConsiderationsSectionProps {
  formData: DataConsiderationsFormData;
  onFormDataChange: (updates: Partial<DataConsiderationsFormData>) => void;
}

const DataConsiderationsSection = ({
  formData,
  onFormDataChange
}: DataConsiderationsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data considerations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">
            Is the engagement team able to obtain trial balances and journal entry transactions in an electronic format for upload?
          </Label>
          <RadioGroup
            value={formData.trial_balances_electronic_format || 'Not selected'}
            onValueChange={(value) => onFormDataChange({ trial_balances_electronic_format: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="trial-yes" />
              <Label htmlFor="trial-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="trial-no" />
              <Label htmlFor="trial-no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Not selected" id="trial-not-selected" />
              <Label htmlFor="trial-not-selected" className="text-sm">Not selected</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium">
            Does the entity process large batch journal entries?
          </Label>
          <RadioGroup
            value={formData.large_batch_journal_entries || 'Not selected'}
            onValueChange={(value) => onFormDataChange({ large_batch_journal_entries: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="batch-yes" />
              <Label htmlFor="batch-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="batch-no" />
              <Label htmlFor="batch-no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Not selected" id="batch-not-selected" />
              <Label htmlFor="batch-not-selected" className="text-sm">Not selected</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium">
            Are there any significant circumstances that would impair the use of D&A in the current audit?
          </Label>
          <RadioGroup
            value={formData.significant_circumstances_impair_da || 'Not selected'}
            onValueChange={(value) => onFormDataChange({ significant_circumstances_impair_da: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="da-yes" />
              <Label htmlFor="da-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="da-no" />
              <Label htmlFor="da-no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Not selected" id="da-not-selected" />
              <Label htmlFor="da-not-selected" className="text-sm">Not selected</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataConsiderationsSection;
