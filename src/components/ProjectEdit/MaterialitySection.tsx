import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectFormData } from '@/types/formData';

interface MaterialitySectionProps {
  formData: ProjectFormData;
  handleFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

export const MaterialitySection = ({ formData, handleFormDataChange }: MaterialitySectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Identify the relevant metrics and determine the benchmark
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="materiality_mbt_applicable" className="text-sm font-medium text-foreground">
              Metrics and Benchmark Table (MBT) that is applicable for the entity
            </Label>
            <Select
              value={formData.materiality_mbt_applicable}
              onValueChange={(value) => handleFormDataChange({ materiality_mbt_applicable: value })}
            >
              <SelectTrigger className="text-foreground">
                <SelectValue placeholder="Select MBT type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MBT for profit-seeking entities">MBT for profit-seeking entities</SelectItem>
                <SelectItem value="MBT for not-for-profit entities">MBT for not-for-profit entities</SelectItem>
                <SelectItem value="MBT for government entities">MBT for government entities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materiality_mbt_industry_scenarios" className="text-sm font-medium text-foreground">
              MBT Industry or Scenarios
            </Label>
            <Select
              value={formData.materiality_mbt_industry_scenarios}
              onValueChange={(value) => handleFormDataChange({ materiality_mbt_industry_scenarios: value })}
            >
              <SelectTrigger className="text-foreground">
                <SelectValue placeholder="Select industry scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Financial Services">Financial Services</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materiality_financial_info_calculation" className="text-sm font-medium text-foreground">
              Financial information used for materiality calculation
            </Label>
            <Select
              value={formData.materiality_financial_info_calculation}
              onValueChange={(value) => handleFormDataChange({ materiality_financial_info_calculation: value })}
            >
              <SelectTrigger className="text-foreground">
                <SelectValue placeholder="Select calculation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Periods">Periods</SelectItem>
                <SelectItem value="Annual">Annual</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materiality_period_selection" className="text-sm font-medium text-foreground">
              Period selection
            </Label>
            <Input
              id="materiality_period_selection"
              value={formData.materiality_period_selection}
              onChange={(e) => handleFormDataChange({ materiality_period_selection: e.target.value })}
              placeholder="Enter period selection"
              className="text-foreground"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="materiality_pbt_equals_pbtco" className="text-sm font-medium text-foreground">
              From the entity's financial statements, is PBT = PBTCO?
            </Label>
            <Select
              value={formData.materiality_pbt_equals_pbtco}
              onValueChange={(value) => handleFormDataChange({ materiality_pbt_equals_pbtco: value })}
            >
              <SelectTrigger className="text-foreground max-w-xs">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Not applicable">Not applicable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};