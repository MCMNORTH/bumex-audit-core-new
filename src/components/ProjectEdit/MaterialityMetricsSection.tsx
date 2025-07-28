import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import { ProjectFormData, MaterialityMetricItem, QualitativeFactorItem, MaterialityAssessmentItem } from '@/types/formData';

interface MaterialityMetricsSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const MaterialityMetricsSection = ({ formData, onFormDataChange }: MaterialityMetricsSectionProps) => {
  const materialityTable = (formData as any).materiality_metrics_table || [];
  const qualitativeFactorsTable = (formData as any).qualitative_factors_table || [];
  const materialityAssessmentTable = (formData as any).materiality_assessment_table || [];

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

  const handleMaterialityAssessmentChange = (id: string, field: keyof MaterialityAssessmentItem, value: string) => {
    const updatedTable = materialityAssessmentTable.map((item: MaterialityAssessmentItem) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ materiality_assessment_table: updatedTable } as any);
  };

  const addNewMaterialityAssessmentItem = () => {
    const newItem: MaterialityAssessmentItem = {
      id: Date.now().toString(),
      metrics: '',
      benchmark: '',
      amountOfMetric: '',
      materialityPercentage: '',
      guidelineRange: ''
    };
    onFormDataChange({ materiality_assessment_table: [...materialityAssessmentTable, newItem] } as any);
  };

  const removeMaterialityAssessmentItem = (id: string) => {
    const updatedTable = materialityAssessmentTable.filter((item: MaterialityAssessmentItem) => item.id !== id);
    onFormDataChange({ materiality_assessment_table: updatedTable } as any);
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

    {/* Materiality Level Section */}
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="space-y-6">
          <p className="text-sm font-bold text-gray-900">
            Establish a materiality level for the financial statements as a whole as a specified amount
          </p>

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
                <Label className="text-sm font-medium">Amount of Materiality</Label>
              </div>
              <div>
                <Input
                  value={(formData as any).current_audit_materiality_amount || ''}
                  onChange={(e) => onFormDataChange({ current_audit_materiality_amount: e.target.value })}
                  placeholder="Enter amount..."
                />
              </div>
              <div>
                <Input
                  value={(formData as any).prior_audit_materiality_amount || ''}
                  onChange={(e) => onFormDataChange({ prior_audit_materiality_amount: e.target.value })}
                  placeholder="Enter amount..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Assess the appropriateness of materiality
            </h4>

            <div className="flex items-center justify-end mb-4">
              <Button 
                onClick={addNewMaterialityAssessmentItem}
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
                    <th className="text-left p-4 font-medium border">Amount of the metric</th>
                    <th className="text-left p-4 font-medium border">Materiality as a %</th>
                    <th className="text-left p-4 font-medium border">Guideline range</th>
                    <th className="text-center p-4 font-medium border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materialityAssessmentTable.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-gray-500 border">
                        No assessment items added yet. Click "Add" to create your first assessment item.
                      </td>
                    </tr>
                  ) : (
                    materialityAssessmentTable.map((item: MaterialityAssessmentItem, index: number) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-2 border">
                          <Input
                            value={item.metrics}
                            onChange={(e) => handleMaterialityAssessmentChange(item.id, 'metrics', e.target.value)}
                            placeholder="Enter metrics..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.benchmark}
                            onChange={(e) => handleMaterialityAssessmentChange(item.id, 'benchmark', e.target.value)}
                            placeholder="Enter benchmark..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.amountOfMetric}
                            onChange={(e) => handleMaterialityAssessmentChange(item.id, 'amountOfMetric', e.target.value)}
                            placeholder="Enter amount..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.materialityPercentage}
                            onChange={(e) => handleMaterialityAssessmentChange(item.id, 'materialityPercentage', e.target.value)}
                            placeholder="Enter percentage..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            value={item.guidelineRange}
                            onChange={(e) => handleMaterialityAssessmentChange(item.id, 'guidelineRange', e.target.value)}
                            placeholder="Enter range..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-2 text-center border">
                          <Button
                            onClick={() => removeMaterialityAssessmentItem(item.id)}
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

          {/* Materiality as a percentage section */}
          <div className="mt-8 space-y-4">
            <p className="text-sm text-gray-900">
              Materiality as a percentage of our benchmark between the current and prior audits
            </p>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Current audit</Label>
                <Input
                  value={(formData as any).current_audit_materiality_percentage || ''}
                  onChange={(e) => onFormDataChange({ current_audit_materiality_percentage: e.target.value })}
                  placeholder="Enter percentage..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Prior audit</Label>
                <Input
                  value={(formData as any).prior_audit_materiality_percentage || ''}
                  onChange={(e) => onFormDataChange({ prior_audit_materiality_percentage: e.target.value })}
                  placeholder="Enter percentage..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Does a circumstance exist for DPP consultation?</Label>
              <RadioGroup
                value={(formData as any).dpp_consultation_required || ''}
                onValueChange={(value) => onFormDataChange({ dpp_consultation_required: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="dpp-yes" />
                  <Label htmlFor="dpp-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="dpp-no" />
                  <Label htmlFor="dpp-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Lower Materiality Section */}
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Determine whether to establish a lower materiality for particular accounts or disclosures
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Are there particular accounts or disclosures where misstatements lower than the materiality established for the financial statements as a whole be considered material?
        </p>

        <div className="space-y-3">
          <RadioGroup
            value={(formData as any).lower_materiality_required || ''}
            onValueChange={(value) => onFormDataChange({ lower_materiality_required: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="lower-materiality-yes" />
              <Label htmlFor="lower-materiality-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="lower-materiality-no" />
              <Label htmlFor="lower-materiality-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>

    {/* Performance Materiality Container */}
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Determine performance materiality
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Consider the factors that affect aggregation risk
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="text-left p-4 font-medium border">
                  Document the impact of the following factors on our assessment of aggregation risk
                </th>
                <th className="text-center p-4 font-medium border">
                  Impact on the level of aggregation risk
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="p-4 border">
                  Deficiencies in the CERAMIC
                </td>
                <td className="p-4 border">
                  <RadioGroup
                    value={(formData as any).deficiencies_ceramic || ''}
                    onValueChange={(value) => onFormDataChange({ deficiencies_ceramic: value })}
                    className="flex items-center justify-center space-x-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-greater" id="ceramic-not-greater" />
                      <Label htmlFor="ceramic-not-greater">Not Greater</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="greater" id="ceramic-greater" />
                      <Label htmlFor="ceramic-greater">Greater</Label>
                    </div>
                  </RadioGroup>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 border">
                  Number and severity of deficiencies in control activities, including pervasiveness of internal control deficiencies
                </td>
                <td className="p-4 border">
                  <RadioGroup
                    value={(formData as any).control_deficiencies || ''}
                    onValueChange={(value) => onFormDataChange({ control_deficiencies: value })}
                    className="flex items-center justify-center space-x-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-greater" id="control-not-greater" />
                      <Label htmlFor="control-not-greater">Not Greater</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="greater" id="control-greater" />
                      <Label htmlFor="control-greater">Greater</Label>
                    </div>
                  </RadioGroup>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 border">
                  History of misstatements (the nature, cause (if known), and amount) that were accumulated in audits of the financial statements of prior periods (both corrected or uncorrected)
                </td>
                <td className="p-4 border">
                  <RadioGroup
                    value={(formData as any).history_misstatements || ''}
                    onValueChange={(value) => onFormDataChange({ history_misstatements: value })}
                    className="flex items-center justify-center space-x-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-greater" id="history-not-greater" />
                      <Label htmlFor="history-not-greater">Not Greater</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="greater" id="history-greater" />
                      <Label htmlFor="history-greater">Greater</Label>
                    </div>
                  </RadioGroup>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 border">
                  Level of turnover of senior management or key financial reporting personnel
                </td>
                <td className="p-4 border">
                  <RadioGroup
                    value={(formData as any).turnover_management || ''}
                    onValueChange={(value) => onFormDataChange({ turnover_management: value })}
                    className="flex items-center justify-center space-x-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-greater" id="turnover-not-greater" />
                      <Label htmlFor="turnover-not-greater">Not Greater</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="greater" id="turnover-greater" />
                      <Label htmlFor="turnover-greater">Greater</Label>
                    </div>
                  </RadioGroup>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 border">
                  Management's preparedness/willingness to correct misstatements
                </td>
                <td className="p-4 border">
                  <RadioGroup
                    value={(formData as any).management_preparedness || ''}
                    onValueChange={(value) => onFormDataChange({ management_preparedness: value })}
                    className="flex items-center justify-center space-x-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-greater" id="management-not-greater" />
                      <Label htmlFor="management-not-greater">Not Greater</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="greater" id="management-greater" />
                      <Label htmlFor="management-greater">Greater</Label>
                    </div>
                  </RadioGroup>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 border">
                  Proportion of accounts not identified as significant accounts
                </td>
                <td className="p-4 border">
                  <RadioGroup
                    value={(formData as any).proportion_accounts || ''}
                    onValueChange={(value) => onFormDataChange({ proportion_accounts: value })}
                    className="flex items-center justify-center space-x-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-greater" id="proportion-not-greater" />
                      <Label htmlFor="proportion-not-greater">Not Greater</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="greater" id="proportion-greater" />
                      <Label htmlFor="proportion-greater">Greater</Label>
                    </div>
                  </RadioGroup>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="document-aggregation-risk"
                checked={(formData as any).document_aggregation_risk_considerations || false}
                onCheckedChange={(checked) => onFormDataChange({ document_aggregation_risk_considerations: !!checked })}
              />
              <Label htmlFor="document-aggregation-risk" className="text-sm">
                Document any further considerations in assessing aggregation risk.
              </Label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Assess the level of aggregation risk
              </p>
              
              <div className="flex flex-wrap gap-2">
                {['Low', 'Normal', 'Increased', 'High', 'Other Circumstances'].map((option) => (
                  <Button
                    key={option}
                    variant={(formData as any).aggregation_risk_level === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFormDataChange({ aggregation_risk_level: option })}
                    className="h-8"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div></div>
                <div className="text-center">
                  <Label className="text-sm font-medium">Current Audit</Label>
                </div>
                <div className="text-center">
                  <Label className="text-sm font-medium">Prior Audit</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <Label className="text-sm font-medium">Level of aggregation risk</Label>
                  </div>
                  <div>
                    <Input
                      value={(formData as any).current_audit_aggregation_risk_level || ''}
                      onChange={(e) => onFormDataChange({ current_audit_aggregation_risk_level: e.target.value })}
                      placeholder="Enter level..."
                    />
                  </div>
                  <div>
                    <Input
                      value={(formData as any).prior_audit_aggregation_risk_level || ''}
                      onChange={(e) => onFormDataChange({ prior_audit_aggregation_risk_level: e.target.value })}
                      placeholder="Enter level..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <Label className="text-sm font-medium">Performance materiality %</Label>
                  </div>
                  <div>
                    <Input
                      value={(formData as any).current_audit_performance_materiality_percentage || ''}
                      onChange={(e) => onFormDataChange({ current_audit_performance_materiality_percentage: e.target.value })}
                      placeholder="Enter percentage..."
                    />
                  </div>
                  <div>
                    <Input
                      value={(formData as any).prior_audit_performance_materiality_percentage || ''}
                      onChange={(e) => onFormDataChange({ prior_audit_performance_materiality_percentage: e.target.value })}
                      placeholder="Enter percentage..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <Label className="text-sm font-medium">Performance materiality</Label>
                  </div>
                  <div>
                    <Input
                      value={(formData as any).current_audit_performance_materiality || ''}
                      onChange={(e) => onFormDataChange({ current_audit_performance_materiality: e.target.value })}
                      placeholder="Enter amount..."
                    />
                  </div>
                  <div>
                    <Input
                      value={(formData as any).prior_audit_performance_materiality || ''}
                      onChange={(e) => onFormDataChange({ prior_audit_performance_materiality: e.target.value })}
                      placeholder="Enter amount..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* AMPT Section */}
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Determine the Audit Misstatement Posting Threshold (AMPT)
          </h3>

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
                <Label className="text-sm font-medium">Audit misstatement posting threshold %</Label>
              </div>
              <div>
                <Input
                  value={(formData as any).current_audit_ampt_percentage || ''}
                  onChange={(e) => onFormDataChange({ current_audit_ampt_percentage: e.target.value })}
                  placeholder="Enter percentage..."
                />
              </div>
              <div>
                <Input
                  value={(formData as any).prior_audit_ampt_percentage || ''}
                  onChange={(e) => onFormDataChange({ prior_audit_ampt_percentage: e.target.value })}
                  placeholder="Enter percentage..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <Label className="text-sm font-medium">Audit misstatement posting</Label>
              </div>
              <div>
                <Input
                  value={(formData as any).current_audit_ampt_amount || ''}
                  onChange={(e) => onFormDataChange({ current_audit_ampt_amount: e.target.value })}
                  placeholder="Enter amount..."
                />
              </div>
              <div>
                <Input
                  value={(formData as any).prior_audit_ampt_amount || ''}
                  onChange={(e) => onFormDataChange({ prior_audit_ampt_amount: e.target.value })}
                  placeholder="Enter amount..."
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </>
  );
};

export default MaterialityMetricsSection;