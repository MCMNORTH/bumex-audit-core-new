import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface Controle24DISectionProps {
  formData: any;
  onFormDataChange: (updates: any) => void;
}

const Controle24DISection: React.FC<Controle24DISectionProps> = ({
  formData,
  onFormDataChange
}) => {
  const [controlOperators, setControlOperators] = useState([{
    id: 1,
    roleName: '',
    competenceAssessment: ''
  }]);

  const addControlOperator = () => {
    const newId = Math.max(...controlOperators.map(op => op.id), 0) + 1;
    setControlOperators([...controlOperators, {
      id: newId,
      roleName: '',
      competenceAssessment: ''
    }]);
  };

  const removeControlOperator = (id: number) => {
    setControlOperators(controlOperators.filter(op => op.id !== id));
  };

  const updateControlOperator = (id: number, field: string, value: string) => {
    setControlOperators(controlOperators.map(op => op.id === id ? {
      ...op,
      [field]: value
    } : op));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. D&I</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Understand the process control activities */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Understand the process control activities and how they are performed</h3>
            
            <div className="space-y-2">
              <p className="text-sm">Control</p>
              <p className="text-sm font-medium">Contrôle 24</p>
              <p className="text-sm text-muted-foreground">Réconciliation des états financiers</p>
              <Textarea 
                placeholder="In addition to the documentation below, include a description of each control attribute (e.g., in an adhoc text box or in the TOE testwork), and the documentation maintained to evidence performance of the process control activity..." 
                className="min-h-[80px]" 
              />
            </div>

            {/* Process risk points table */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Process risk points</p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-blue-900 text-white">Process risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-900 text-white px-2 py-1 text-sm rounded">PRP(s)</span>
                        </div>
                        <Input 
                          placeholder="la réconciliation des états financiers (HFM vs JDE) n'est pas réalisée correctement dans HFM ni approuvée par le consolidation Manager..."
                          className="w-full"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="space-y-2">
                        <span className="text-sm font-medium">PRP FS</span>
                        <Input placeholder="Enter PRP FS details..." />
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Control attributes judgment question */}
          <div className="space-y-4">
            <div className="bg-blue-900 text-white p-3 rounded">
              <p className="text-sm font-medium">Do any of the control attributes involve judgment?</p>
            </div>
            <RadioGroup>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="judgment-yes" />
                <Label htmlFor="judgment-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="judgment-no" />
                <Label htmlFor="judgment-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Determine the nature of procedures */}
          <div className="space-y-4">
            <h4 className="font-medium">Determine the nature of procedures</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Nature</p>
                <div className="flex space-x-2">
                  <Button variant="outline" className="bg-gray-200">AUTOMATED</Button>
                  <Button variant="default" className="bg-blue-600 text-white">MANUAL</Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Type</p>
                <div className="flex space-x-2">
                  <Button variant="outline" className="bg-gray-200">DETECTIVE</Button>
                  <Button variant="default" className="bg-blue-600 text-white">PREVENTIVE</Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Frequency</p>
                  <Button size="sm" className="bg-green-600 text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Input placeholder="Monthly" />
              </div>
            </div>
          </div>

          {/* Add control operators */}
          <div className="space-y-4">
            <h4 className="font-medium">Add control operator(s)</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Control operators</span>
                <Button size="sm" onClick={addControlOperator} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-blue-900 text-white">Control operator role and/or name</TableHead>
                    <TableHead className="bg-blue-900 text-white">Assess the competence of the control operator(s)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controlOperators.map(operator => (
                    <TableRow key={operator.id}>
                      <TableCell>
                        <Input 
                          value={operator.roleName}
                          onChange={(e) => updateControlOperator(operator.id, 'roleName', e.target.value)}
                          placeholder="Directrice comptable"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={operator.competenceAssessment}
                          onChange={(e) => updateControlOperator(operator.id, 'competenceAssessment', e.target.value)}
                          placeholder="Assess competence of control operator..."
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeControlOperator(operator.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Authority question */}
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">
                Based on our understanding of the company's organizational structure does the control operator(s) have appropriate authority to perform the control effectively (i.e. the ability to sufficiently challenge process owners in a way that would influence their behavior)?
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="authority-yes" />
                  <Label htmlFor="authority-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="authority-no" />
                  <Label htmlFor="authority-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Understand information */}
          <div className="space-y-4">
            <h4 className="font-medium">Understand information used by the control operator to perform the control activity</h4>
            
            <div className="space-y-2">
              <p className="text-sm">
                Is information used by the control operator to perform the control activity?
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="information-yes" />
                  <Label htmlFor="information-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="information-no" />
                  <Label htmlFor="information-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Level of precision */}
          <div className="space-y-4">
            <h4 className="font-medium">Understand the level of precision of the process control activity</h4>
            
            <div className="space-y-2">
              <p className="text-sm">
                Is the control designed to operate with sufficient precision to effectively prevent or detect a material misstatement in the financial statements?
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="precision-yes" />
                  <Label htmlFor="precision-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="precision-no" />
                  <Label htmlFor="precision-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Evaluate design and implementation */}
          <div className="space-y-4">
            <h4 className="font-medium">Evaluate design and implementation</h4>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Document procedures performed, results of those procedures and evidence obtained for each control attribute to evaluate design and implementation.
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="inquiry" defaultChecked />
                  <Label htmlFor="inquiry">Inquiry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="observation" />
                  <Label htmlFor="observation">Observation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inspection" defaultChecked />
                  <Label htmlFor="inspection">Inspection</Label>
                </div>
              </div>

              <Textarea 
                placeholder="Nous avons réalisé un entretien avec le client, nous avons redescendu toutes les étapes du processus afin de récuperer pour chaque étape une pièce justificative cf.3.1.1.2.002000..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          {/* Final evaluation questions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">
                Design: Is the control capable of effectively preventing or detecting and correcting material misstatements?
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="design-yes" />
                  <Label htmlFor="design-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="design-no" />
                  <Label htmlFor="design-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                Implementation: Does the control exist and is the entity using it as designed?
              </p>
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="implementation-yes" />
                  <Label htmlFor="implementation-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="implementation-no" />
                  <Label htmlFor="implementation-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Controle24DISection;