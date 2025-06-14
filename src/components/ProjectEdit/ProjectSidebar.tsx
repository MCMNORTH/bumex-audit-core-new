
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SidebarSection {
  id: string;
  title: string;
  active: boolean;
  isParent?: boolean;
  children?: SidebarSection[];
  number?: string;
}

interface ProjectSidebarProps {
  projectName: string;
  clientName?: string;
  sections: SidebarSection[];
  activeSection: string;
  onBack: () => void;
  onSectionChange: (sectionId: string) => void;
}

const ProjectSidebar = ({
  projectName,
  clientName,
  sections,
  activeSection,
  onBack,
  onSectionChange
}: ProjectSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['engagement-management']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderSection = (section: SidebarSection, level: number = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const isActive = activeSection === section.id;

    return (
      <div key={section.id}>
        <div
          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
            isActive
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          } ${level > 0 ? 'ml-4' : ''}`}
          onClick={() => {
            if (section.isParent) {
              toggleSection(section.id);
            } else {
              onSectionChange(section.id);
            }
          }}
        >
          {section.isParent && (
            <div className="mr-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
          <span className={`${section.isParent ? 'font-medium' : ''}`}>
            {section.number && `${section.number} `}{section.title}
          </span>
        </div>

        {section.isParent && isExpanded && section.children && (
          <div className="ml-2">
            {section.children.map(child => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

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
          <h2 className="font-semibold text-gray-900 truncate text-base">{projectName}</h2>
          {clientName && (
            <p className="text-sm text-gray-500 mt-1">{clientName}</p>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {sections.map(section => renderSection(section))}
        </div>
      </nav>
    </div>
  );
};

export default ProjectSidebar;
