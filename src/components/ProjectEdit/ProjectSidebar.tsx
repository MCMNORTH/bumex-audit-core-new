import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getSectionReviewIndicator } from '@/utils/permissions';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';

interface SidebarSection {
  id: string;
  title: string;
  active: boolean;
  isParent?: boolean;
  children?: SidebarSection[];
  number?: string;
  devOnly?: boolean;
  signOffLevel?: 'incharge' | 'manager';
}

interface ProjectSidebarProps {
  projectName: string;
  clientName?: string;
  sections: SidebarSection[];
  activeSection: string;
  currentUserRole?: string;
  formData?: ProjectFormData;
  currentUser?: User | null;
  userProjectRole?: string | null;
  onBack: () => void;
  onSectionChange: (sectionId: string) => void;
}

const ProjectSidebar = ({
  projectName,
  clientName,
  sections,
  activeSection,
  currentUserRole,
  formData,
  currentUser,
  userProjectRole,
  onBack,
  onSectionChange
}: ProjectSidebarProps) => {
  // Initialize expandedSections as empty so all sections are collapsed by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleSectionClick = (section: SidebarSection, event: React.MouseEvent) => {
    event.preventDefault();
    
    // If it's a parent section, navigate to it
    if (section.isParent) {
      onSectionChange(section.id);
    } else {
      // If it's a leaf section, navigate to it
      onSectionChange(section.id);
    }
  };

  const handleChevronClick = (sectionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleSection(sectionId);
  };

  const getIndicatorColor = (color: string) => {
    switch (color) {
      case 'orange': return 'bg-orange-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'grey':
      default: return 'bg-gray-400';
    }
  };

  const renderSection = (section: SidebarSection, level: number = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const isActive = activeSection === section.id;

    // Hide developer-only sections for non-developers
    if (section.devOnly && currentUserRole !== 'dev') {
      return null;
    }

    // Get review status indicator - exclude specific sections but include parent sections
    const excludedSections = ['team-management', 'project-signoffs-summary'];
    const shouldShowDot = !excludedSections.includes(section.id) && 
                         formData && 
                         currentUser;
    
    const reviewIndicator = shouldShowDot 
      ? getSectionReviewIndicator(section.id, formData, currentUser)
      : null;

    return (
      <div key={section.id}>
        <div
          className={`flex items-center px-2 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
            isActive
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          } ${level === 1 ? 'ml-4' : level === 2 ? 'ml-8' : ''}`}
          onClick={(e) => handleSectionClick(section, e)}
        >
          {section.isParent && (
            <div 
              className="mr-2 hover:bg-gray-200 rounded p-1 -m-1"
              onClick={(e) => handleChevronClick(section.id, e)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
          <span className={`${section.isParent ? 'font-medium' : ''} flex-1`}>
            {section.number && `${section.number} `}{section.title}
          </span>
          {reviewIndicator && (
            <div 
              className={`w-3 h-3 rounded-full ml-2 ${getIndicatorColor(reviewIndicator)}`}
              title={
                reviewIndicator === 'orange' ? 'Ready for your review' :
                reviewIndicator === 'blue' ? 'Reviewed by your role' :
                reviewIndicator === 'green' ? 'Reviewed by lead partner' :
                'Not reviewed'
              }
            />
          )}
        </div>

        {section.isParent && isExpanded && section.children && (
          <div className={level === 0 ? 'ml-2' : ''}>
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
          {sections.map(section => renderSection(section)).filter(Boolean)}
        </div>
      </nav>
      
      {/* User info section */}
      {currentUser && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm">
            <p className="font-medium text-gray-900 truncate">
              {currentUser.first_name} {currentUser.last_name}
            </p>
            <p className="text-gray-600 capitalize">
              {userProjectRole ? `${userProjectRole.replace('_', ' ')} • ${currentUser.role}` : currentUser.role}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSidebar;
