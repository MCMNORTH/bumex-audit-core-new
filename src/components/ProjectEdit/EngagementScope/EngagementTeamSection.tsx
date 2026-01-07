
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import CommentableQuestion from '../Comments/CommentableQuestion';
import { useTranslation } from '@/contexts/TranslationContext';

interface EngagementTeamSectionProps {
  formData: {
    sufficient_appropriate_resources: boolean;
    team_competence_and_capabilities: boolean;
  };
  onFormDataChange: (updates: any) => void;
}

const EngagementTeamSection = ({ formData, onFormDataChange }: EngagementTeamSectionProps) => {
  const { t } = useTranslation();
  
  return (
    <CommentableQuestion fieldId="engagement-team-section" label={t('engagementTeam.title')}>
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">{t('engagementTeam.title')}</h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sufficient_appropriate_resources"
              checked={formData.sufficient_appropriate_resources || false}
              onCheckedChange={(checked) => onFormDataChange({ sufficient_appropriate_resources: checked as boolean })}
            />
            <Label htmlFor="sufficient_appropriate_resources" className="text-sm">{t('engagementTeam.sufficientResources')}</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="team_competence_and_capabilities"
              checked={formData.team_competence_and_capabilities || false}
              onCheckedChange={(checked) => onFormDataChange({ team_competence_and_capabilities: checked as boolean })}
            />
            <Label htmlFor="team_competence_and_capabilities" className="text-sm">{t('engagementTeam.competenceAndCapabilities')}</Label>
          </div>
        </div>
      </div>
    </CommentableQuestion>
  );
};

export default EngagementTeamSection;
