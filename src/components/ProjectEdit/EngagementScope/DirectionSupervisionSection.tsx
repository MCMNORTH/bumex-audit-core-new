import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CommentableQuestion from '../Comments/CommentableQuestion';
import { useTranslation } from '@/contexts/TranslationContext';

interface DirectionSupervisionSectionProps {
  formData: {
    direction_supervision_documentation: string;
  };
  onFormDataChange: (updates: any) => void;
}

const DirectionSupervisionSection = ({ formData, onFormDataChange }: DirectionSupervisionSectionProps) => {
  const { t } = useTranslation();
  return (
    <CommentableQuestion fieldId="direction-supervision-section" label={t('directionSupervision.title')}>
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{t('directionSupervision.title')}</h4>
        
        <div>
          <Label htmlFor="direction_supervision_documentation" className="text-sm font-medium">{t('directionSupervision.documentLabel')}</Label>
          <Textarea
            id="direction_supervision_documentation"
            value={formData.direction_supervision_documentation || ''}
            onChange={(e) => onFormDataChange({ direction_supervision_documentation: e.target.value })}
            placeholder={t('directionSupervision.placeholder')}
            className="min-h-[120px] mt-2"
          />
        </div>
      </div>
    </CommentableQuestion>
  );
};

export default DirectionSupervisionSection;
