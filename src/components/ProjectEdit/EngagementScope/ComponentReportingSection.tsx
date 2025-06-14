
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ComponentReportingSectionProps {
  formData: {
    component_reporting: boolean;
    component_reporting_details: string;
    group_auditor: boolean;
  };
  onFormDataChange: (updates: any) => void;
}

const ComponentReportingSection = ({ formData, onFormDataChange }: ComponentReportingSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="component_reporting"
          checked={formData.component_reporting}
          onCheckedChange={(checked) => onFormDataChange({ component_reporting: checked as boolean })}
        />
        <Label htmlFor="component_reporting">Component reporting</Label>
      </div>
      
      {formData.component_reporting && (
        <div>
          <Label htmlFor="component_reporting_details">Component reporting details</Label>
          <Textarea
            id="component_reporting_details"
            value={formData.component_reporting_details}
            onChange={(e) => onFormDataChange({ component_reporting_details: e.target.value })}
            placeholder="Describe the nature and scope of component reporting requirements, including any specific instructions received from group auditors..."
            className="min-h-[120px]"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="group_auditor"
          checked={formData.group_auditor}
          onCheckedChange={(checked) => onFormDataChange({ group_auditor: checked as boolean })}
        />
        <Label htmlFor="group_auditor">Group auditor</Label>
      </div>
    </div>
  );
};

export default ComponentReportingSection;
