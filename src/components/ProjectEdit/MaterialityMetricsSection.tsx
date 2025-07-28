import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProjectFormData } from '@/types/formData';

interface MaterialityMetricsSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const MaterialityMetricsSection = ({ formData, onFormDataChange }: MaterialityMetricsSectionProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Identify the relevant metrics and determine the benchmark
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <Label htmlFor="mbt_applicable" className="text-sm font-medium">
                Metrics and Benchmark Table (MBT) that is applicable for the entity
              </Label>
              <Input
                id="mbt_applicable"
                value={(formData as any).mbt_applicable || ''}
                onChange={(e) => onFormDataChange({ mbt_applicable: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="mbt_industry_scenarios" className="text-sm font-medium">
                MBT Industry or Scenarios
              </Label>
              <Input
                id="mbt_industry_scenarios"
                value={(formData as any).mbt_industry_scenarios || ''}
                onChange={(e) => onFormDataChange({ mbt_industry_scenarios: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <Label htmlFor="financial_info_materiality" className="text-sm font-medium">
                Financial information used for materiality calculation
              </Label>
              <Input
                id="financial_info_materiality"
                value={(formData as any).financial_info_materiality || ''}
                onChange={(e) => onFormDataChange({ financial_info_materiality: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="period_selection" className="text-sm font-medium">
                Period selection
              </Label>
              <Input
                id="period_selection"
                value={(formData as any).period_selection || ''}
                onChange={(e) => onFormDataChange({ period_selection: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="pbt_pbtco_question" className="text-sm font-medium">
              From the entity's financial statements, is PBT = PBTCO?
            </Label>
            <Input
              id="pbt_pbtco_question"
              value={(formData as any).pbt_pbtco_question || ''}
              onChange={(e) => onFormDataChange({ pbt_pbtco_question: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div className="space-y-1 mt-6">
            <Textarea
              placeholder="Additional notes or comments..."
              value={(formData as any).materiality_metrics_notes || ''}
              onChange={(e) => onFormDataChange({ materiality_metrics_notes: e.target.value })}
              className="min-h-[120px] resize-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialityMetricsSection;