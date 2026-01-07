import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, ChevronDown, ChevronRight, Upload, FileText, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProjectFormData, FraudRiskFactor, FraudRiskAssessment, FinancialStatementFraudRisk, HighRiskCriteriaItem } from '@/types/formData';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';
import { CommentableQuestion } from './Comments';
import { Link as LinkIcon } from 'lucide-react';

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

  const [highRiskCriteriaRows, setHighRiskCriteriaRows] = useState<HighRiskCriteriaItem[]>(
    formData.high_risk_criteria_items || []
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

  // Handlers for high risk criteria table
  const addHighRiskCriteriaRow = () => {
    const newRow: HighRiskCriteriaItem = {
      id: `HRC${Date.now()}`,
      reference: '',
      description: '',
      rationale: '',
      method: '',
      populations: []
    };
    const updatedRows = [...(formData.high_risk_criteria_items || []), newRow];
    setHighRiskCriteriaRows(updatedRows);
    onFormDataChange({ high_risk_criteria_items: updatedRows });
  };

  const removeHighRiskCriteriaRow = (index: number) => {
    const updatedRows = (formData.high_risk_criteria_items || []).filter((_, i) => i !== index);
    setHighRiskCriteriaRows(updatedRows);
    onFormDataChange({ high_risk_criteria_items: updatedRows });
  };

  const updateHighRiskCriteriaRow = (index: number, field: keyof HighRiskCriteriaItem, value: any) => {
    const updatedRows = [...(formData.high_risk_criteria_items || [])];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setHighRiskCriteriaRows(updatedRows);
    onFormDataChange({ high_risk_criteria_items: updatedRows });
  };

  // Get available populations from fraud_financial_statement for linking
  const getAvailablePopulations = () => {
    return (formData.fraud_financial_statement || []).map(row => ({
      id: row.id,
      description: row.description
    }));
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

  // PDF upload handler
  const handlePdfUpload = async (
    file: File,
    index: number,
    setRows: React.Dispatch<React.SetStateAction<FraudRiskFactor[]>>,
    fieldName: keyof ProjectFormData
  ) => {
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      const fileName = `fraud-attachments/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      updateRow(index, 'attachment', downloadUrl, setRows, fieldName);
      toast.success('PDF uploaded successfully');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF');
    }
  };

  const handleRemoveAttachment = async (
    index: number,
    currentUrl: string,
    setRows: React.Dispatch<React.SetStateAction<FraudRiskFactor[]>>,
    fieldName: keyof ProjectFormData
  ) => {
    try {
      if (currentUrl) {
        const storageRef = ref(storage, currentUrl);
        await deleteObject(storageRef).catch(() => {});
      }
      updateRow(index, 'attachment', '', setRows, fieldName);
      toast.success('Attachment removed');
    } catch (error) {
      console.error('Error removing attachment:', error);
      updateRow(index, 'attachment', '', setRows, fieldName);
    }
  };

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
        <table className="w-full border border-gray-200 table-fixed">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="border border-gray-200 p-3 text-left w-24 text-xs">ID</th>
              <th className="border border-gray-200 p-3 text-left w-40 text-xs">Fraud Risk Factors</th>
              <th className="border border-gray-200 p-3 text-center w-20 text-xs">Identified</th>
              <th className="border border-gray-200 p-3 text-center w-24 text-xs">Incentives or pressures</th>
              <th className="border border-gray-200 p-3 text-center w-24 text-xs">Opportunities</th>
              <th className="border border-gray-200 p-3 text-center w-28 text-xs">Attitudes or rationalizations</th>
              <th className="border border-gray-200 p-3 text-center w-32 text-xs">Condition or event present which could lead to a RMM due to fraud</th>
              <th className="border border-gray-200 p-3 text-center w-28 text-xs">Attachment</th>
              <th className="border border-gray-200 p-3 text-center w-16 text-xs">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-gray-200 p-2">
                  <Input
                    value={row.id}
                    onChange={(e) => updateRow(index, 'id', e.target.value, setRows, fieldName)}
                    className="w-full text-sm bg-gray-50 border-gray-300"
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  <Textarea
                    value={row.description}
                    onChange={(e) => updateRow(index, 'description', e.target.value, setRows, fieldName)}
                    className="w-full min-h-[80px] resize-none text-sm bg-gray-50 border-gray-300"
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center align-middle">
                  <Checkbox
                    checked={row.identified}
                    onCheckedChange={(checked) => updateRow(index, 'identified', checked, setRows, fieldName)}
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center align-middle">
                  <Checkbox
                    checked={row.incentives}
                    onCheckedChange={(checked) => updateRow(index, 'incentives', checked, setRows, fieldName)}
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center align-middle">
                  <Checkbox
                    checked={row.opportunities}
                    onCheckedChange={(checked) => updateRow(index, 'opportunities', checked, setRows, fieldName)}
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center align-middle">
                  <Checkbox
                    checked={row.attitudes}
                    onCheckedChange={(checked) => updateRow(index, 'attitudes', checked, setRows, fieldName)}
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  <Input
                    value={typeof row.conditions === 'string' ? row.conditions : ''}
                    onChange={(e) => updateRow(index, 'conditions', e.target.value, setRows, fieldName)}
                    className="w-full text-sm bg-gray-50 border-gray-300"
                  />
                </td>
                <td className="border border-gray-200 p-2 text-center align-middle">
                  {row.attachment ? (
                    <div className="flex flex-col items-center gap-1">
                      <a
                        href={row.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                      >
                        <FileText className="h-4 w-4" />
                        View PDF
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
                        onClick={() => handleRemoveAttachment(index, row.attachment, setRows, fieldName)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700">
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">Upload PDF</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePdfUpload(file, index, setRows, fieldName);
                        }}
                      />
                    </label>
                  )}
                </td>
                <td className="border border-gray-200 p-2 text-center align-middle">
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
      <CommentableQuestion fieldId="fraud_risk_factors" label="Identify fraud risks">
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
      </CommentableQuestion>

      {/* Summary Table */}
      <CommentableQuestion fieldId="fraud_risk_summary" label="Fraud risk factors summary">
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
      </CommentableQuestion>

      {/* Identify and assess assertion level fraud risks */}
      <CommentableQuestion fieldId="fraud_assertion_level" label="Assertion level fraud risks">
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
      </CommentableQuestion>

      {/* Identify and assess financial statement level fraud risks */}
      <CommentableQuestion fieldId="fraud_financial_statement" label="Financial statement level fraud risks">
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

            {/* High Risk Criteria Table - shown when No is selected */}
            {formData.revenue_recognition_identified === 'no' && (
              <div className="mt-6 border-t pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Identify the high risk criteria, document the rationale for determination, indicate the approach for analysis and relevant populations applied to entries that meet the high risk criteria are tested.
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={addHighRiskCriteriaRow}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 table-fixed">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        <th className="border border-gray-200 p-3 text-left w-28 text-xs">High-risk criteria reference</th>
                        <th className="border border-gray-200 p-3 text-left w-48 text-xs">High-risk criteria description</th>
                        <th className="border border-gray-200 p-3 text-left w-40 text-xs">Rationale</th>
                        <th className="border border-gray-200 p-3 text-left w-32 text-xs">Method used to apply the criteria to the relevant population</th>
                        <th className="border border-gray-200 p-3 text-left w-48 text-xs">Identify the relevant populations over which the high-risk criteria will be applied</th>
                        <th className="border border-gray-200 p-3 text-center w-16 text-xs">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highRiskCriteriaRows.map((row, index) => (
                        <tr key={index} className="bg-white">
                          <td className="border border-gray-200 p-2">
                            <Input
                              value={row.reference}
                              onChange={(e) => updateHighRiskCriteriaRow(index, 'reference', e.target.value)}
                              className="w-full text-sm bg-gray-50 border-gray-300"
                              placeholder="Reference"
                            />
                          </td>
                          <td className="border border-gray-200 p-2">
                            <Textarea
                              value={row.description}
                              onChange={(e) => updateHighRiskCriteriaRow(index, 'description', e.target.value)}
                              className="w-full min-h-[80px] resize-none text-sm bg-gray-50 border-gray-300"
                              placeholder="Description"
                            />
                          </td>
                          <td className="border border-gray-200 p-2">
                            <Textarea
                              value={row.rationale}
                              onChange={(e) => updateHighRiskCriteriaRow(index, 'rationale', e.target.value)}
                              className="w-full min-h-[80px] resize-none text-sm bg-gray-50 border-gray-300"
                              placeholder="Rationale"
                            />
                          </td>
                          <td className="border border-gray-200 p-2">
                            <Textarea
                              value={row.method}
                              onChange={(e) => updateHighRiskCriteriaRow(index, 'method', e.target.value)}
                              className="w-full min-h-[80px] resize-none text-sm bg-gray-50 border-gray-300"
                              placeholder="Method"
                            />
                          </td>
                          <td className="border border-gray-200 p-2">
                            <div className="space-y-2">
                              {getAvailablePopulations().length > 0 ? (
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                  {getAvailablePopulations().map((pop) => (
                                    <div key={pop.id} className="flex items-center gap-2">
                                      <Checkbox
                                        id={`pop-${index}-${pop.id}`}
                                        checked={row.populations?.includes(pop.id) || false}
                                        onCheckedChange={(checked) => {
                                          const newPopulations = checked 
                                            ? [...(row.populations || []), pop.id]
                                            : (row.populations || []).filter(p => p !== pop.id);
                                          updateHighRiskCriteriaRow(index, 'populations', newPopulations);
                                        }}
                                      />
                                      <Label htmlFor={`pop-${index}-${pop.id}`} className="text-xs truncate">
                                        {pop.id}: {pop.description?.substring(0, 30)}...
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <LinkIcon className="h-3 w-3" />
                                  Add items to the table above to link
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-200 p-2 text-center align-middle">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeHighRiskCriteriaRow(index)}
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
            )}
          </div>
        </CardContent>
      </Card>
      </CommentableQuestion>

      {/* Management override section */}
      <CommentableQuestion fieldId="management_override" label="Management override of controls">
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
      </CommentableQuestion>

      {/* Design and implement overall responses */}
      <CommentableQuestion fieldId="overall_fraud_response" label="Overall responses to fraud risks">
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
      </CommentableQuestion>
    </div>
  );
};

export default FraudRiskAssessmentSection;
