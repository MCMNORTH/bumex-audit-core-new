
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface EngagementTeamSectionProps {
  formData: {
    sufficient_appropriate_resources: boolean;
    team_competence_and_capabilities: boolean;
  };
  onFormDataChange: (updates: any) => void;
}

const EngagementTeamSection = ({ formData, onFormDataChange }: EngagementTeamSectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Engagement team</h4>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sufficient_appropriate_resources"
            checked={formData.sufficient_appropriate_resources || false}
            onCheckedChange={(checked) => onFormDataChange({ sufficient_appropriate_resources: checked as boolean })}
          />
          <Label htmlFor="sufficient_appropriate_resources" className="text-sm">Confirm that sufficient and appropriate resources to perform the engagement are assigned or made available to the engagement in a timely manner</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="team_competence_and_capabilities"
            checked={formData.team_competence_and_capabilities || false}
            onCheckedChange={(checked) => onFormDataChange({ team_competence_and_capabilities: checked as boolean })}
          />
          <Label htmlFor="team_competence_and_capabilities" className="text-sm">Confirm that the members of the engagement team, and any engaged BUMEX specialists and internal auditors who provide direct assistance collectively have the appropriate competence and capabilities, including sufficient time, to perform the engagement</Label>
        </div>
      </div>
    </div>
  );
};

export default EngagementTeamSection;
