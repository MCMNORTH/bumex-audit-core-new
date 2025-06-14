
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface ReportingFrameworkSectionProps {
  formData: {
    financial_reporting_framework: string[];
  };
  onFormDataChange: (updates: any) => void;
}

const ReportingFrameworkSection = ({ formData, onFormDataChange }: ReportingFrameworkSectionProps) => {
  const handleAddReportingFramework = () => {
    const newFrameworks = [...formData.financial_reporting_framework, ''];
    onFormDataChange({ financial_reporting_framework: newFrameworks });
  };

  const handleRemoveReportingFramework = (index: number) => {
    const newFrameworks = formData.financial_reporting_framework.filter((_, i) => i !== index);
    onFormDataChange({ financial_reporting_framework: newFrameworks });
  };

  const handleReportingFrameworkChange = (index: number, value: string) => {
    const newFrameworks = [...formData.financial_reporting_framework];
    newFrameworks[index] = value;
    onFormDataChange({ financial_reporting_framework: newFrameworks });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-gray-900">Applicable financial reporting framework and other legislative and regulatory requirements:</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddReportingFramework}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      {formData.financial_reporting_framework.map((framework, index) => (
        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <Input
            value={framework}
            onChange={(e) => handleReportingFrameworkChange(index, e.target.value)}
            placeholder="Enter financial reporting framework"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveReportingFramework(index)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ReportingFrameworkSection;
