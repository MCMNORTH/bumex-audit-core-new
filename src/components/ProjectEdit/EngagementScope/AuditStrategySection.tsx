import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, Download, X } from 'lucide-react';
import CommentableQuestion from '../Comments/CommentableQuestion';
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
  return <CommentableQuestion fieldId="audit-strategy-section" label="Audit Strategy">
    <div className="space-y-6 border-t pt-6">
      <div>
        <p className="text-sm text-gray-700 mb-4">
          We consider the information obtained in defining the audit strategy and plan our audit procedures on this screen, in 3.x.1 Understanding, risks and response for each business process and in the following locations:
        </p>
        
        <div className="space-y-2 mb-6">
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">1.4 Communications</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">2.1.2 Materiality</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">2.2.1 Entity and its environment</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">2.2.4 RAPD</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">2.3.1 CERAMIC</div>
          <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">3.2 Litigation claims and assessments</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Activate GAAP conversion and/or GAAS differences for this report</h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="gaap_conversion_activity" checked={formData.gaap_conversion_activity || false} onCheckedChange={checked => onFormDataChange({
            gaap_conversion_activity: checked as boolean
          })} />
            <Label htmlFor="gaap_conversion_activity">GAAP conversion activity</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="gaas_conversion_activity" checked={formData.gaas_conversion_activity || false} onCheckedChange={checked => onFormDataChange({
            gaas_conversion_activity: checked as boolean
          })} />
            <Label htmlFor="gaas_conversion_activity">GAAS conversion activity</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Method used to evaluate identified misstatements:</h4>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">Current period</Label>
            <Select value={formData.current_period_method || ''} onValueChange={value => onFormDataChange({
            current_period_method: value
          })}>
              <SelectTrigger>
                <SelectValue placeholder="Dual method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dual-method">Dual method</SelectItem>
                <SelectItem value="balance-sheet-method">Balance sheet method</SelectItem>
                <SelectItem value="income-statement-method">Income statement method</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Prior period</Label>
            <Select value={formData.prior_period_method || ''} onValueChange={value => onFormDataChange({
            prior_period_method: value
          })}>
              <SelectTrigger>
                <SelectValue placeholder="Dual method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dual-method">Dual method</SelectItem>
                <SelectItem value="balance-sheet-method">Balance sheet method</SelectItem>
                <SelectItem value="income-statement-method">Income statement method</SelectItem>
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