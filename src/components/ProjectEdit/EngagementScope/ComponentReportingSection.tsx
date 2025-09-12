
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslation } from '@/contexts/TranslationContext';

interface ComponentReportingSectionProps {
  formData: {
    component_reporting: boolean;
    component_reporting_details: string;
    group_auditor: boolean;
    component_reporting_applicable_auditing_standards: string;
    component_reporting_applicable_auditing_standards_other: string;
    component_reporting_applicable_financial_framework: string;
    component_reporting_applicable_financial_framework_other: string;
    component_reporting_date: string;
    group_audit_report_date: string;
    required_component_closeout_date: string;
    independence_rules_iesba: boolean;
    independence_rules_iesba_non_pie: boolean;
    independence_rules_iesba_pie: boolean;
    reporting_to_kpmg_office: boolean;
    reporting_to_non_kpmg_entity: boolean;
    auditing_financial_statements_type: string;
  };
  onFormDataChange: (updates: any) => void;
}

const ComponentReportingSection = ({ formData, onFormDataChange }: ComponentReportingSectionProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="component_reporting"
          checked={formData.component_reporting}
          onCheckedChange={(checked) => onFormDataChange({ component_reporting: checked as boolean })}
        />
        <Label htmlFor="component_reporting">Component reporting</Label>
      </div>
      
      {formData.component_reporting && (
        <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
          {/* Applicable auditing standards */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox checked={true} disabled />
              <Label className="font-medium">Applicable auditing standards and other legislative and regulatory requirements:</Label>
            </div>
            <div className="space-y-2">
              <Select
                value={formData.component_reporting_applicable_auditing_standards}
                onValueChange={(value) => onFormDataChange({ component_reporting_applicable_auditing_standards: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select auditing standards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISA">ISA</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formData.component_reporting_applicable_auditing_standards === 'Other' && (
                <Input
                  placeholder="Please specify other auditing standards"
                  value={formData.component_reporting_applicable_auditing_standards_other}
                  onChange={(e) => onFormDataChange({ component_reporting_applicable_auditing_standards_other: e.target.value })}
                />
              )}
            </div>
          </div>

          {/* Applicable financial reporting framework */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox checked={true} disabled />
              <Label className="font-medium">Applicable financial reporting framework and other legislative and regulatory requirements:</Label>
            </div>
            <div className="space-y-2">
              <Select
                value={formData.component_reporting_applicable_financial_framework}
                onValueChange={(value) => onFormDataChange({ component_reporting_applicable_financial_framework: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select financial reporting framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISA">ISA</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formData.component_reporting_applicable_financial_framework === 'Other' && (
                <Input
                  placeholder="Please specify other framework"
                  value={formData.component_reporting_applicable_financial_framework_other}
                  onChange={(e) => onFormDataChange({ component_reporting_applicable_financial_framework_other: e.target.value })}
                />
              )}
            </div>
          </div>

          {/* Date fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="component_reporting_date">Component reporting date*</Label>
              <Input
                id="component_reporting_date"
                type="date"
                value={formData.component_reporting_date}
                onChange={(e) => onFormDataChange({ component_reporting_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="group_audit_report_date">Group audit report date*</Label>
              <Input
                id="group_audit_report_date"
                type="date"
                value={formData.group_audit_report_date}
                onChange={(e) => onFormDataChange({ group_audit_report_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="required_component_closeout_date">Required component closeout date*</Label>
              <Input
                id="required_component_closeout_date"
                type="date"
                value={formData.required_component_closeout_date}
                onChange={(e) => onFormDataChange({ required_component_closeout_date: e.target.value })}
              />
            </div>
          </div>

          {/* Independence rules */}
          <div className="space-y-4">
            <Label className="font-medium">Independence rules applicable for the component as communicated by the group audit instructions - Select one of the following:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="independence_rules_iesba_pie"
                  checked={formData.independence_rules_iesba_pie}
                  onCheckedChange={(checked) => onFormDataChange({ independence_rules_iesba_pie: checked as boolean })}
                />
                <Label htmlFor="independence_rules_iesba_pie">IESBA PIE</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="independence_rules_iesba_non_pie"
                  checked={formData.independence_rules_iesba_non_pie}
                  onCheckedChange={(checked) => onFormDataChange({ independence_rules_iesba_non_pie: checked as boolean })}
                />
                <Label htmlFor="independence_rules_iesba_non_pie">IESBA non-PIE</Label>
              </div>
            </div>
          </div>

          {/* Reporting options */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reporting_to_kpmg_office"
                checked={formData.reporting_to_kpmg_office}
                onCheckedChange={(checked) => onFormDataChange({ reporting_to_kpmg_office: checked as boolean })}
              />
              <Label htmlFor="reporting_to_kpmg_office">Reporting to another BUMEX office or member firm</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reporting_to_non_kpmg_entity"
                checked={formData.reporting_to_non_kpmg_entity}
                onCheckedChange={(checked) => onFormDataChange({ reporting_to_non_kpmg_entity: checked as boolean })}
              />
              <Label htmlFor="reporting_to_non_kmpg_entity">Reporting to a non-BUMEX entity</Label>
            </div>
          </div>

          {/* Financial statements type */}
          <div className="space-y-4">
            <Label className="font-medium">Are we auditing financial statements that are any of the following:</Label>
            <div className="space-y-2 text-sm">
              <div>- Consolidated financial statements;</div>
              <div>- Financial statements prepared using proportionate consolidation;</div>
              <div>- Financial statements that include at least one investment accounted for by the equity method; or</div>
              <div>- Combined financial statements of the financial information of entities or business units that have no parent but are under common control or common management?</div>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroup
                value={formData.auditing_financial_statements_type}
                onValueChange={(value) => onFormDataChange({ auditing_financial_statements_type: value })}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="statements_yes" />
                  <Label htmlFor="statements_yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="statements_no" />
                  <Label htmlFor="statements_no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      )}

      {/* Group auditor checkbox - placed after component reporting section */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="group_auditor"
          checked={formData.group_auditor}
          onCheckedChange={(checked) => onFormDataChange({ group_auditor: checked as boolean })}
        />
        <Label htmlFor="group_auditor">Group auditor</Label>
      </div>
    </div>
  );
};

export default ComponentReportingSection;
