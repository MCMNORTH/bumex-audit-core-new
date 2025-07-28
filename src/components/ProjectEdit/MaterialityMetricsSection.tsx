import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { ProjectFormData, MaterialityMetricItem, QualitativeFactorItem } from '@/types/formData';

interface MaterialityMetricsSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const MaterialityMetricsSection = ({ formData, onFormDataChange }: MaterialityMetricsSectionProps) => {
  const materialityTable = (formData as any).materiality_metrics_table || [];
  const qualitativeFactorsTable = (formData as any).qualitative_factors_table || [];

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

  const handleQualitativeFactorChange = (id: string, field: keyof QualitativeFactorItem, value: string) => {
    const updatedTable = qualitativeFactorsTable.map((item: QualitativeFactorItem) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ qualitative_factors_table: updatedTable } as any);
  };

  const addNewQualitativeFactorItem = () => {
    const newItem: QualitativeFactorItem = {
      id: Date.now().toString(),
      factors: '',
      higherLowerAmount: 'Higher',
      consideration: ''
    };
    onFormDataChange({ qualitative_factors_table: [...qualitativeFactorsTable, newItem] } as any);
  };

  const removeQualitativeFactorItem = (id: string) => {
    const updatedTable = qualitativeFactorsTable.filter((item: QualitativeFactorItem) => item.id !== id);
    onFormDataChange({ qualitative_factors_table: updatedTable } as any);
  };

  return (
    <>
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

          {/* Materiality Metrics Table */}
          <div className="mt-8">
            <div className="flex items-center justify-end mb-4">
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

          {/* Additional Form Sections */}
          <div className="mt-8 space-y-6">
            {/* Not Relevant Metrics Rationale */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                One or more of the presumed metrics in the Metrics and Benchmark Table is not relevant. Document the rationale.
              </Label>
              <Textarea
                value={(formData as any).not_relevant_metrics_rationale || ''}
                onChange={(e) => onFormDataChange({ not_relevant_metrics_rationale: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Document the rationale..."
              />
            </div>

            {/* Current Audit vs Prior Audit Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div></div>
                <div className="text-center">
                  <Label className="text-sm font-medium">Current Audit</Label>
                </div>
                <div className="text-center">
                  <Label className="text-sm font-medium">Prior Audit</Label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">Determine the benchmark</Label>
                </div>
                <div>
                  <Input
                    value={(formData as any).current_audit_total_revenues || ''}
                    onChange={(e) => onFormDataChange({ current_audit_total_revenues: e.target.value })}
                    placeholder="Total revenues"
                  />
                </div>
                <div>
                  <Input
                    value={(formData as any).prior_audit_total_revenues || ''}
                    onChange={(e) => onFormDataChange({ prior_audit_total_revenues: e.target.value })}
                    placeholder="Total revenues"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">Adjusted amount</Label>
                </div>
                <div>
                  <Input
                    value={(formData as any).current_audit_adjusted_amount || ''}
                    onChange={(e) => onFormDataChange({ current_audit_adjusted_amount: e.target.value })}
                    placeholder="Enter adjusted amount..."
                  />
                </div>
                <div>
                  <Input
                    value={(formData as any).prior_audit_adjusted_amount || ''}
                    onChange={(e) => onFormDataChange({ prior_audit_adjusted_amount: e.target.value })}
                    placeholder="Enter adjusted amount..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  checked={(formData as any).prior_audit_benchmark_not_metric || false}
                  onCheckedChange={(checked) => onFormDataChange({ prior_audit_benchmark_not_metric: !!checked })}
                />
                <Label className="text-sm">
                  The prior audit benchmark is not a metric in the current audit
                </Label>
              </div>
            </div>

            {/* Different Benchmark Rationale */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                The benchmark selected is different from the presumed benchmark in the Metrics and Benchmark Table. Document the rationale.
              </Label>
              <Textarea
                value={(formData as any).different_benchmark_rationale || ''}
                onChange={(e) => onFormDataChange({ different_benchmark_rationale: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Document the rationale..."
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Qualitative Factors Section */}
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Establish and assess the appropriateness of materiality
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Consider the influence of qualitative factors when establishing materiality
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-end mb-4">
            <Button 
              onClick={addNewQualitativeFactorItem}
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
                  <th className="text-left p-4 font-medium border">Factors</th>
                  <th className="text-center p-4 font-medium border">Higher/lower amount</th>
                  <th className="text-left p-4 font-medium border">Consideration of qualitative factor(s) on the determination of a higher or lower amount of materiality</th>
                  <th className="text-center p-4 font-medium border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {qualitativeFactorsTable.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-12 text-gray-500 border">
                      No qualitative factors added yet. Click "Add" to create your first factor item.
                    </td>
                  </tr>
                ) : (
                  qualitativeFactorsTable.map((item: QualitativeFactorItem, index: number) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-2 border">
                        <Input
                          value={item.factors}
                          onChange={(e) => handleQualitativeFactorChange(item.id, 'factors', e.target.value)}
                          placeholder="Enter factors..."
                          className="w-full"
                        />
                      </td>
                      <td className="p-2 text-center border">
                        <div className="flex items-center justify-center space-x-2">
                          <span className={item.higherLowerAmount === 'Lower' ? 'text-gray-500' : 'font-medium'}>Higher</span>
                          <Switch
                            checked={item.higherLowerAmount === 'Lower'}
                            onCheckedChange={(checked) => 
                              handleQualitativeFactorChange(item.id, 'higherLowerAmount', checked ? 'Lower' : 'Higher')
                            }
                          />
                          <span className={item.higherLowerAmount === 'Higher' ? 'text-gray-500' : 'font-medium'}>Lower</span>
                        </div>
                      </td>
                      <td className="p-2 border">
                        <Input
                          value={item.consideration}
                          onChange={(e) => handleQualitativeFactorChange(item.id, 'consideration', e.target.value)}
                          placeholder="Enter consideration..."
                          className="w-full"
                        />
                      </td>
                      <td className="p-2 text-center border">
                        <Button
                          onClick={() => removeQualitativeFactorItem(item.id)}
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
      </CardContent>
    </Card>
  </>
  );
};

export default MaterialityMetricsSection;