
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import CommentableQuestion from './Comments/CommentableQuestion';
import { useTranslation } from '@/contexts/TranslationContext';

interface Report {
  id: string;
  report_id: string;
  report_name: string;
  legal_entity: string;
  is_primary_report: boolean;
}

interface MultiReportingFormData {
  planning_to_use_multi_reporting: string;
  reports: Report[];
}

interface MultiReportingSectionProps {
  formData: MultiReportingFormData;
  onFormDataChange: (updates: Partial<MultiReportingFormData>) => void;
}

const MultiReportingSection = ({
  formData,
  onFormDataChange
}: MultiReportingSectionProps) => {
  const { t } = useTranslation();
  
  const handleAddReport = () => {
    const newReport: Report = {
      id: Date.now().toString(),
      report_id: '',
      report_name: '',
      legal_entity: '',
      is_primary_report: false
    };
    
    onFormDataChange({
      reports: [...(formData.reports || []), newReport]
    });
  };

  const handleRemoveReport = (reportId: string) => {
    onFormDataChange({
      reports: formData.reports.filter(report => report.id !== reportId)
    });
  };

  const handleReportChange = (reportId: string, field: keyof Report, value: string | boolean) => {
    onFormDataChange({
      reports: formData.reports.map(report =>
        report.id === reportId ? { ...report, [field]: value } : report
      )
    });
  };

  return (
    <CommentableQuestion fieldId="multi-reporting-section" label={t('multiReporting.title')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('multiReporting.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium">{t('multiReporting.planningToUse')}</Label>
            <RadioGroup
              value={formData.planning_to_use_multi_reporting || 'No'}
              onValueChange={(value) => onFormDataChange({ planning_to_use_multi_reporting: value })}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="multi-yes" />
                <Label htmlFor="multi-yes" className="text-sm">{t('common.yes')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="multi-no" />
                <Label htmlFor="multi-no" className="text-sm">{t('common.no')}</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.planning_to_use_multi_reporting === 'Yes' && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {t('multiReporting.identifyReports')}
                  </h4>
                </div>
                <Button
                  type="button"
                  onClick={handleAddReport}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-600 hover:bg-blue-600">
                      <TableHead className="text-white font-medium">{t('multiReporting.reportId')}</TableHead>
                      <TableHead className="text-white font-medium">{t('multiReporting.reportName')}</TableHead>
                      <TableHead className="text-white font-medium">{t('multiReporting.legalEntity')}</TableHead>
                      <TableHead className="text-white font-medium">{t('multiReporting.isPrimaryReport')}</TableHead>
                      <TableHead className="text-white font-medium w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.reports?.map((report, index) => (
                      <TableRow key={report.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <TableCell>
                          <Input
                            value={report.report_id}
                            onChange={(e) => handleReportChange(report.id, 'report_id', e.target.value)}
                            placeholder={t('multiReporting.reportId')}
                            className="border-0 bg-transparent"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={report.report_name}
                            onChange={(e) => handleReportChange(report.id, 'report_name', e.target.value)}
                            placeholder={t('multiReporting.reportName')}
                            className="border-0 bg-transparent"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={report.legal_entity}
                            onChange={(e) => handleReportChange(report.id, 'legal_entity', e.target.value)}
                            placeholder={t('multiReporting.legalEntity')}
                            className="border-0 bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={report.is_primary_report}
                            onCheckedChange={(checked) => 
                              handleReportChange(report.id, 'is_primary_report', checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveReport(report.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!formData.reports || formData.reports.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          {t('multiReporting.noReports')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </CommentableQuestion>
  );
};

export default MultiReportingSection;
