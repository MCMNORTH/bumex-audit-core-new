
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SidebarSection {
  id: string;
  title: string;
  active: boolean;
}

interface ProjectSidebarProps {
  projectName: string;
  engagementId: string;
  sections: SidebarSection[];
  activeSection: string;
  onBack: () => void;
  onSectionChange: (sectionId: string) => void;
}

const ProjectSidebar = ({
  projectName,
  engagementId,
  sections,
  activeSection,
  onBack,
  onSectionChange
}: ProjectSidebarProps) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <div>
          <h2 className="font-semibold text-gray-900 truncate">{projectName}</h2>
          <p className="text-sm text-gray-500">{engagementId}</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ProjectSidebar;
