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
    <CommentableQuestion fieldId="di_main" label="D&I General IT Controls">
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Understand and evaluate the design and implementation of general IT controls
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>General IT control:</strong> AD 1.1APD-1
        </p>
        <p className="text-sm text-gray-600 mb-4">Configuration des mots de passe</p>
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm mb-4">
            Document how the performance of the general IT control is documented, including, if applicable, the criteria/threshold for investigation used 
            to identify outliers. If information is used by the control operator and addressed by a general IT control attribute(s), also document how the 
            general IT control attribute(s) evaluates the relevance and reliability of the information.
          </p>
          <p className="text-sm font-medium mb-2">
            Relevant RAFIT(s) addressed by the general IT control for each relevant IT layer.
          </p>
        </CardContent>
      </Card>

      {/* RAFIT Table */}
      <Card>
        <CardHeader className="bg-blue-800 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">
              <div className="grid grid-cols-3 gap-4 w-full">
                <span>RAFIT(s)</span>
                <span>IT layer(s)</span>
                <span>How the general IT control addresses the RAFIT</span>
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
                <TableHead>RAFIT(s)</TableHead>
                <TableHead>IT layer(s)</TableHead>
                <TableHead>How the general IT control addresses the RAFIT</TableHead>
                <TableHead>Actions</TableHead>
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
            Do any of the control attributes involve judgment?
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
              True
            </Button>
            <Button
              variant={formData.control_attributes_judgment === 'false' ? 'default' : 'outline'}
              size="sm"
              className="rounded-l-none"
              onClick={() => handleToggleChange('control_attributes_judgment', 'false')}
            >
              False
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Determine the nature of procedures */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Determine the nature of procedures</h3>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label className="text-sm font-medium mb-2 block">Nature</Label>
              <div className="flex">
                <Button
                  variant={formData.procedure_nature === 'AUTOMATED' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => handleToggleChange('procedure_nature', 'AUTOMATED')}
                >
                  AUTOMATED
                </Button>
                <Button
                  variant={formData.procedure_nature === 'MANUAL' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => handleToggleChange('procedure_nature', 'MANUAL')}
                >
                  MANUAL
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Type</Label>
              <div className="flex">
                <Button
                  variant={formData.procedure_type === 'DETECTIVE' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => handleToggleChange('procedure_type', 'DETECTIVE')}
                >
                  DETECTIVE
                </Button>
                <Button
                  variant={formData.procedure_type === 'PREVENTIVE' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => handleToggleChange('procedure_type', 'PREVENTIVE')}
                >
                  PREVENTIVE
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-sm font-medium mb-2 block">Frequency</Label>
            <Input 
              value={formData.procedure_frequency || "Ad-hoc"} 
              onChange={(e) => onFormDataChange({ procedure_frequency: e.target.value })}
              placeholder="Enter frequency"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add control operator(s) */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Add control operator(s)</h3>
          
          <Card>
            <CardHeader className="bg-blue-800 text-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <span>Control operator role and/or name</span>
                    <span>Assess the authority and competence of the control operator(s)</span>
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
                    <TableHead>Control operator role and/or name</TableHead>
                    <TableHead>Assess the authority and competence of the control operator(s)</TableHead>
                    <TableHead>Actions</TableHead>
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
              Based on our understanding of the company's organizational structure does the control operator(s) have appropriate authority to 
              perform the control effectively (i.e. the ability to sufficiently challenge process owners in a way that would influence their behavior)?
            </p>
            <RadioGroup 
              value={formData.operator_authority || ""} 
              onValueChange={(value) => handleRadioChange('operator_authority', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="authority-yes" />
                  <Label htmlFor="authority-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="authority-no" />
                  <Label htmlFor="authority-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-selected" id="authority-not-selected" />
                  <Label htmlFor="authority-not-selected">Not selected</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Information Understanding */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Understand information used by the control operator to perform the general IT control</h3>
          <div>
            <p className="text-sm mb-3">
              Is information used by the control operator to perform the general IT control?
            </p>
            <RadioGroup 
              value={formData.information_used || ""} 
              onValueChange={(value) => handleRadioChange('information_used', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="info-yes" />
                  <Label htmlFor="info-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="info-no" />
                  <Label htmlFor="info-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-selected" id="info-not-selected" />
                  <Label htmlFor="info-not-selected">Not selected</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Evaluate design and implementation */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Evaluate design and implementation</h3>
          <p className="text-sm mb-4">
            Document procedures performed, results of those procedures and evidence obtained for each control attribute to evaluate design and 
            implementation of the general IT control
          </p>
          
          <div className="flex space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inquiry"
                checked={formData.eval_inquiry || false}
                onCheckedChange={(checked) => handleCheckboxChange('eval_inquiry', !!checked)}
              />
              <Label htmlFor="inquiry">Inquiry</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inspection"
                checked={formData.eval_inspection || false}
                onCheckedChange={(checked) => handleCheckboxChange('eval_inspection', !!checked)}
              />
              <Label htmlFor="inspection">Inspection</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="observation"
                checked={formData.eval_observation || false}
                onCheckedChange={(checked) => handleCheckboxChange('eval_observation', !!checked)}
              />
              <Label htmlFor="observation">Observation</Label>
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
          <h3 className="font-medium mb-4">Conclude on the design and implementation of the general IT control</h3>
          
          <div>
            <p className="text-sm mb-3">
              <strong>Design:</strong> Is the general IT control capable of effectively addressing the related RAFITs?
            </p>
            <RadioGroup 
              value={formData.design_conclusion || ""} 
              onValueChange={(value) => handleRadioChange('design_conclusion', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="design-yes" />
                  <Label htmlFor="design-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="design-no" />
                  <Label htmlFor="design-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-selected" id="design-not-selected" />
                  <Label htmlFor="design-not-selected">Not selected</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <p className="text-sm mb-3">
              <strong>Implementation:</strong> Does the general IT control exist and is the entity using it as designed?
            </p>
            <RadioGroup 
              value={formData.implementation_conclusion || ""} 
              onValueChange={(value) => handleRadioChange('implementation_conclusion', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="impl-yes" />
                  <Label htmlFor="impl-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="impl-no" />
                  <Label htmlFor="impl-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-selected" id="impl-not-selected" />
                  <Label htmlFor="impl-not-selected">Not selected</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">We plan to perform test of operating effectiveness for this general IT control</span>
              <div className="flex">
                <Button
                  variant={formData.plan_operating_test === 'NO' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => handleToggleChange('plan_operating_test', 'NO')}
                >
                  NO
                </Button>
                <Button
                  variant={formData.plan_operating_test === 'YES' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => handleToggleChange('plan_operating_test', 'YES')}
                >
                  YES
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