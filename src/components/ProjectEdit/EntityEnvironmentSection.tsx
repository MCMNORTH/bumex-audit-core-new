import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EntityEnvironmentSectionProps {
  formData: any;
  onFormDataChange: (updates: any) => void;
}

const EntityEnvironmentSection: React.FC<EntityEnvironmentSectionProps> = ({ formData, onFormDataChange }) => {
  const industryOptions = [
    'Industrial Products',
    'Retail',
    'Healthcare',
    'Technology',
    'Financial Services',
    'Energy',
    'Real Estate',
    'Consumer Goods',
    'Transportation'
  ];

  const financialReportingOptions = [
    'ISA',
    'French GAAP',
    'US GAAP',
    'IFRS',
    'UK GAAP',
    'German GAAP',
    'Local GAAP'
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Obtain an understanding of the entity and its environment</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Understand relevant industry, regulatory and other external factors</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="industry-select">Identify the industry(s) in which the entity operates:</Label>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Industry(s)</Label>
                <Select
                  value={formData.entity_industry || ''}
                  onValueChange={(value) => onFormDataChange({ entity_industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Financial reporting framework</Label>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Financial reporting</Label>
                <Select
                  value={formData.financial_reporting_framework_main || ''}
                  onValueChange={(value) => onFormDataChange({ financial_reporting_framework_main: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {financialReportingOptions.map((framework) => (
                      <SelectItem key={framework} value={framework}>
                        {framework}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntityEnvironmentSection;