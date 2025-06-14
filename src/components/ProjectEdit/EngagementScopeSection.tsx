
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface DocumentFile {
  name: string;
  url: string;
  type: string;
}

interface FormData {
  financial_statement_audit_report: boolean;
  auditing_standards: string[];
  financial_reporting_framework: string[];
  audit_report_date: string;
  required_audit_file_closeout_date: string;
}

interface EngagementScopeSectionProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
}

const EngagementScopeSection = ({
  formData,
  onFormDataChange
}: EngagementScopeSectionProps) => {
  const handleAddAuditingStandard = () => {
    const newStandards = [...formData.auditing_standards, ''];
    onFormDataChange({ auditing_standards: newStandards });
  };

  const handleRemoveAuditingStandard = (index: number) => {
    const newStandards = formData.auditing_standards.filter((_, i) => i !== index);
    onFormDataChange({ auditing_standards: newStandards });
  };

  const handleAuditingStandardChange = (index: number, value: string) => {
    const newStandards = [...formData.auditing_standards];
    newStandards[index] = value;
    onFormDataChange({ auditing_standards: newStandards });
  };

  const handleAddReportingFramework = () => {
    const newFrameworks = [...formData.financial_reporting_framework, ''];
    onFormDataChange({ financial_reporting_framework: newFrameworks });
  };

  const handleRemoveReportingFramework = (index: number) => {
    const newFrameworks = formData.financial_reporting_framework.filter((_, i) => i !== index);
    onFormDataChange({ financial_reporting_framework: newFrameworks });
  };

  const handleReportingFrameworkChange = (index: number, value: string) => {
    const newFrameworks = [...formData.financial_reporting_framework];
    newFrameworks[index] = value;
    onFormDataChange({ financial_reporting_framework: newFrameworks });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement scope and scale and other strategic matters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Select type of engagement</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="financial_statement_audit_report"
              checked={formData.financial_statement_audit_report}
              onCheckedChange={(checked) => onFormDataChange({ financial_statement_audit_report: checked as boolean })}
            />
            <Label htmlFor="financial_statement_audit_report">Financial statement audit report</Label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-gray-900">Applicable auditing standards and other legislative and regulatory requirements:</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAuditingStandard}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          {formData.auditing_standards.map((standard, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Input
                value={standard}
                onChange={(e) => handleAuditingStandardChange(index, e.target.value)}
                placeholder="Enter auditing standard"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAuditingStandard(index)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-gray-900">Applicable financial reporting framework and other legislative and regulatory requirements:</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddReportingFramework}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          {formData.financial_reporting_framework.map((framework, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Input
                value={framework}
                onChange={(e) => handleReportingFrameworkChange(index, e.target.value)}
                placeholder="Enter financial reporting framework"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveReportingFramework(index)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="audit_report_date">Audit report date</Label>
            <Input
              id="audit_report_date"
              type="date"
              value={formData.audit_report_date}
              onChange={(e) => onFormDataChange({ audit_report_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="required_audit_file_closeout_date">Required audit file closeout date</Label>
            <Input
              id="required_audit_file_closeout_date"
              type="date"
              value={formData.required_audit_file_closeout_date}
              onChange={(e) => onFormDataChange({ required_audit_file_closeout_date: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementScopeSection;
