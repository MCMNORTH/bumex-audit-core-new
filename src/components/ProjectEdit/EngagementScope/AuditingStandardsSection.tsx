
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface AuditingStandardsSectionProps {
  formData: {
    auditing_standards: string[];
  };
  onFormDataChange: (updates: any) => void;
}

const AuditingStandardsSection = ({ formData, onFormDataChange }: AuditingStandardsSectionProps) => {
  const { t } = useTranslation();
  
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-gray-900">{t('auditingStandards.title')}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAuditingStandard}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('common.add')}
        </Button>
      </div>
      {formData.auditing_standards.map((standard, index) => (
        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <Input
            value={standard}
            onChange={(e) => handleAuditingStandardChange(index, e.target.value)}
            placeholder={t('auditingStandards.placeholder')}
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
  );
};

export default AuditingStandardsSection;
