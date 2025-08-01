import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProjectFormData, FraudRiskFactor, FraudRiskAssessment, FinancialStatementFraudRisk } from '@/types/formData';

interface FraudRiskAssessmentSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const FraudRiskAssessmentSection: React.FC<FraudRiskAssessmentSectionProps> = ({
  formData,
  onFormDataChange
}) => {
  // State for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    financial: true,
    managementGovernance: false,
    otherInternal: false,
    external: false,
    misappropriation: false,
    otherFactors: false
  });

  // Initialize state for various tables
  const [financialRows, setFinancialRows] = useState<FraudRiskFactor[]>(
    formData.fraud_risk_financial || [
      { id: '1008', description: 'Pressure to meet aggressive / unrealistic financial targets', identified: false, incentives: false, opportunities: false, attitudes: false, conditions: false, attachment: '' }
    ]
  );

  const [managementRows, setManagementRows] = useState<FraudRiskFactor[]>(
    formData.fraud_risk_management || [
      { id: '1070.04', description: 'Unusual delays by the entity in providing requested information.', identified: false, incentives: false, opportunities: false, attitudes: false, conditions: false, attachment: '' }
    ]
  );

  const [otherManagementRows, setOtherManagementRows] = useState<FraudRiskFactor[]>(
    formData.fraud_risk_other_management || [
      { id: '1016', description: 'High turnover of management, staff or operating operational application controls, staff in', identified: false, incentives: false, opportunities: false, attitudes: false, conditions: false, attachment: '' }
    ]
  );

  const [otherInternalRows, setOtherInternalRows] = useState<FraudRiskFactor[]>(
    formData.fraud_risk_other_internal || [
      { id: '1041', description: 'Lack of segregation of duties', identified: false, incentives: false, opportunities: false, attitudes: false, conditions: false, attachment: '' }
    ]
  );

  const [externalRows, setExternalRows] = useState<FraudRiskFactor[]>(formData.fraud_risk_external || []);
  const [misappropriationRows, setMisappropriationRows] = useState<FraudRiskFactor[]>(formData.fraud_risk_misappropriation || []);
  
  const [otherFactorsRows, setOtherFactorsRows] = useState<FraudRiskFactor[]>(
    formData.fraud_risk_other_factors || [
      { id: 'FR 1', description: 'management override (GAI)', identified: false, incentives: false, opportunities: false, attitudes: false, conditions: 'In accordance with GAI cf. P8, 9', attachment: '' }
    ]
  );

  const [assertionLevelRows, setAssertionLevelRows] = useState<FraudRiskAssessment[]>(
    formData.fraud_assertion_level || [
      { id: 'VTES04', description: 'Les créances et le chiffre d\'affaires ne sont pas comptabilisés sur la période comptable appropriée (problématique d\'existence).', inherentRisk: '', assertions: '', controlApproach: '' },
      { id: 'VTES23', description: 'Les créances et le chiffre d\'affaires ne sont pas comptabilisés sur la période comptable appropriée (problématique d\'exhaustivité).', inherentRisk: '', assertions: '', controlApproach: '' }
    ]
  );

  const [financialStatementRows, setFinancialStatementRows] = useState<FinancialStatementFraudRisk[]>(
    formData.fraud_financial_statement || []
  );

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Generic handlers for different fraud risk factor tables
  const addRow = (setRows: React.Dispatch<React.SetStateAction<FraudRiskFactor[]>>, fieldName: keyof ProjectFormData) => {
    const newRow: FraudRiskFactor = {
      id: `FR ${Date.now()}`,
      description: '',
      identified: false,
      incentives: false,
      opportunities: false,
      attitudes: false,
      conditions: false,
      attachment: ''
    };
    const updatedRows = [...(formData[fieldName] as FraudRiskFactor[] || []), newRow];
    setRows(updatedRows);
    onFormDataChange({ [fieldName]: updatedRows });
  };

  const removeRow = (index: number, setRows: React.Dispatch<React.SetStateAction<FraudRiskFactor[]>>, fieldName: keyof ProjectFormData) => {
    const updatedRows = (formData[fieldName] as FraudRiskFactor[] || []).filter((_, i) => i !== index);
    setRows(updatedRows);
    onFormDataChange({ [fieldName]: updatedRows });
  };

  const updateRow = (index: number, field: keyof FraudRiskFactor, value: any, setRows: React.Dispatch<React.SetStateAction<FraudRiskFactor[]>>, fieldName: keyof ProjectFormData) => {
    const updatedRows = [...(formData[fieldName] as FraudRiskFactor[] || [])];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setRows(updatedRows);
    onFormDataChange({ [fieldName]: updatedRows });
  };

  // Handlers for assertion level table
  const addAssertionRow = () => {
    const newRow: FraudRiskAssessment = {
      id: `VTES${Date.now()}`,
      description: '',
      inherentRisk: '',
      assertions: '',
      controlApproach: ''
    };
    const updatedRows = [...(formData.fraud_assertion_level || []), newRow];
    setAssertionLevelRows(updatedRows);
    onFormDataChange({ fraud_assertion_level: updatedRows });
  };

  const removeAssertionRow = (index: number) => {
    const updatedRows = (formData.fraud_assertion_level || []).filter((_, i) => i !== index);
    setAssertionLevelRows(updatedRows);
    onFormDataChange({ fraud_assertion_level: updatedRows });
  };

  const updateAssertionRow = (index: number, field: keyof FraudRiskAssessment, value: string) => {
    const updatedRows = [...(formData.fraud_assertion_level || [])];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setAssertionLevelRows(updatedRows);
    onFormDataChange({ fraud_assertion_level: updatedRows });
  };

  // Handlers for financial statement level table
  const addFinancialStatementRow = () => {
    const newRow: FinancialStatementFraudRisk = {
      id: `FS${Date.now()}`,
      description: '',
      fraudulentReporting: false,
      misappropriationAssets: false
    };
    const updatedRows = [...(formData.fraud_financial_statement || []), newRow];
    setFinancialStatementRows(updatedRows);
    onFormDataChange({ fraud_financial_statement: updatedRows });
  };

  const removeFinancialStatementRow = (index: number) => {
    const updatedRows = (formData.fraud_financial_statement || []).filter((_, i) => i !== index);
    setFinancialStatementRows(updatedRows);
    onFormDataChange({ fraud_financial_statement: updatedRows });
  };

  const updateFinancialStatementRow = (index: number, field: keyof FinancialStatementFraudRisk, value: any) => {
    const updatedRows = [...(formData.fraud_financial_statement || [])];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setFinancialStatementRows(updatedRows);
    onFormDataChange({ fraud_financial_statement: updatedRows });
  };

  // Calculate summary counts
  const calculateSummary = () => {
    const allRows = [
      ...(formData.fraud_risk_financial || []),
      ...(formData.fraud_risk_management || []),
      ...(formData.fraud_risk_other_management || []),
      ...(formData.fraud_risk_other_internal || []),
      ...(formData.fraud_risk_external || []),
      ...(formData.fraud_risk_misappropriation || []),
      ...(formData.fraud_risk_other_factors || [])
    ];

    const financialCount = (formData.fraud_risk_financial || []).length;
    const managementCount = (formData.fraud_risk_management || []).length + (formData.fraud_risk_other_management || []).length;
    const otherInternalCount = (formData.fraud_risk_other_internal || []).length;
    const externalCount = (formData.fraud_risk_external || []).length;
    const misappropriationCount = (formData.fraud_risk_misappropriation || []).length;
    const otherFactorsCount = (formData.fraud_risk_other_factors || []).length;

    return {
      incentives: {
        financial: (formData.fraud_risk_financial || []).filter(r => r.incentives).length,
        management: (formData.fraud_risk_management || []).filter(r => r.incentives).length + (formData.fraud_risk_other_management || []).filter(r => r.incentives).length,
        otherInternal: (formData.fraud_risk_other_internal || []).filter(r => r.incentives).length,
        external: (formData.fraud_risk_external || []).filter(r => r.incentives).length,
        misappropriation: (formData.fraud_risk_misappropriation || []).filter(r => r.incentives).length,
        otherFactors: (formData.fraud_risk_other_factors || []).filter(r => r.incentives).length
      },
      opportunities: {
        financial: (formData.fraud_risk_financial || []).filter(r => r.opportunities).length,
        management: (formData.fraud_risk_management || []).filter(r => r.opportunities).length + (formData.fraud_risk_other_management || []).filter(r => r.opportunities).length,
        otherInternal: (formData.fraud_risk_other_internal || []).filter(r => r.opportunities).length,
        external: (formData.fraud_risk_external || []).filter(r => r.opportunities).length,
        misappropriation: (formData.fraud_risk_misappropriation || []).filter(r => r.opportunities).length,
        otherFactors: (formData.fraud_risk_other_factors || []).filter(r => r.opportunities).length
      },
      attitudes: {
        financial: (formData.fraud_risk_financial || []).filter(r => r.attitudes).length,
        management: (formData.fraud_risk_management || []).filter(r => r.attitudes).length + (formData.fraud_risk_other_management || []).filter(r => r.attitudes).length,
        otherInternal: (formData.fraud_risk_other_internal || []).filter(r => r.attitudes).length,
        external: (formData.fraud_risk_external || []).filter(r => r.attitudes).length,
        misappropriation: (formData.fraud_risk_misappropriation || []).filter(r => r.attitudes).length,
        otherFactors: (formData.fraud_risk_other_factors || []).filter(r => r.attitudes).length
      }
    };
  };

  const summary = calculateSummary();

  const renderFraudRiskTable = (
    rows: FraudRiskFactor[],
    setRows: React.Dispatch<React.SetStateAction<FraudRiskFactor[]>>,
    fieldName: keyof ProjectFormData,
    title: string
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{title}</h4>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => addRow(setRows, fieldName)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="border border-gray-200 p-2 text-left">ID</th>
              <th className="border border-gray-200 p-2 text-left">Fraud Risk Factors</th>
              <th className="border border-gray-200 p-2 text-center">Identified</th>
              <th className="border border-gray-200 p-2 text-center">Incentives or pressures</th>
              <th className="border border-gray-200 p-2 text-center">Opportunities</th>
              <th className="border border-gray-200 p-2 text-center">Attitudes or rationalizations</th>
              <th className="border border-gray-200 p-2 text-center">Condition or event present which could lead to a RMM due to fraud</th>
              <th className="border border-gray-200 p-2 text-center">Attachment</th>
              <th className="border border-gray-200 p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="border border-gray-200 p-2">
                  <Input
                    value={row.id}
                    onChange={(e) => updateRow(index, 'id', e.target.value, setRows, fieldName)}
                    className="w-full border-0 p-1"
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  <Textarea
                    value={row.description}
                    onChange={(e) => updateRow(index, 'description', e.target.value, setRows, fieldName)}
                    className="w-full border-0 p-1 min-h-[60px] resize-none"
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  <Checkbox
                    checked={row.identified}
                    onCheckedChange={(checked) => updateRow(index, 'identified', checked, setRows, fieldName)}
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  <Checkbox
                    checked={row.incentives}
                    onCheckedChange={(checked) => updateRow(index, 'incentives', checked, setRows, fieldName)}
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  <Checkbox
                    checked={row.opportunities}
                    onCheckedChange={(checked) => updateRow(index, 'opportunities', checked, setRows, fieldName)}
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  <Checkbox
                    checked={row.attitudes}
                    onCheckedChange={(checked) => updateRow(index, 'attitudes', checked, setRows, fieldName)}
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  <Input
                    value={row.conditions}
                    onChange={(e) => updateRow(index, 'conditions', e.target.value, setRows, fieldName)}
                    className="w-full border-0 p-1"
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  <Input
                    value={row.attachment}
                    onChange={(e) => updateRow(index, 'attachment', e.target.value, setRows, fieldName)}
                    className="w-full border-0 p-1"
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeRow(index, setRows, fieldName)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Identify fraud risks */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Identify fraud risks</h3>
          <p className="text-sm text-gray-600 mb-4">
            Identify fraud risk factors considering the following categories
          </p>

          {/* Financial */}
          <Collapsible open={openSections.financial} onOpenChange={() => toggleSection('financial')}>
            <CollapsibleTrigger className="flex items-center space-x-2 text-left w-full mb-4">
              {openSections.financial ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium">Financial</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {renderFraudRiskTable(financialRows, setFinancialRows, 'fraud_risk_financial', '')}
            </CollapsibleContent>
          </Collapsible>

          {/* Management and governance */}
          <Collapsible open={openSections.managementGovernance} onOpenChange={() => toggleSection('managementGovernance')}>
            <CollapsibleTrigger className="flex items-center space-x-2 text-left w-full mb-4">
              {openSections.managementGovernance ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium">Management and governance:</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">(a) Strained relationships with auditors- History of:</p>
                {renderFraudRiskTable(managementRows, setManagementRows, 'fraud_risk_management', '')}
              </div>
              <div>
                <p className="font-medium mb-2">(b) Other:</p>
                {renderFraudRiskTable(otherManagementRows, setOtherManagementRows, 'fraud_risk_other_management', '')}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Other internal */}
          <Collapsible open={openSections.otherInternal} onOpenChange={() => toggleSection('otherInternal')}>
            <CollapsibleTrigger className="flex items-center space-x-2 text-left w-full mb-4">
              {openSections.otherInternal ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium">Other internal:</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {renderFraudRiskTable(otherInternalRows, setOtherInternalRows, 'fraud_risk_other_internal', '')}
            </CollapsibleContent>
          </Collapsible>

          {/* External */}
          <Collapsible open={openSections.external} onOpenChange={() => toggleSection('external')}>
            <CollapsibleTrigger className="flex items-center space-x-2 text-left w-full mb-4">
              {openSections.external ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium">External:</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {renderFraudRiskTable(externalRows, setExternalRows, 'fraud_risk_external', '')}
            </CollapsibleContent>
          </Collapsible>

          {/* Misappropriation of Asset */}
          <Collapsible open={openSections.misappropriation} onOpenChange={() => toggleSection('misappropriation')}>
            <CollapsibleTrigger className="flex items-center space-x-2 text-left w-full mb-4">
              {openSections.misappropriation ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium">Misappropriation of Asset:</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {renderFraudRiskTable(misappropriationRows, setMisappropriationRows, 'fraud_risk_misappropriation', '')}
            </CollapsibleContent>
          </Collapsible>

          {/* Other fraud risk factors */}
          <Collapsible open={openSections.otherFactors} onOpenChange={() => toggleSection('otherFactors')}>
            <CollapsibleTrigger className="flex items-center space-x-2 text-left w-full mb-4">
              {openSections.otherFactors ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium">Other fraud risk factors:</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => addRow(setOtherFactorsRows, 'fraud_risk_other_factors')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">Click to add a customized fraud risk factor</p>
                {renderFraudRiskTable(otherFactorsRows, setOtherFactorsRows, 'fraud_risk_other_factors', '')}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium mb-4">Use fraud risk factors to identify and assess fraud risks</h4>
          <p className="text-sm text-gray-600 mb-4">Below is a summary of the fraud risk factors identified above</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-gray-200 p-2 text-left">Summary of fraud risk factors identified</th>
                  <th className="border border-gray-200 p-2 text-center">Financial</th>
                  <th className="border border-gray-200 p-2 text-center">Management and governance:</th>
                  <th className="border border-gray-200 p-2 text-center">Other internal:</th>
                  <th className="border border-gray-200 p-2 text-center">External:</th>
                  <th className="border border-gray-200 p-2 text-center">Misappropriation of Asset:</th>
                  <th className="border border-gray-200 p-2 text-center">Other fraud risk factors:</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-2 font-medium">Incentives or pressures</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.incentives.financial}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.incentives.management}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.incentives.otherInternal}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.incentives.external}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.incentives.misappropriation}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.incentives.otherFactors}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2 font-medium">Opportunities</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.opportunities.financial}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.opportunities.management}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.opportunities.otherInternal}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.opportunities.external}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.opportunities.misappropriation}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.opportunities.otherFactors}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2 font-medium">Attitudes or rationalizations</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.attitudes.financial}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.attitudes.management}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.attitudes.otherInternal}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.attitudes.external}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.attitudes.misappropriation}</td>
                  <td className="border border-gray-200 p-2 text-center">{summary.attitudes.otherFactors}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Textarea
            placeholder="Based on the fraud risk factors above and our risk assessment procedures performed throughout our audit, we have identified the following fraud risks for each of the below categories:"
            value={formData.fraud_risk_summary || ''}
            onChange={(e) => onFormDataChange({ fraud_risk_summary: e.target.value })}
            className="mt-4 min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Identify and assess assertion level fraud risks */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Identify and assess assertion level fraud risks</h4>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={addAssertionRow}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-gray-200 p-2 text-left">ID</th>
                  <th className="border border-gray-200 p-2 text-left">Description</th>
                  <th className="border border-gray-200 p-2 text-center">Inherent risk</th>
                  <th className="border border-gray-200 p-2 text-center">Assertions</th>
                  <th className="border border-gray-200 p-2 text-center">Control approach</th>
                  <th className="border border-gray-200 p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {assertionLevelRows.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 p-2">
                      <Input
                        value={row.id}
                        onChange={(e) => updateAssertionRow(index, 'id', e.target.value)}
                        className="w-full border-0 p-1"
                      />
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Textarea
                        value={row.description}
                        onChange={(e) => updateAssertionRow(index, 'description', e.target.value)}
                        className="w-full border-0 p-1 min-h-[60px] resize-none"
                      />
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Input
                        value={row.inherentRisk}
                        onChange={(e) => updateAssertionRow(index, 'inherentRisk', e.target.value)}
                        className="w-full border-0 p-1"
                      />
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Input
                        value={row.assertions}
                        onChange={(e) => updateAssertionRow(index, 'assertions', e.target.value)}
                        className="w-full border-0 p-1"
                      />
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Input
                        value={row.controlApproach}
                        onChange={(e) => updateAssertionRow(index, 'controlApproach', e.target.value)}
                        className="w-full border-0 p-1"
                      />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeAssertionRow(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Identify and assess financial statement level fraud risks */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Identify and assess financial statement level fraud risks</h4>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={addFinancialStatementRow}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-gray-200 p-2 text-left">ID</th>
                  <th className="border border-gray-200 p-2 text-left">Description</th>
                  <th className="border border-gray-200 p-2 text-center">Fraudulent financial reporting</th>
                  <th className="border border-gray-200 p-2 text-center">Misappropriation of assets</th>
                  <th className="border border-gray-200 p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {financialStatementRows.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 p-2">
                      <Input
                        value={row.id}
                        onChange={(e) => updateFinancialStatementRow(index, 'id', e.target.value)}
                        className="w-full border-0 p-1"
                      />
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Textarea
                        value={row.description}
                        onChange={(e) => updateFinancialStatementRow(index, 'description', e.target.value)}
                        className="w-full border-0 p-1 min-h-[60px] resize-none"
                      />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <Checkbox
                        checked={row.fraudulentReporting}
                        onCheckedChange={(checked) => updateFinancialStatementRow(index, 'fraudulentReporting', checked)}
                      />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <Checkbox
                        checked={row.misappropriationAssets}
                        onCheckedChange={(checked) => updateFinancialStatementRow(index, 'misappropriationAssets', checked)}
                      />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFinancialStatementRow(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded">
            <p className="font-medium mb-2">Presume that there is a fraud risk involving improper revenue recognition</p>
            <Textarea
              placeholder="On considère que le risque de fraude est restreint à la période de cut-off (cf. 3.3.1 - Understanding, Risks and Response - BP Ventes clients)."
              value={formData.revenue_recognition_fraud_risk || ''}
              onChange={(e) => onFormDataChange({ revenue_recognition_fraud_risk: e.target.value })}
              className="mb-4 min-h-[100px]"
            />
            
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">
                Has a fraud risk involving improper revenue recognition been identified for each significant revenue account?
              </Label>
              <RadioGroup
                value={formData.revenue_recognition_identified || ''}
                onValueChange={(value) => onFormDataChange({ revenue_recognition_identified: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="revenue-yes" />
                  <Label htmlFor="revenue-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="revenue-no" />
                  <Label htmlFor="revenue-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management override section */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium mb-4">Identify the risk of management override of controls as a fraud risk</h4>
          <div className="space-y-4">
            <p className="text-sm">
              Management is in a unique position to perpetrate fraud because of management's ability to manipulate accounting records and prepare 
              fraudulent financial statements by overriding controls that otherwise appear to be operating effectively. By its nature, management override 
              of controls can occur in unpredictable ways. The risk of management override of controls is a fraud risk that is present in all entities.
            </p>
            <p className="text-sm">Management may be able to override controls in several ways — including:</p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>recording inappropriate or unauthorized journal entries throughout the year or at period end or making adjustments to amounts reported in the financial statements that are not reflected in systematic journal entries;</li>
              <li>applying bias when making accounting estimates and related judgments; and</li>
              <li>entering into significant unusual transactions that are outside the normal course of business for the entity or that otherwise appear to be unusual due to their timing, size, or nature.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Design and implement overall responses */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium mb-4">Design and implement overall responses</h4>
          <p className="text-sm text-gray-600 mb-4">
            Except for management override of controls, no financial statement level fraud risks have been identified.
          </p>
          <Textarea
            placeholder="Enter overall response details..."
            value={formData.overall_fraud_response || ''}
            onChange={(e) => onFormDataChange({ overall_fraud_response: e.target.value })}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudRiskAssessmentSection;
