
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

interface ProjectHeaderProps {
  projectName: string;
  engagementId: string;
  activeSection: string;
  clientName?: string;
  auditType: string;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
}

const ProjectHeader = ({
  projectName,
  engagementId,
  activeSection,
  clientName,
  auditType,
  onBack,
  onSave,
  saving
}: ProjectHeaderProps) => {
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'engagement-profile': return 'Engagement Profile';
      case 'team-assignment': return 'Team Assignment';
      case 'timeline': return 'Timeline & Milestones';
      case 'documentation': return 'Documentation';
      case 'risk-assessment': return 'Risk Assessment';
      case 'planning': return 'Audit Planning';
      default: return 'Engagement Profile';
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getSectionTitle()}
        </h1>
        <p className="text-gray-600 mt-1">
          {clientName} • {auditType}
        </p>
      </div>
      <Button onClick={onSave} disabled={saving}>
        <Save className="mr-2 h-4 w-4" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

export default ProjectHeader;
