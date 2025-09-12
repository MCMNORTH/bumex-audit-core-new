
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/TranslationContext';

interface EngagementTypeSectionProps {
  formData: {
    financial_statement_audit_report: boolean;
    audit_report_date: string;
    required_audit_file_closeout_date: string;
  };
  onFormDataChange: (updates: any) => void;
}

const EngagementTypeSection = ({ formData, onFormDataChange }: EngagementTypeSectionProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{t('engagementType.selectType')}</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="financial_statement_audit_report"
            checked={formData.financial_statement_audit_report}
            onCheckedChange={(checked) => onFormDataChange({ financial_statement_audit_report: checked as boolean })}
          />
          <Label htmlFor="financial_statement_audit_report">{t('engagementType.financialStatementAuditReport')}</Label>
        </div>
      </div>

      {formData.financial_statement_audit_report && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="audit_report_date">{t('engagementType.auditReportDate')}</Label>
            <Input
              id="audit_report_date"
              type="date"
              value={formData.audit_report_date}
              onChange={(e) => onFormDataChange({ audit_report_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="required_audit_file_closeout_date">{t('engagementType.requiredAuditFileCloseoutDate')}</Label>
            <Input
              id="required_audit_file_closeout_date"
              type="date"
              value={formData.required_audit_file_closeout_date}
              onChange={(e) => onFormDataChange({ required_audit_file_closeout_date: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementTypeSection;
