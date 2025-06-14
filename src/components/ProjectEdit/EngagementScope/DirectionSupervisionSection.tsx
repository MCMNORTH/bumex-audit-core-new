
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DirectionSupervisionSectionProps {
  formData: {
    direction_supervision_documentation: string;
  };
  onFormDataChange: (updates: any) => void;
}

const DirectionSupervisionSection = ({ formData, onFormDataChange }: DirectionSupervisionSectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Determine the nature, timing, and extent of direction and supervision of engagement team members, and review of their work</h4>
      
      <div>
        <Label htmlFor="direction_supervision_documentation" className="text-sm font-medium">Document how we plan to direct and supervise engagement team members, including review of their work.</Label>
        <Textarea
          id="direction_supervision_documentation"
          value={formData.direction_supervision_documentation || ''}
          onChange={(e) => onFormDataChange({ direction_supervision_documentation: e.target.value })}
          placeholder="Document your approach to team direction and supervision, including review procedures and communication methods..."
          className="min-h-[120px] mt-2"
        />
      </div>
    </div>
  );
};

export default DirectionSupervisionSection;
