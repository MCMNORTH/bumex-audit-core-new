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
import { useTranslation } from '@/contexts/TranslationContext';

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
  const { t } = useTranslation();
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
            {t('comptesAPouvoir.assessRawtc')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="font-medium mb-3">{t('comptesAPouvoir.considerFactors')}</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-impact"
                  checked={formData.comptesaPouvoir_rawtc_impact || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_impact', checked as boolean)}
                />
                <Label htmlFor="rawtc-impact" className="text-sm">
                  {t('comptesAPouvoir.greaterImpact')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-deficiencies"
                  checked={formData.comptesaPouvoir_rawtc_deficiencies || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_deficiencies', checked as boolean)}
                />
                <Label htmlFor="rawtc-deficiencies" className="text-sm">
                  {t('comptesAPouvoir.deficienciesCeramic')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-infrequent"
                  checked={formData.comptesaPouvoir_rawtc_infrequent || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_infrequent', checked as boolean)}
                />
                <Label htmlFor="rawtc-infrequent" className="text-sm">
                  {t('comptesAPouvoir.operatesInfrequently')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-competence"
                  checked={formData.comptesaPouvoir_rawtc_competence || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_competence', checked as boolean)}
                />
                <Label htmlFor="rawtc-competence" className="text-sm">
                  {t('comptesAPouvoir.competenceIssues')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-complex"
                  checked={formData.comptesaPouvoir_rawtc_complex || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_complex', checked as boolean)}
                />
                <Label htmlFor="rawtc-complex" className="text-sm">
                  {t('comptesAPouvoir.complexNature')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-prior-deficiencies"
                  checked={formData.comptesaPouvoir_rawtc_prior_deficiencies || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_prior_deficiencies', checked as boolean)}
                />
                <Label htmlFor="rawtc-prior-deficiencies" className="text-sm">
                  {t('comptesAPouvoir.priorDeficiencies')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-changes"
                  checked={formData.comptesaPouvoir_rawtc_changes || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_changes', checked as boolean)}
                />
                <Label htmlFor="rawtc-changes" className="text-sm">
                  {t('comptesAPouvoir.changesSinceTesting')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-judgments"
                  checked={formData.comptesaPouvoir_rawtc_judgments || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_judgments', checked as boolean)}
                />
                <Label htmlFor="rawtc-judgments" className="text-sm">
                  {t('comptesAPouvoir.significanceJudgments')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rawtc-other"
                  checked={formData.comptesaPouvoir_rawtc_other || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_rawtc_other', checked as boolean)}
                />
                <Label htmlFor="rawtc-other" className="text-sm">
                  {t('comptesAPouvoir.otherFactors')}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                S
              </div>
              <span className="text-sm">{t('comptesAPouvoir.significant')}</span>
            </div>
            <div className="flex">
              <Button
                variant={formData.comptesaPouvoir_rawtc_significant === 'true' ? 'default' : 'outline'}
                size="sm"
                className="rounded-r-none"
                onClick={() => handleToggleChange('comptesaPouvoir_rawtc_significant', 'true')}
              >
                {t('common.yes')}
              </Button>
              <Button
                variant={formData.comptesaPouvoir_rawtc_significant === 'false' ? 'default' : 'outline'}
                size="sm"
                className="rounded-l-none"
                onClick={() => handleToggleChange('comptesaPouvoir_rawtc_significant', 'false')}
              >
                {t('common.no')}
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Label className="text-sm font-medium">{t('comptesAPouvoir.assessedRawtc')}</Label>
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
            {t('comptesAPouvoir.designProcedures')}
          </CardTitle>
          <Button
            onClick={addProcedureRow}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('common.add')}
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block">{t('comptesAPouvoir.determineNature')}</Label>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-600 hover:bg-blue-600">
                  <TableHead className="text-white font-medium">{t('comptesAPouvoir.inquire')}</TableHead>
                  <TableHead className="text-white font-medium">{t('comptesAPouvoir.inspect')}</TableHead>
                  <TableHead className="text-white font-medium">{t('comptesAPouvoir.observe')}</TableHead>
                  <TableHead className="text-white font-medium">{t('comptesAPouvoir.reperform')}</TableHead>
                  <TableHead className="text-white font-medium">{t('comptesAPouvoir.involvesJudgment')}</TableHead>
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
                          {t('common.yes')}
                        </Button>
                        <Button
                          variant={procedure.involvesJudgment === 'false' ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-l-none px-2 py-1 text-xs"
                          onClick={() => handleProcedureChange(procedure.id, 'involvesJudgment', 'false')}
                        >
                          {t('common.no')}
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
            <Label className="text-sm font-medium mb-2 block">{t('comptesAPouvoir.describeProcedures')}</Label>
            <Textarea
              value={formData.comptesaPouvoir_procedures_description || ''}
              onChange={(e) => handleFormDataChange('comptesaPouvoir_procedures_description', e.target.value)}
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Determine the timing of procedures */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t('comptesAPouvoir.determineTiming')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-sm mb-3">{t('comptesAPouvoir.determineWhenObtain')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <Label className="text-sm font-medium">{t('comptesAPouvoir.periodCovered')}</Label>
                <Input
                  type="date"
                  value={formData.comptesaPouvoir_period_start || ''}
                  onChange={(e) => handleFormDataChange('comptesaPouvoir_period_start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm text-gray-500">{t('comptesAPouvoir.through')}</span>
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
            <h4 className="font-medium mb-2">{t('comptesAPouvoir.determineExtent')}</h4>
            <p className="text-sm mb-2">{t('comptesAPouvoir.definePopulation')}</p>
            <Textarea
              value={formData.comptesaPouvoir_extent_description || ''}
              onChange={(e) => handleFormDataChange('comptesaPouvoir_extent_description', e.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">{t('comptesAPouvoir.useInternalInfo')}</Label>
            <div className="flex">
              <Button
                variant={formData.comptesaPouvoir_internal_info === 'true' ? 'default' : 'outline'}
                size="sm"
                className="rounded-r-none"
                onClick={() => handleToggleChange('comptesaPouvoir_internal_info', 'true')}
              >
                {t('common.yes')}
              </Button>
              <Button
                variant={formData.comptesaPouvoir_internal_info === 'false' ? 'default' : 'outline'}
                size="sm"
                className="rounded-l-none"
                onClick={() => handleToggleChange('comptesaPouvoir_internal_info', 'false')}
              >
                {t('common.no')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Determine sample size & Test operating effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t('comptesAPouvoir.determineSampleSize')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">{t('comptesAPouvoir.controlSampleSize')}</Label>
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
                {t('comptesAPouvoir.increasedSampleSize')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unpredictability"
                checked={formData.comptesaPouvoir_unpredictability || false}
                onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_unpredictability', checked as boolean)}
              />
              <Label htmlFor="unpredictability" className="text-sm">
                {t('comptesAPouvoir.unpredictability')}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test operating effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t('comptesAPouvoir.testOperatingEffectiveness')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="font-medium mb-3">{t('comptesAPouvoir.obtainEvidence')}</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sampling-tool"
                  checked={formData.comptesaPouvoir_sampling_tool || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_sampling_tool', checked as boolean)}
                />
                <Label htmlFor="sampling-tool" className="text-sm">
                  {t('comptesAPouvoir.useSamplingTool')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generate-template"
                  checked={formData.comptesaPouvoir_generate_template || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_generate_template', checked as boolean)}
                />
                <Label htmlFor="generate-template" className="text-sm">
                  {t('comptesAPouvoir.generateTemplate')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attach-documentation"
                  checked={formData.comptesaPouvoir_attach_documentation || false}
                  onCheckedChange={(checked) => handleCheckboxChange('comptesaPouvoir_attach_documentation', checked as boolean)}
                />
                <Label htmlFor="attach-documentation" className="text-sm">
                  {t('comptesAPouvoir.attachDocumentation')}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">{t('comptesAPouvoir.deviationsIdentified')}</Label>
            <div className="flex">
              <Button
                variant={formData.comptesaPouvoir_deviations === 'true' ? 'default' : 'outline'}
                size="sm"
                className="rounded-r-none"
                onClick={() => handleToggleChange('comptesaPouvoir_deviations', 'true')}
              >
                {t('common.yes')}
              </Button>
              <Button
                variant={formData.comptesaPouvoir_deviations === 'false' ? 'default' : 'outline'}
                size="sm"
                className="rounded-l-none"
                onClick={() => handleToggleChange('comptesaPouvoir_deviations', 'false')}
              >
                {t('common.no')}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">{t('comptesAPouvoir.testResult')}</Label>
            <Input
              value={formData.comptesaPouvoir_test_result || ''}
              onChange={(e) => handleFormDataChange('comptesaPouvoir_test_result', e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">{t('comptesAPouvoir.periodTestResult')}</Label>
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