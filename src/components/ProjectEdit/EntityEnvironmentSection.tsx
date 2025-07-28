import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

  const handleConfirmationChange = (field: string, value: string) => {
    onFormDataChange({
      [field]: value
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

        <div className="space-y-6">
          <h4 className="font-medium text-gray-900">Confirm the understanding of industry, regulatory environment and other external factors:</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                There are no significant changes in general economic conditions.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.economic_conditions_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('economic_conditions_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.economic_conditions_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('economic_conditions_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity operates in a legal and/or political environment that is stable.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.legal_environment_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('legal_environment_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.legal_environment_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('legal_environment_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The laws and regulations relevant to the entity are those that are generally applicable for all entities.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.laws_regulations_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('laws_regulations_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.laws_regulations_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('laws_regulations_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                Technologies relevant to the entity's products or services remain unchanged.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.technologies_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('technologies_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.technologies_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('technologies_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                Competitors relevant to the entity remain unchanged.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.competitors_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('competitors_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.competitors_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('competitors_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The industry relevant to the entity is stable and is without significant new developments such as disruptions, decline, or growth.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.industry_stability_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('industry_stability_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.industry_stability_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('industry_stability_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity has continued to operate in the same markets or segments with the same products and services.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.markets_products_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('markets_products_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.markets_products_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('markets_products_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="document-additional-considerations"
                checked={formData.document_additional_considerations || false}
                onCheckedChange={(checked) => onFormDataChange({ document_additional_considerations: checked })}
              />
              <Label htmlFor="document-additional-considerations" className="text-sm">
                Document any additional considerations needed regarding understanding industry, regulatory and other external factors including where the assumptions above are not confirmed
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="regulatory-factors-relevant"
                checked={formData.regulatory_factors_relevant || false}
                onCheckedChange={(checked) => onFormDataChange({ regulatory_factors_relevant: checked })}
              />
              <Label htmlFor="regulatory-factors-relevant" className="text-sm">
                Regulatory factors are relevant to the entity's accounting estimates
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-medium text-gray-900">Understand the nature of the entity</h4>
          
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Confirm the understanding of the nature of the entity:</h5>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity is an owner managed business with limited shareholders, or an entity without share capital that is not a Public Interest Entity.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_nature_ownership_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_nature_ownership_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_nature_ownership_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_nature_ownership_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity has a limited range of products or services.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_nature_products_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_nature_products_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_nature_products_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_nature_products_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity has a limited number of facilities or locations.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_nature_facilities_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_nature_facilities_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_nature_facilities_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_nature_facilities_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity's management or shareholders are those charged with governance.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_management_governance_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_management_governance_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_management_governance_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_management_governance_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity is in a steady state and no significant changes to the business operations have occurred in current year.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_steady_state_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_steady_state_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_steady_state_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_steady_state_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity's transactions are routine and non-complex in nature.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_transactions_routine_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_transactions_routine_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_transactions_routine_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_transactions_routine_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity's capital, if any, remains consistent with the previous year.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_capital_consistent_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_capital_consistent_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_capital_consistent_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_capital_consistent_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity's investments, if any, remain consistent with the previous year.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_investments_consistent_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_investments_consistent_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_investments_consistent_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_investments_consistent_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity's financing agreements, if any, are simple.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_financing_simple_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_financing_simple_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_financing_simple_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_financing_simple_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity's contracts and agreements with customers are standard and without complexity.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_customer_contracts_standard_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_customer_contracts_standard_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_customer_contracts_standard_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_customer_contracts_standard_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 flex-1 pr-4">
                The entity's contracts and agreements with vendors are standard and without complexity.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.entity_vendor_contracts_standard_confirmation === 'not_confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_vendor_contracts_standard_confirmation', 'not_confirmed')}
                  className="text-xs"
                >
                  NOT CONFIRMED
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_vendor_contracts_standard_confirmation === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfirmationChange('entity_vendor_contracts_standard_confirmation', 'confirmed')}
                  className="text-xs"
                >
                  CONFIRMED
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Document additional considerations */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="document_additional_considerations_nature"
              checked={formData.document_additional_considerations}
              onCheckedChange={(checked) => 
                onFormDataChange({ 
                  document_additional_considerations: checked as boolean,
                  additional_considerations_documentation: checked ? formData.additional_considerations_documentation : ''
                })
              }
            />
            <Label htmlFor="document_additional_considerations_nature" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Document any additional consideration needed regarding the understanding the nature of the entity including where the assumptions above are not confirmed:
            </Label>
          </div>
          
          {formData.document_additional_considerations && (
            <div className="ml-6">
              <Textarea
                placeholder="Enter additional considerations..."
                value={formData.additional_considerations_documentation}
                onChange={(e) => onFormDataChange({ additional_considerations_documentation: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          )}
        </div>

        {/* Understand the entity's objectives, strategies, and related business risks */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold">Understand the entity's objectives, strategies, and related business risks</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Understand the entity's objectives and strategies and those related business risks.
            </p>
          </div>
          <Textarea
            placeholder="Enter understanding of entity's objectives, strategies, and business risks..."
            value={formData.entity_objectives_strategies_risks}
            onChange={(e) => onFormDataChange({ entity_objectives_strategies_risks: e.target.value })}
            className="min-h-[100px]"
          />
        </div>

        {/* Understand the entity's measurement and analysis of its financial performance */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold">Understand the entity's measurement and analysis of its financial performance</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Identify the performance measures the entity and external parties consider most relevant when assessing financial performance.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Performance Measures</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMeasure = {
                    id: Date.now().toString(),
                    performance_measure: '',
                    definition: ''
                  };
                  onFormDataChange({
                    performance_measures_table: [...(formData.performance_measures_table || []), newMeasure]
                  });
                }}
              >
                Add
              </Button>
            </div>
            
            {(formData.performance_measures_table || []).length > 0 && (
              <div className="space-y-2">
                {(formData.performance_measures_table || []).map((measure: any, index: number) => (
                  <div key={measure.id} className="grid grid-cols-2 gap-4 p-3 border rounded-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">Performance measure</Label>
                      <Input
                        value={measure.performance_measure}
                        onChange={(e) => {
                          const updated = [...(formData.performance_measures_table || [])];
                          updated[index] = { ...updated[index], performance_measure: e.target.value };
                          onFormDataChange({ performance_measures_table: updated });
                        }}
                        placeholder="Enter performance measure"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">How is the performance measure defined? (Optional)</Label>
                        <Input
                          value={measure.definition}
                          onChange={(e) => {
                            const updated = [...(formData.performance_measures_table || [])];
                            updated[index] = { ...updated[index], definition: e.target.value };
                            onFormDataChange({ performance_measures_table: updated });
                          }}
                          placeholder="Enter definition"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          const updated = (formData.performance_measures_table || []).filter((_: any, i: number) => i !== index);
                          onFormDataChange({ performance_measures_table: updated });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Evaluate whether significant changes in the entity from prior periods affect RMMs */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Evaluate whether significant changes in the entity from prior periods affect RMMs</h4>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Were there any significant changes in the entity from prior periods?</Label>
              <RadioGroup
                value={formData.significant_changes_prior_periods}
                onValueChange={(value) => onFormDataChange({ significant_changes_prior_periods: value })}
                className="flex space-x-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="significant_changes_yes" />
                  <Label htmlFor="significant_changes_yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="significant_changes_no" />
                  <Label htmlFor="significant_changes_no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium">Were there any transactions or other events and conditions that may give rise to the need for an estimate or a change in an estimate?</Label>
              <RadioGroup
                value={formData.transactions_events_estimates}
                onValueChange={(value) => onFormDataChange({ transactions_events_estimates: value })}
                className="flex space-x-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="transactions_events_yes" />
                  <Label htmlFor="transactions_events_yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="transactions_events_no" />
                  <Label htmlFor="transactions_events_no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Evaluate relevance and reliability of information used */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold">Evaluate relevance and reliability of information used</h4>
            <Label className="text-sm font-medium">Is information used in our risk assessment procedures performed to obtain an understanding of the entity and its environment?</Label>
            <RadioGroup
              value={formData.information_relevance_reliability}
              onValueChange={(value) => onFormDataChange({ information_relevance_reliability: value })}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="info_relevant_yes" />
                <Label htmlFor="info_relevant_yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="info_relevant_no" />
                <Label htmlFor="info_relevant_no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Consider performing other specific procedures */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold">Consider performing other specific procedures</h4>
            <div className="flex items-start space-x-3 mt-2">
              <Checkbox
                id="other_specific_procedures"
                checked={formData.other_specific_procedures_performed}
                onCheckedChange={(checked) => onFormDataChange({ other_specific_procedures_performed: checked as boolean })}
              />
              <Label htmlFor="other_specific_procedures" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                We have performed other specific procedures to identify additional information to understand the entity and its environment.
              </Label>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default EntityEnvironmentSection;