import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  const buildParentMap = (
    nodes: SidebarSection[],
    parentId: string | null = null,
    map = new Map<string, string | null>(),
  ) => {
    nodes.forEach((node) => {
      map.set(node.id, parentId);
      if (node.children?.length) {
        buildParentMap(node.children, node.id, map);
      }
    });
    return map;
  };

  const parentMap = useMemo(() => buildParentMap(sections), [sections]);

  const getAncestorIds = (sectionId: string) => {
    const ancestors: string[] = [];
    let cursor = parentMap.get(sectionId) ?? null;
    while (cursor) {
      ancestors.push(cursor);
      cursor = parentMap.get(cursor) ?? null;
    }
    return ancestors;
  };

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(getAncestorIds(activeSection)),
  );

  useEffect(() => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      getAncestorIds(activeSection).forEach((id) => next.add(id));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, parentMap]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleSectionClick = (section: SidebarSection, event: React.MouseEvent) => {
    event.preventDefault();
    onSectionChange(section.id);
  };

  const handleChevronClick = (sectionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleSection(sectionId);
  };

  const getIndicatorColor = (color: string) => {
    switch (color) {
      case 'orange':
        return 'bg-orange-500';
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'grey':
      default:
        return 'bg-gray-400';
    }
  };

  const renderSection = (section: SidebarSection, level = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const isActive = activeSection === section.id;
    const hasChildren = Boolean(section.children?.length);

    if (section.devOnly && currentUserRole !== 'dev') {
      return null;
    }

    const excludedSections = ['team-management', 'project-signoffs-summary'];
    const shouldShowDot = !excludedSections.includes(section.id) && formData && currentUser;

    const reviewIndicator = shouldShowDot
      ? getSectionReviewIndicator(section.id, formData, currentUser)
      : null;

    return (
      <div key={section.id}>
        <div
          className={`group flex items-center pr-2 py-2 text-sm rounded-xl transition-all cursor-pointer border ${
            isActive
              ? 'bg-blue-50 text-blue-900 font-semibold border-blue-200 shadow-sm'
              : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900'
          }`}
          style={{ paddingLeft: `${8 + level * 18}px` }}
          onClick={(event) => handleSectionClick(section, event)}
        >
          <span className="mr-2 flex h-5 w-5 items-center justify-center">
            {hasChildren ? (
              <span
                className="rounded-md p-1 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                onClick={(event) => handleChevronClick(section.id, event)}
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            )}
          </span>
          <span className={`${hasChildren ? 'font-semibold' : 'font-medium'} flex-1 truncate`}>
            {section.number && `${section.number} `}
            {section.title}
          </span>
          {reviewIndicator && (
            <div
              className={`w-2.5 h-2.5 rounded-full ml-2 ${getIndicatorColor(reviewIndicator)}`}
              title={
                reviewIndicator === 'orange'
                  ? 'Ready for your review'
                  : reviewIndicator === 'blue'
                    ? 'Reviewed by your role'
                    : reviewIndicator === 'green'
                      ? 'Reviewed by lead partner'
                      : 'Not reviewed'
              }
            />
          )}
        </div>

        {hasChildren && isExpanded && section.children && (
          <div className="mt-0.5">
            {section.children.map((child) => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed left-0 top-0 z-30 h-screen w-64 bg-gradient-to-b from-white to-slate-50 border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <button type="button" onClick={onBack} className="sr-only">
          Back
        </button>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <h2 className="font-semibold text-slate-900 truncate text-sm leading-5">{projectName}</h2>
          {clientName && <p className="text-xs text-slate-500 mt-0.5 truncate">{clientName}</p>}
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <div className="space-y-1.5">{sections.map((section) => renderSection(section)).filter(Boolean)}</div>
      </nav>

      {currentUser && (
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="font-medium text-slate-900 truncate">
              {currentUser.first_name} {currentUser.last_name}
            </p>
            <p className="text-slate-600 capitalize text-xs mt-0.5">
              {userProjectRole ? `${userProjectRole.replace('_', ' ')} • ${currentUser.role}` : currentUser.role}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSidebar;
