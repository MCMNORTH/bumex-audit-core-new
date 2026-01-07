import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { ProjectFormData } from '@/types/formData';
import { CommentableQuestion } from './Comments';

interface ComptesAPouvoirSectionProps {
  formData: ProjectFormData;
  handleFormDataChange: (field: string, value: any) => void;
}

interface ProcedureRow {
  id: string;
  inquire: boolean;
  inspect: boolean;
  observe: boolean;
  reperform: boolean;
  involvesJudgment: 'true' | 'false' | '';
}

const ComptesAPouvoirSection: React.FC<ComptesAPouvoirSectionProps> = ({
  formData,
  handleFormDataChange
}) => {
  const handleCheckboxChange = (field: string, checked: boolean) => {
    handleFormDataChange(field, checked);
  };

  const handleToggleChange = (field: string, value: string) => {
    handleFormDataChange(field, value);
  };

  const handleProcedureChange = (id: string, field: keyof ProcedureRow, value: any) => {
    const procedures = formData.comptesaPouvoir_procedures || [];
    const updatedProcedures = procedures.map((proc: ProcedureRow) =>
      proc.id === id ? { ...proc, [field]: value } : proc
    );
    handleFormDataChange('comptesaPouvoir_procedures', updatedProcedures);
  };

  const addProcedureRow = () => {
    const procedures = formData.comptesaPouvoir_procedures || [];
    const newProcedure: ProcedureRow = {
      id: Date.now().toString(),
      inquire: false,
      inspect: false,
      observe: false,
      reperform: false,
      involvesJudgment: ''
    };
    handleFormDataChange('comptesaPouvoir_procedures', [...procedures, newProcedure]);
  };

  const removeProcedureRow = (id: string) => {
    const procedures = formData.comptesaPouvoir_procedures || [];
    const updatedProcedures = procedures.filter((proc: ProcedureRow) => proc.id !== id);
    handleFormDataChange('comptesaPouvoir_procedures', updatedProcedures);
  };

  return (
    <CommentableQuestion fieldId="comptes_pouvoir_main" label="Comptes à Pouvoir">
    <div className="space-y-6">
      {/* Assess the risk associated with the control (RAWTC) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Assess the risk associated with the control (RAWTC)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="font-medium mb-3">Consider the following factors to determine RAWTC:</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-impact"
                  checked={formData.comptesaPouvoir_rawtc_impact || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_impact', checked as boolean)}
                />
                <Label htmlFor="rawtc-impact" className="text-sm">
                  The general IT control has a greater impact on the effective operation of the automated control(s) it supports
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-deficiencies"
                  checked={formData.comptesaPouvoir_rawtc_deficiencies || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_deficiencies', checked as boolean)}
                />
                <Label htmlFor="rawtc-deficiencies" className="text-sm">
                  Deficiencies were identified in CERAMIC that relate to this general IT control
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-infrequent"
                  checked={formData.comptesaPouvoir_rawtc_infrequent || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_infrequent', checked as boolean)}
                />
                <Label htmlFor="rawtc-infrequent" className="text-sm">
                  - The general IT control operates infrequently
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-competence"
                  checked={formData.comptesaPouvoir_rawtc_competence || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_competence', checked as boolean)}
                />
                <Label htmlFor="rawtc-competence" className="text-sm">
                  - Issues with the competence of personnel / change in key personnel performing the general IT control or monitoring its performance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-complex"
                  checked={formData.comptesaPouvoir_rawtc_complex || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_complex', checked as boolean)}
                />
                <Label htmlFor="rawtc-complex" className="text-sm">
                  - Nature of the general IT control is complex
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-prior-deficiencies"
                  checked={formData.comptesaPouvoir_rawtc_prior_deficiencies || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_prior_deficiencies', checked as boolean)}
                />
                <Label htmlFor="rawtc-prior-deficiencies" className="text-sm">
                  - Deficiencies identified in prior periods
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-changes"
                  checked={formData.comptesaPouvoir_rawtc_changes || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_changes', checked as boolean)}
                />
                <Label htmlFor="rawtc-changes" className="text-sm">
                  - Changes to the general IT control since it was previously tested
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-judgments"
                  checked={formData.comptesaPouvoir_rawtc_judgments || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_judgments', checked as boolean)}
                />
                <Label htmlFor="rawtc-judgments" className="text-sm">
                  - Significance of judgments made in the general IT control operation
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-other"
                  checked={formData.comptesaPouvoir_rawtc_other || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_other', checked as boolean)}
                />
                <Label htmlFor="rawtc-other" className="text-sm">
                  Other factor(s)
                </Label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                S
              </div>
              <span className="text-sm">Significant</span>
            </div>
            <div className="flex">
              <Button
                variant={formData.comptesaPouvoir_rawtc_significant === 'true' ? 'default' : 'outline'}
                size="sm"
                className="rounded-r-none"
                onClick={() => handleToggleChange('comptesaPouvoir_rawtc_significant', 'true')}
              >
                Yes
              </Button>
              <Button
                variant={formData.comptesaPouvoir_rawtc_significant === 'false' ? 'default' : 'outline'}
                size="sm"
                className="rounded-l-none"
                onClick={() => handleToggleChange('comptesaPouvoir_rawtc_significant', 'false')}
              >
                No
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Label className="text-sm font-medium">Assessed RAWTC</Label>
            <Input 
              value={formData.comptesaPouvoir_assessed_rawtc || ''}
              onChange={(e) => handleFormDataChange('comptesaPouvoir_assessed_rawtc', e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Design procedures to obtain persuasive evidence */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Design procedures to obtain persuasive evidence
          </CardTitle>
          <Button
            onClick={addProcedureRow}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block">Determine the nature of procedures</Label>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-600 hover:bg-blue-600">
                  <TableHead className="text-white font-medium">Inquire</TableHead>
                  <TableHead className="text-white font-medium">Inspect</TableHead>
                  <TableHead className="text-white font-medium">Observe</TableHead>
                  <TableHead className="text-white font-medium">Reperform</TableHead>
                  <TableHead className="text-white font-medium">Involves judgment</TableHead>
                  <TableHead className="text-white font-medium w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(formData.comptesaPouvoir_procedures || []).map((procedure: ProcedureRow) => (
                  <TableRow key={procedure.id}>
                    <TableCell>
                      <Checkbox
                        checked={procedure.inquire}
                        onCheckedChange={(checked) => handleProcedureChange(procedure.id, 'inquire', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={procedure.inspect}
                        onCheckedChange={(checked) => handleProcedureChange(procedure.id, 'inspect', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={procedure.observe}
                        onCheckedChange={(checked) => handleProcedureChange(procedure.id, 'observe', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={procedure.reperform}
                        onCheckedChange={(checked) => handleProcedureChange(procedure.id, 'reperform', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        <Button
                          variant={procedure.involvesJudgment === 'true' ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-r-none px-2 py-1 text-xs"
                          onClick={() => handleProcedureChange(procedure.id, 'involvesJudgment', 'true')}
                        >
                          Yes
                        </Button>
                        <Button
                          variant={procedure.involvesJudgment === 'false' ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-l-none px-2 py-1 text-xs"
                          onClick={() => handleProcedureChange(procedure.id, 'involvesJudgment', 'false')}
                        >
                          No
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProcedureRow(procedure.id)}
                        className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Label className="text-sm font-medium mb-2 block">Describe the procedures to be performed</Label>
            <Textarea
              value={formData.comptesaPouvoir_procedures_description || ''}
              onChange={(e) => handleFormDataChange('comptesaPouvoir_procedures_description', e.target.value)}
              placeholder="Veuillez vous référer aux travaux documentés dans l'engagement Cromology Service Reporting audit 2023."
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Determine the timing of procedures */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Determine the timing of procedures
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-sm mb-3">Determine when we obtain the evidence about the operating effectiveness of the general IT control</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <Label className="text-sm font-medium">Period covered by audit procedures</Label>
                <Input
                  type="date"
                  value={formData.comptesaPouvoir_period_start || ''}
                  onChange={(e) => handleFormDataChange('comptesaPouvoir_period_start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm text-gray-500">through</span>
              </div>
              <div>
                <Input
                  type="date"
                  value={formData.comptesaPouvoir_period_end || ''}
                  onChange={(e) => handleFormDataChange('comptesaPouvoir_period_end', e.target.value)}
                  className="mt-6"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Determine the extent of procedures</h4>
            <p className="text-sm mb-2">Define the population and how we determined the population is complete</p>
            <Textarea
              value={formData.comptesaPouvoir_extent_description || ''}
              onChange={(e) => handleFormDataChange('comptesaPouvoir_extent_description', e.target.value)}
              placeholder="Veuillez vous référer aux travaux documentés dans l'engagement Cromology Service Reporting audit 2023."
              className="min-h-24"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">Did we use internal information to select items for testing?</Label>
            <div className="flex">
              <Button
                variant={formData.comptesaPouvoir_internal_info === 'true' ? 'default' : 'outline'}
                size="sm"
                className="rounded-r-none"
                onClick={() => handleToggleChange('comptesaPouvoir_internal_info', 'true')}
              >
                Yes
              </Button>
              <Button
                variant={formData.comptesaPouvoir_internal_info === 'false' ? 'default' : 'outline'}
                size="sm"
                className="rounded-l-none"
                onClick={() => handleToggleChange('comptesaPouvoir_internal_info', 'false')}
              >
                No
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Determine sample size & Test operating effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Determine sample size
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Control sample size</Label>
            <Input
              type="number"
              value={formData.comptesaPouvoir_sample_size || ''}
              onChange={(e) => handleFormDataChange('comptesaPouvoir_sample_size', e.target.value)}
              placeholder="0"
              className="w-32"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="increased-sample"
                checked={formData.comptesaPouvoir_increased_sample || false}
                onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_increased_sample', checked as boolean)}
              />
              <Label htmlFor="increased-sample" className="text-sm">
                We increased the control sample size over the control sample size table.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unpredictability"
                checked={formData.comptesaPouvoir_unpredictability || false}
                onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_unpredictability', checked as boolean)}
              />
              <Label htmlFor="unpredictability" className="text-sm">
                Check if procedure incorporates an element of unpredictability
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test operating effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Test operating effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="font-medium mb-3">Obtain evidence about the operating effectiveness of the control</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sampling-tool"
                  checked={formData.comptesaPouvoir_sampling_tool || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_sampling_tool', checked as boolean)}
                />
                <Label htmlFor="sampling-tool" className="text-sm">
                  Use sampling tool to select samples and generate testwork template.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generate-template"
                  checked={formData.comptesaPouvoir_generate_template || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_generate_template', checked as boolean)}
                />
                <Label htmlFor="generate-template" className="text-sm">
                  Generate testwork template and manually select samples.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attach-documentation"
                  checked={formData.comptesaPouvoir_attach_documentation || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_attach_documentation', checked as boolean)}
                />
                <Label htmlFor="attach-documentation" className="text-sm">
                  Attach other testing documentation that includes: the control operator(s) and whether they are consistent with our assessment in the evaluation of design and implementation, and procedures over each of the attributes.
                </Label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">Based on procedures performed and evidence obtained were any deviations identified?</Label>
            <div className="flex">
              <Button
                variant={formData.comptesaPouvoir_deviations === 'true' ? 'default' : 'outline'}
                size="sm"
                className="rounded-r-none"
                onClick={() => handleToggleChange('comptesaPouvoir_deviations', 'true')}
              >
                Yes
              </Button>
              <Button
                variant={formData.comptesaPouvoir_deviations === 'false' ? 'default' : 'outline'}
                size="sm"
                className="rounded-l-none"
                onClick={() => handleToggleChange('comptesaPouvoir_deviations', 'false')}
              >
                No
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Result of test of operating effectiveness</Label>
            <Input
              value={formData.comptesaPouvoir_test_result || ''}
              onChange={(e) => handleFormDataChange('comptesaPouvoir_test_result', e.target.value)}
              placeholder="Effective"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Results of test of operating effectiveness for the period tested</Label>
            <Input
              value={formData.comptesaPouvoir_period_result || ''}
              onChange={(e) => handleFormDataChange('comptesaPouvoir_period_result', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
    </CommentableQuestion>
  );
};

export default ComptesAPouvoirSection;