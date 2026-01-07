import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ProjectFormData } from '@/types/formData';
import { CommentableQuestion } from './Comments';
import { useTranslation } from '@/contexts/TranslationContext';

interface DISectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const DISection = ({ formData, onFormDataChange }: DISectionProps) => {
  const { t } = useTranslation();
  const [rafitRows, setRafitRows] = useState([
    { id: 1, rafit: '', itLayer: '', howAddresses: '' }
  ]);
  const [operatorRows, setOperatorRows] = useState([
    { id: 1, role: '', authority: '' }
  ]);

  const addRafitRow = () => {
    const newId = Math.max(...rafitRows.map(r => r.id), 0) + 1;
    setRafitRows([...rafitRows, { id: newId, rafit: '', itLayer: '', howAddresses: '' }]);
  };

  const removeRafitRow = (id: number) => {
    setRafitRows(rafitRows.filter(row => row.id !== id));
  };

  const updateRafitRow = (id: number, field: string, value: string) => {
    setRafitRows(rafitRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addOperatorRow = () => {
    const newId = Math.max(...operatorRows.map(r => r.id), 0) + 1;
    setOperatorRows([...operatorRows, { id: newId, role: '', authority: '' }]);
  };

  const removeOperatorRow = (id: number) => {
    setOperatorRows(operatorRows.filter(row => row.id !== id));
  };

  const updateOperatorRow = (id: number, field: string, value: string) => {
    setOperatorRows(operatorRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleRadioChange = (field: string, value: string) => {
    onFormDataChange({ [field]: value });
  };

  const handleToggleChange = (field: string, value: string) => {
    onFormDataChange({ [field]: value });
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onFormDataChange({ [field]: checked });
  };

  return (
    <CommentableQuestion fieldId="di_main" label={t('di.gitcTitle')}>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-2">
          {t('di.understandEvaluate')}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>{t('di.gitcReference')}</strong> AD 1.1APD-1
        </p>
        <p className="text-sm text-gray-600 mb-4">{t('di.passwordConfig')}</p>
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm mb-4">
            {t('di.documentPerformance')}
          </p>
          <p className="text-sm font-medium mb-2">
            {t('di.relevantRafit')}
          </p>
        </CardContent>
      </Card>

      {/* RAFIT Table */}
      <Card>
        <CardHeader className="bg-blue-800 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">
              <div className="grid grid-cols-3 gap-4 w-full">
                <span>{t('di.rafit')}</span>
                <span>{t('di.itLayer')}</span>
                <span>{t('di.howAddresses')}</span>
              </div>
            </CardTitle>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-blue-700"
              onClick={addRafitRow}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="sr-only">
              <TableRow>
                <TableHead>{t('di.rafit')}</TableHead>
                <TableHead>{t('di.itLayer')}</TableHead>
                <TableHead>{t('di.howAddresses')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rafitRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="p-2">
                    <Input
                      value={row.rafit}
                      onChange={(e) => updateRafitRow(row.id, 'rafit', e.target.value)}
                      placeholder="Enter RAFIT"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={row.itLayer}
                      onChange={(e) => updateRafitRow(row.id, 'itLayer', e.target.value)}
                      placeholder="Enter IT layer"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={row.howAddresses}
                      onChange={(e) => updateRafitRow(row.id, 'howAddresses', e.target.value)}
                      placeholder="How it addresses the RAFIT"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    {rafitRows.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRafitRow(row.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Control Attributes Question */}
      <Card>
        <CardHeader className="bg-blue-800 text-white">
          <CardTitle className="text-sm font-medium">
            {t('di.controlAttributesJudgment')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex">
            <Button
              variant={formData.control_attributes_judgment === 'true' ? 'default' : 'outline'}
              size="sm"
              className="rounded-r-none"
              onClick={() => handleToggleChange('control_attributes_judgment', 'true')}
            >
              {t('di.true')}
            </Button>
            <Button
              variant={formData.control_attributes_judgment === 'false' ? 'default' : 'outline'}
              size="sm"
              className="rounded-l-none"
              onClick={() => handleToggleChange('control_attributes_judgment', 'false')}
            >
              {t('di.false')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Determine the nature of procedures */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t('di.determineNature')}</h3>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label className="text-sm font-medium mb-2 block">{t('di.nature')}</Label>
              <div className="flex">
                <Button
                  variant={formData.procedure_nature === 'AUTOMATED' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => handleToggleChange('procedure_nature', 'AUTOMATED')}
                >
                  {t('di.automated')}
                </Button>
                <Button
                  variant={formData.procedure_nature === 'MANUAL' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => handleToggleChange('procedure_nature', 'MANUAL')}
                >
                  {t('di.manual')}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">{t('di.type')}</Label>
              <div className="flex">
                <Button
                  variant={formData.procedure_type === 'DETECTIVE' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => handleToggleChange('procedure_type', 'DETECTIVE')}
                >
                  {t('di.detective')}
                </Button>
                <Button
                  variant={formData.procedure_type === 'PREVENTIVE' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => handleToggleChange('procedure_type', 'PREVENTIVE')}
                >
                  {t('di.preventive')}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-sm font-medium mb-2 block">{t('di.frequency')}</Label>
            <Input 
              value={formData.procedure_frequency || "Ad-hoc"} 
              onChange={(e) => onFormDataChange({ procedure_frequency: e.target.value })}
              placeholder={t('di.frequency')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add control operator(s) */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t('di.addControlOperators')}</h3>
          
          <Card>
            <CardHeader className="bg-blue-800 text-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <span>{t('di.controlOperatorRole')}</span>
                    <span>{t('di.assessAuthority')}</span>
                  </div>
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white hover:bg-blue-700"
                  onClick={addOperatorRow}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="sr-only">
                  <TableRow>
                    <TableHead>{t('di.controlOperatorRole')}</TableHead>
                    <TableHead>{t('di.assessAuthority')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operatorRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="p-2">
                        <Input
                          value={row.role}
                          onChange={(e) => updateOperatorRow(row.id, 'role', e.target.value)}
                          placeholder="Enter role/name"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          value={row.authority}
                          onChange={(e) => updateOperatorRow(row.id, 'authority', e.target.value)}
                          placeholder="Assess authority and competence"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        {operatorRows.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeOperatorRow(row.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Authority Questions */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-sm mb-3">
              {t('di.authorityQuestion')}
            </p>
            <RadioGroup 
              value={formData.operator_authority || ""} 
              onValueChange={(value) => handleRadioChange('operator_authority', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="authority-yes" />
                  <Label htmlFor="authority-yes">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="authority-no" />
                  <Label htmlFor="authority-no">{t('common.no')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-selected" id="authority-not-selected" />
                  <Label htmlFor="authority-not-selected">{t('di.notSelected')}</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Information Understanding */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t('di.informationUsed')}</h3>
          <div>
            <p className="text-sm mb-3">
              {t('di.isInformationUsed')}
            </p>
            <RadioGroup 
              value={formData.information_used || ""} 
              onValueChange={(value) => handleRadioChange('information_used', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="info-yes" />
                  <Label htmlFor="info-yes">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="info-no" />
                  <Label htmlFor="info-no">{t('common.no')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-selected" id="info-not-selected" />
                  <Label htmlFor="info-not-selected">{t('di.notSelected')}</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Evaluate design and implementation */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t('di.evaluateDesign')}</h3>
          <p className="text-sm mb-4">
            {t('di.documentProcedures')}
          </p>
          
          <div className="flex space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inquiry"
                checked={formData.eval_inquiry || false}
                onCheckedChange={(checked) => handleCheckboxChange('eval_inquiry', !!checked)}
              />
              <Label htmlFor="inquiry">{t('di.inquiry')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inspection"
                checked={formData.eval_inspection || false}
                onCheckedChange={(checked) => handleCheckboxChange('eval_inspection', !!checked)}
              />
              <Label htmlFor="inspection">{t('di.inspection')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="observation"
                checked={formData.eval_observation || false}
                onCheckedChange={(checked) => handleCheckboxChange('eval_observation', !!checked)}
              />
              <Label htmlFor="observation">{t('di.observation')}</Label>
            </div>
          </div>

          <Textarea
            placeholder="Veuillez vous référer aux travaux documentés dans l'engagement 'Cromology Service Reporting audit 2023'."
            value={formData.eval_procedures_documentation || ""}
            onChange={(e) => onFormDataChange({ eval_procedures_documentation: e.target.value })}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Conclude on design and implementation */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-medium mb-4">{t('di.concludeDesign')}</h3>
          
          <div>
            <p className="text-sm mb-3">
              <strong>{t('di.design')}:</strong> {t('di.designQuestion')}
            </p>
            <RadioGroup 
              value={formData.design_conclusion || ""} 
              onValueChange={(value) => handleRadioChange('design_conclusion', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="design-yes" />
                  <Label htmlFor="design-yes">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="design-no" />
                  <Label htmlFor="design-no">{t('common.no')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-selected" id="design-not-selected" />
                  <Label htmlFor="design-not-selected">{t('di.notSelected')}</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <p className="text-sm mb-3">
              <strong>{t('di.implementation')}:</strong> {t('di.implementationQuestion')}
            </p>
            <RadioGroup 
              value={formData.implementation_conclusion || ""} 
              onValueChange={(value) => handleRadioChange('implementation_conclusion', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="impl-yes" />
                  <Label htmlFor="impl-yes">{t('common.yes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="impl-no" />
                  <Label htmlFor="impl-no">{t('common.no')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-selected" id="impl-not-selected" />
                  <Label htmlFor="impl-not-selected">{t('di.notSelected')}</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('di.planOperatingTest')}</span>
              <div className="flex">
                <Button
                  variant={formData.plan_operating_test === 'NO' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => handleToggleChange('plan_operating_test', 'NO')}
                >
                  {t('common.no').toUpperCase()}
                </Button>
                <Button
                  variant={formData.plan_operating_test === 'YES' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => handleToggleChange('plan_operating_test', 'YES')}
                >
                  {t('common.yes').toUpperCase()}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </CommentableQuestion>
  );
};

export default DISection;