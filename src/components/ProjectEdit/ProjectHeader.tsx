
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
      case 'engagement-management': return '1. Engagement Management';
      case 'engagement-profile-section': return '1. Engagement Profile & Strategy';
      case 'engagement-profile': return '1. Engagement profile & Strategy';
      case 'sp-specialists-section': return 'SP. Specialists';
      case 'independence-section': return '2. Independence';
      case 'communications-section': return '4. Communications, Inquiries and Minutes';
      case 'sign-off-1': return 'Sign-off';
      case 'sign-off-2': return 'Sign-off';
      case 'sign-off-3': return 'Sign-off';
      case 'tech-risk-corp': return 'Tech Risk Corp - IT Audit';
      case 'initial-independence': return '1. Initial independence and conclusion';
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
