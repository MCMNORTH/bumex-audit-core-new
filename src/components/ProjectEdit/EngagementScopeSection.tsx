
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import DocumentAttachmentSection from './DocumentAttachmentSection';

interface DocumentFile {
  name: string;
  url: string;
  type: string;
}

interface EngagementScopeSectionProps {
  formData: {
    financial_statement_audit_report: boolean;
    auditing_standards_files: DocumentFile[];
    financial_reporting_framework_files: DocumentFile[];
    audit_report_date: string;
    required_audit_file_closeout_date: string;
  };
  onFormDataChange: (updates: any) => void;
  projectId: string;
}

const EngagementScopeSection = ({
  formData,
  onFormDataChange,
  projectId
}: EngagementScopeSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement scope and scale and other strategic matters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Select type of engagement</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="financial_statement_audit_report"
              checked={formData.financial_statement_audit_report}
              onCheckedChange={(checked) => 
                onFormDataChange({ financial_statement_audit_report: checked as boolean })
              }
            />
            <Label htmlFor="financial_statement_audit_report">Financial statement audit report</Label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-green-600 border-green-600">
              <Plus className="h-4 w-4 mr-1" />
            </Button>
            <span className="font-medium text-gray-900">
              Applicable auditing standards and other legislative and regulatory requirements:
            </span>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <DocumentAttachmentSection
              title="ISA"
              files={formData.auditing_standards_files}
              onFilesChange={(files) => onFormDataChange({ auditing_standards_files: files })}
              projectId={projectId}
              storagePrefix="auditing-standards"
              showTitle={false}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-green-600 border-green-600">
              <Plus className="h-4 w-4 mr-1" />
            </Button>
            <span className="font-medium text-gray-900">
              Applicable financial reporting framework and other legislative and regulatory requirements:
            </span>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <DocumentAttachmentSection
              title="French GAAP"
              files={formData.financial_reporting_framework_files}
              onFilesChange={(files) => onFormDataChange({ financial_reporting_framework_files: files })}
              projectId={projectId}
              storagePrefix="financial-reporting-framework"
              showTitle={false}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="audit_report_date">Audit report date</Label>
            <div className="relative">
              <Input
                id="audit_report_date"
                type="date"
                value={formData.audit_report_date}
                onChange={(e) => onFormDataChange({ audit_report_date: e.target.value })}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="required_audit_file_closeout_date">Required audit file closeout date</Label>
            <div className="relative">
              <Input
                id="required_audit_file_closeout_date"
                type="date"
                value={formData.required_audit_file_closeout_date}
                onChange={(e) => onFormDataChange({ required_audit_file_closeout_date: e.target.value })}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementScopeSection;
