
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface FormData {
  ethics_breaches_identified: string;
  local_quality_manual_compliance: string;
  member_firm_independence_work_paper: string;
  communicate_other_independence_matters: string;
}

interface IndependenceRequirementsSectionProps {
  formData: FormData;
  onFormDataChange: (updates: any) => void;
}

const IndependenceRequirementsSection = ({
  formData,
  onFormDataChange
}: IndependenceRequirementsSectionProps) => {
  const handleRadioChange = (field: string, value: string) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comply with independence requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-700 font-medium">Confirm each of the following:</p>
        
        {/* Ethics breaches question */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            Have there been any instances of breaches or suspected breaches of ethics or independence identified during the course of the audit?
          </Label>
          <RadioGroup
            value={formData.ethics_breaches_identified || ''}
            onValueChange={(value) => handleRadioChange('ethics_breaches_identified', value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="ethics-yes" />
              <Label htmlFor="ethics-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="ethics-no" />
              <Label htmlFor="ethics-no">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Not selected" id="ethics-not-selected" />
              <Label htmlFor="ethics-not-selected">Not selected</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Local quality manual question */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            In addition to the Global Quality and Risk Management Manual, do we need to comply with a local quality and risk management manual?
          </Label>
          <RadioGroup
            value={formData.local_quality_manual_compliance || ''}
            onValueChange={(value) => handleRadioChange('local_quality_manual_compliance', value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="quality-yes" />
              <Label htmlFor="quality-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="quality-no" />
              <Label htmlFor="quality-no">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Not selected" id="quality-not-selected" />
              <Label htmlFor="quality-not-selected">Not selected</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Member firm independence work paper question */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            Is there an applicable member firm specific independence work paper
          </Label>
          <RadioGroup
            value={formData.member_firm_independence_work_paper || ''}
            onValueChange={(value) => handleRadioChange('member_firm_independence_work_paper', value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="independence-yes" />
              <Label htmlFor="independence-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="independence-no" />
              <Label htmlFor="independence-no">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Not selected" id="independence-not-selected" />
              <Label htmlFor="independence-not-selected">Not selected</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Communicate other independence matters section */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-lg font-medium text-gray-900">
            Communicate other independence matters
          </Label>
          <Label className="text-sm font-medium text-gray-900">
            Other than required communications regarding breaches, will we communicate other independence matters to those charged with governance
          </Label>
          <RadioGroup
            value={formData.communicate_other_independence_matters || ''}
            onValueChange={(value) => handleRadioChange('communicate_other_independence_matters', value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="communicate-yes" />
              <Label htmlFor="communicate-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="communicate-no" />
              <Label htmlFor="communicate-no">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Not selected" id="communicate-not-selected" />
              <Label htmlFor="communicate-not-selected">Not selected</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndependenceRequirementsSection;
