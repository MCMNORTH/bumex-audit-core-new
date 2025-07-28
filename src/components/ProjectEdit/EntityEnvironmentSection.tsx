import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';

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

  const handleAddMarket = () => {
    const currentMarkets = formData.entity_markets || [];
    onFormDataChange({
      entity_markets: [...currentMarkets, '']
    });
  };

  const handleRemoveMarket = (index: number) => {
    const currentMarkets = formData.entity_markets || [];
    const updatedMarkets = currentMarkets.filter((_: any, i: number) => i !== index);
    onFormDataChange({
      entity_markets: updatedMarkets
    });
  };

  const handleMarketChange = (index: number, value: string) => {
    const currentMarkets = formData.entity_markets || [];
    const updatedMarkets = [...currentMarkets];
    updatedMarkets[index] = value;
    onFormDataChange({
      entity_markets: updatedMarkets
    });
  };

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

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Identify the market(s) the entity operates in</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Markets</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMarket}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {(formData.entity_markets || []).map((market: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={market}
                    onChange={(e) => handleMarketChange(index, e.target.value)}
                    placeholder="Enter market"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMarket(index)}
                    className="p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="provide-brief-understanding"
              checked={formData.provide_brief_understanding || false}
              onCheckedChange={(checked) => onFormDataChange({ provide_brief_understanding: checked })}
            />
            <Label htmlFor="provide-brief-understanding">
              Provide brief understanding of the entity as necessary.
            </Label>
          </div>

          {formData.provide_brief_understanding && (
            <div className="space-y-2">
              <Textarea
                value={formData.entity_brief_understanding || ''}
                onChange={(e) => onFormDataChange({ entity_brief_understanding: e.target.value })}
                placeholder="Enter brief understanding of the entity..."
                className="min-h-[120px]"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EntityEnvironmentSection;