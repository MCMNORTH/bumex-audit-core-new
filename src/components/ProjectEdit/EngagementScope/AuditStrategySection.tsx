import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, Download, X } from 'lucide-react';
import CommentableQuestion from '../Comments/CommentableQuestion';
import { useTranslation } from '@/contexts/TranslationContext';
interface AuditStrategySectionProps {
  formData: {
    gaap_conversion_activity: boolean;
    gaas_conversion_activity: boolean;
    current_period_method: string;
    prior_period_method: string;
    minimum_review_requirement: string;
    mrr_file: string;
  };
  onFormDataChange: (updates: any) => void;
  mrrUploadedFile?: File | null;
  mrrUploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  onMRRFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMRRFile?: () => void;
  onDownloadMRRFile?: () => void;
  mrrFileInputRef?: React.RefObject<HTMLInputElement>;
}
const AuditStrategySection = ({
  formData,
  onFormDataChange,
  mrrUploadedFile,
  mrrUploadStatus = 'idle',
  onMRRFileUpload,
  onRemoveMRRFile,
  onDownloadMRRFile,
  mrrFileInputRef
}: AuditStrategySectionProps) => {
  const triggerMRRFileUpload = () => {
    if (!mrrFileInputRef) {
      console.error('MRR file input ref is not provided');
      return;
    }
    if (!mrrFileInputRef.current) {
      console.error('MRR file input ref current is null');
      return;
    }
    try {
      mrrFileInputRef.current.click();
    } catch (error) {
      console.error('Error clicking file input:', error);
    }
  };
  const { t } = useTranslation();
  return <CommentableQuestion fieldId="audit-strategy-section" label={t('auditStrategy.title')}>
    <div className="space-y-6 border-t pt-6">
      <div>
        <p className="text-sm text-gray-700 mb-4">
          {t('auditStrategy.considerInfo')}
        </p>
        
        <div className="space-y-2 mb-6">
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">{t('auditStrategy.communications')}</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">{t('auditStrategy.materiality')}</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">{t('auditStrategy.entityEnvironment')}</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">{t('auditStrategy.rapdLink')}</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">{t('auditStrategy.ceramicLink')}</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">{t('auditStrategy.litigationClaims')}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{t('auditStrategy.activateGaapTitle')}</h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="gaap_conversion_activity" checked={formData.gaap_conversion_activity || false} onCheckedChange={checked => onFormDataChange({
            gaap_conversion_activity: checked as boolean
          })} />
            <Label htmlFor="gaap_conversion_activity">{t('auditStrategy.gaapConversion')}</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="gaas_conversion_activity" checked={formData.gaas_conversion_activity || false} onCheckedChange={checked => onFormDataChange({
            gaas_conversion_activity: checked as boolean
          })} />
            <Label htmlFor="gaas_conversion_activity">{t('auditStrategy.gaasConversion')}</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{t('auditStrategy.methodEvaluateTitle')}</h4>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">{t('auditStrategy.currentPeriod')}</Label>
            <Select value={formData.current_period_method || ''} onValueChange={value => onFormDataChange({
            current_period_method: value
          })}>
              <SelectTrigger>
                <SelectValue placeholder={t('auditStrategy.dualMethod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dual-method">{t('auditStrategy.dualMethod')}</SelectItem>
                <SelectItem value="balance-sheet-method">{t('auditStrategy.balanceSheetMethod')}</SelectItem>
                <SelectItem value="income-statement-method">{t('auditStrategy.incomeStatementMethod')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">{t('auditStrategy.priorPeriod')}</Label>
            <Select value={formData.prior_period_method || ''} onValueChange={value => onFormDataChange({
            prior_period_method: value
          })}>
              <SelectTrigger>
                <SelectValue placeholder={t('auditStrategy.dualMethod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dual-method">{t('auditStrategy.dualMethod')}</SelectItem>
                <SelectItem value="balance-sheet-method">{t('auditStrategy.balanceSheetMethod')}</SelectItem>
                <SelectItem value="income-statement-method">{t('auditStrategy.incomeStatementMethod')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>


      <div className="space-y-4">
        
        
        {/* Always render the file input - this is crucial for the ref to work */}
        <input ref={mrrFileInputRef} type="file" accept=".pdf" onChange={onMRRFileUpload} style={{
        display: 'none'
      }} />
      </div>
    </div>
  </CommentableQuestion>;
};
export default AuditStrategySection;