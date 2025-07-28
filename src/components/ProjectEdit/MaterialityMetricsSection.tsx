import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { ProjectFormData, MaterialityMetricItem } from '@/types/formData';

interface MaterialityMetricsSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const MaterialityMetricsSection = ({ formData, onFormDataChange }: MaterialityMetricsSectionProps) => {
  const materialityTable = (formData as any).materiality_metrics_table || [];

  const handleTableItemChange = (id: string, field: keyof MaterialityMetricItem, value: string | boolean) => {
    const updatedTable = materialityTable.map((item: MaterialityMetricItem) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ materiality_metrics_table: updatedTable } as any);
  };

  const addNewTableItem = () => {
    const newItem: MaterialityMetricItem = {
      id: Date.now().toString(),
      metrics: '',
      benchmark: '',
      mbt: '',
      amount: '',
      metricType: '',
      relevant: false,
      manualAdjustment: '',
      adjustedAmount: '',
      expectedHigherRange: '',
      expectedLowerRange: ''
    };
    onFormDataChange({ materiality_metrics_table: [...materialityTable, newItem] } as any);
  };

  const removeTableItem = (id: string) => {
    const updatedTable = materialityTable.filter((item: MaterialityMetricItem) => item.id !== id);
    onFormDataChange({ materiality_metrics_table: updatedTable } as any);
  };

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
          
          {/* Materiality Metrics Table */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold">Materiality Metrics</h4>
              <Button 
                onClick={addNewTableItem}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="text-left p-4 font-medium border">Metrics</th>
                    <th className="text-left p-4 font-medium border">Benchmark</th>
                    <th className="text-left p-4 font-medium border">MBT</th>
                    <th className="text-left p-4 font-medium border">Amount</th>
                    <th className="text-center p-4 font-medium border">Metric type</th>
                    <th className="text-center p-4 font-medium border">Relevant</th>
                    <th className="text-left p-4 font-medium border">Manual adjustment</th>
                    <th className="text-left p-4 font-medium border">Adjusted amount</th>
                    <th className="text-left p-4 font-medium border">Expected higher range</th>
                    <th className="text-left p-4 font-medium border">Expected lower range</th>
                    <th className="text-center p-4 font-medium border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materialityTable.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center p-12 text-gray-500 border">
                        No metrics added yet. Click "Add" to create your first metric item.
                      </td>
                    </tr>
                  ) : (
                    materialityTable.map((item: MaterialityMetricItem, index: number) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-2 border">
                          <Input
                            value={item.metrics}
                            onChange={(e) => handleTableItemChange(item.id, 'metrics', e.target.value)}
                            placeholder="Enter metrics..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.benchmark}
                            onChange={(e) => handleTableItemChange(item.id, 'benchmark', e.target.value)}
                            placeholder="Enter benchmark..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.mbt}
                            onChange={(e) => handleTableItemChange(item.id, 'mbt', e.target.value)}
                            placeholder="Enter MBT..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.amount}
                            onChange={(e) => handleTableItemChange(item.id, 'amount', e.target.value)}
                            placeholder="Enter amount..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Select
                            value={item.metricType}
                            onValueChange={(value: 'Gross' | 'Net') => handleTableItemChange(item.id, 'metricType', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Gross">Gross</SelectItem>
                              <SelectItem value="Net">Net</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-center border">
                          <Checkbox
                            checked={item.relevant}
                            onCheckedChange={(checked) => handleTableItemChange(item.id, 'relevant', !!checked)}
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.manualAdjustment}
                            onChange={(e) => handleTableItemChange(item.id, 'manualAdjustment', e.target.value)}
                            placeholder="Enter adjustment..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.adjustedAmount}
                            onChange={(e) => handleTableItemChange(item.id, 'adjustedAmount', e.target.value)}
                            placeholder="Enter adjusted amount..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.expectedHigherRange}
                            onChange={(e) => handleTableItemChange(item.id, 'expectedHigherRange', e.target.value)}
                            placeholder="Enter higher range..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.expectedLowerRange}
                            onChange={(e) => handleTableItemChange(item.id, 'expectedLowerRange', e.target.value)}
                            placeholder="Enter lower range..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 text-center border">
                          <Button
                            onClick={() => removeTableItem(item.id)}
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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