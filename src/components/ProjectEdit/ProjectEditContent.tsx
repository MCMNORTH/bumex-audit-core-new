import { Card, CardContent } from '@/components/ui/card';
import { Client, User, Project } from '@/types';
import { ProjectFormData } from '@/types/formData';
import ProjectHeader from './ProjectHeader';
import EngagementProfileSection from './EngagementProfileSection';
import IndependenceRequirementsSection from './IndependenceRequirementsSection';
import { Separator } from '@/components/ui/separator';
import TCWGCommunicationsSection from './TCWGCommunicationsSection';
import MaterialityMetricsSection from './MaterialityMetricsSection';
import EntityEnvironmentSection from './EntityEnvironmentSection';
import RAPDSection from './RAPDSection';
import CERAMICSection from './CERAMICSection';
import ITEnvironmentSection from './EngagementScope/ITEnvironmentSection';
import BusinessProcessesSection from './BusinessProcessesSection';
import MainBusinessProcessesSection from './MainBusinessProcessesSection';
import DISection from './DISection';
import ComptesAPouvoirSection from './ComptesAPouvoirSection';
import FraudRiskAssessmentSection from './FraudRiskAssessmentSection';
import FinancialReportingProcessSection from './FinancialReportingProcessSection';
import TeamSection from './TeamSection';
import SectionWrapper from './SectionWrapper';
import ProjectSignOffsSummary from './ProjectSignOffsSummary';
import { canEditProject, canViewTeamManagement } from '@/utils/permissions';
interface ProjectEditContentProps {
  project: Project | null;
  clients: Client[];
  users: User[];
  formData: ProjectFormData;
  activeSection: string;
  saving: boolean;
  currentUserId?: string;
  uploadedFile: File | null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  fileInputRef: React.RefObject<HTMLInputElement>;
  onBack: () => void;
  onSave: () => void;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
  onAssignmentChange: (field: string, value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onDownloadFile: () => void;
  projectId?: string;
  // MRR file upload props
  mrrUploadedFile: File | null;
  mrrUploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  mrrFileInputRef: React.RefObject<HTMLInputElement>;
  onMRRFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMRRFile: () => void;
  onDownloadMRRFile: () => void;
  onSectionChange?: (sectionId: string) => void; // NEW, optional, fallback gracefully
  sidebarSections?: any[]; // Accepts the sidebar sections for dynamic cards
  onSignOff?: (sectionId: string, userId: string) => void;
  onUnsign?: (sectionId: string) => void;
}
const ProjectEditContent = ({
  project,
  clients,
  users,
  formData,
  activeSection,
  saving,
  currentUserId,
  uploadedFile,
  uploadStatus,
  fileInputRef,
  onBack,
  onSave,
  onFormDataChange,
  onAssignmentChange,
  onFileUpload,
  onRemoveFile,
  onDownloadFile,
  projectId,
  // MRR file upload props
  mrrUploadedFile,
  mrrUploadStatus,
  mrrFileInputRef,
  onMRRFileUpload,
  onRemoveMRRFile,
  onDownloadMRRFile,
  onSectionChange = () => {},
  sidebarSections = [],
  onSignOff = () => {},
  onUnsign = () => {}
}: ProjectEditContentProps) => {
  const selectedClient = clients.find(c => c.id === formData.client_id);
  const currentUser = users.find(u => u.id === currentUserId);
  const canEdit = canEditProject(currentUser || null, formData);
  
  const handleSignOffWrapper = (sectionId: string) => {
    if (currentUserId) {
      onSignOff(sectionId, currentUserId);
    }
  };
  const handleAssignmentChange = (userId: string, checked: boolean) => {
    const currentAssignments = formData.assigned_to || [];
    const updatedAssignments = checked ? [...currentAssignments, userId] : currentAssignments.filter(id => id !== userId);
    onFormDataChange({
      assigned_to: updatedAssignments
    });
  };

  // Wrapper function to handle form data changes in individual field format
  const handleFormDataFieldChange = (field: string, value: any) => {
    onFormDataChange({ [field]: value });
  };

  // Renders summary info for the Engagement Management overview
  const renderOverviewInfo = () => {
    // Return null, an empty ReactNode, or placeholder JSX as needed
    return null;
  };
  const renderPlaceholderSection = (title: string) => <Card>
      <CardContent className="p-8 text-center">
        <p className="text-gray-500">{title} section coming soon</p>
      </CardContent>
    </Card>;
  const renderSectionHeader = (title: string, number?: string) => <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {number && `${number} `}{title}
      </h3>
      <Separator className="mt-2" />
    </div>;
  const renderEngagementProfileContent = () => <div className="space-y-6">
      {renderSectionHeader('Engagement Profile & Strategy', '1.')}
      <EngagementProfileSection formData={formData} clients={clients} users={users} uploadedFile={uploadedFile} uploadStatus={uploadStatus} onFormDataChange={onFormDataChange} onAssignmentChange={handleAssignmentChange} onFileUpload={onFileUpload} onRemoveFile={onRemoveFile} onDownloadFile={onDownloadFile} projectId={projectId} mrrUploadedFile={mrrUploadedFile} mrrUploadStatus={mrrUploadStatus} mrrFileInputRef={mrrFileInputRef} onMRRFileUpload={onMRRFileUpload} onRemoveMRRFile={onRemoveMRRFile} onDownloadMRRFile={onDownloadMRRFile} />
    </div>;
  const renderSignOffContent = (title: string = 'Sign-off') => <div className="space-y-4">
      {renderSectionHeader(title)}
      {renderPlaceholderSection('Sign-off')}
    </div>;
  const renderSPSpecialistsContent = () => {
    // Find the SP. Specialists section under Engagement Management
    const spSection = engagementManagementSection?.children?.find(c => c.id === "sp-specialists-section");
    if (!spSection) return null;
    return <div className="space-y-8">
        {renderSectionHeader(spSection.title)}
        {renderCardsForSection(spSection)}
      </div>;
  };
  const renderCommunicationsContent = () => <div className="space-y-6">
      {renderSectionHeader('Communications, Inquiries and Minutes', '4.')}
      <TCWGCommunicationsSection formData={formData} onFormDataChange={onFormDataChange} />
      
      <div className="ml-4 space-y-4">
        {renderSignOffContent()}
      </div>
    </div>;

  // Utility function: find a section by id recursively
  function findSectionById(sections, id) {
    for (const section of sections) {
      if (section.id === id) return section;
      if (section.children) {
        const child = findSectionById(section.children, id);
        if (child) return child;
      }
    }
    return null;
  }

  // -- Begin new dynamic rendering logic for Entity wide procedures:
  // Get the main entity-wide section and children
  const entitySection = sidebarSections.find(s => s.id === 'entity-wide-procedures');
  const entityChildren = entitySection?.children || [];

  // Utility to render a card list for any node with children (reused below)
  const renderCardsForSection = section => {
    if (!section?.children?.length) return null;
    return <div className="flex flex-row flex-wrap gap-6 mt-2 mb-4">
        {section.children.map(child => <div key={child.id} className="w-[260px] flex-shrink-0">
            <Card className="cursor-pointer border border-gray-200 shadow-md rounded-xl transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full" tabIndex={0} onClick={() => onSectionChange(child.id)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onSectionChange(child.id);
        }} aria-label={child.title} role="button">
              <CardContent className="flex flex-col p-8 items-start min-h-[120px] h-full">
                <span className="text-xs text-muted-foreground font-semibold mb-1">
                  {child.number ? `${child.number}` : ""}
                </span>
                <span className="text-gray-900 text-base font-medium">{child.title}</span>
              </CardContent>
            </Card>
          </div>)}
      </div>;
  };

  // Renders the content for "Entity wide procedures" and its tree
  const renderEntityWideProceduresContent = section => {
    // If not provided, show root entity section
    if (!section) section = entitySection;
    return <div className="space-y-8">
        {renderSectionHeader(section.title, section.number)}
        {renderCardsForSection(section)}
      </div>;
  };

  // If the active section is in the entity tree, show either cards or placeholder:
  function getEntityActiveSectionChain(activeId) {
    // Returns an array of ancestor objects up to the active section
    const chain = [];
    function helper(sections) {
      for (const node of sections) {
        if (node.id === activeId) {
          chain.push(node);
          return true;
        }
        if (node.children && helper(node.children)) {
          chain.unshift(node);
          return true;
        }
      }
      return false;
    }
    helper(entityChildren);
    return chain;
  }

  // Decide renderEntityContent for active section if under entity wide procedures:
  let renderedEntityContent = null;
  if (activeSection === 'entity-wide-procedures') {
    renderedEntityContent = renderEntityWideProceduresContent(entitySection);
  } else {
    // Is the active section inside the entity-wide tree?
    const activeSectionChain = getEntityActiveSectionChain(activeSection);
    if (activeSectionChain.length > 0) {
      // Find the current node
      const targetSection = activeSectionChain[activeSectionChain.length - 1];
      if (targetSection.children && targetSection.children.length > 0) {
        // Render cards for children
        renderedEntityContent = renderEntityWideProceduresContent(targetSection);
      } else {
        // Check if this is a specific materiality section that should show content
        if (targetSection.id === 'materiality-materiality') {
          renderedEntityContent = <div className="space-y-4">
              {renderSectionHeader('Materiality', '2.')}
              <MaterialityMetricsSection formData={formData} onFormDataChange={onFormDataChange} />
            </div>;
        } else if (targetSection.id === 'materiality-reevaluate') {
          renderedEntityContent = <div className="space-y-4">
              {renderSectionHeader('Re-evaluate', '3.')}
              <MaterialityMetricsSection formData={formData} onFormDataChange={onFormDataChange} showReEvaluate={true} />
            </div>;
        } else if (targetSection.id === 'entity-and-env') {
          renderedEntityContent = <div className="space-y-4">
              {renderSectionHeader('Entity and its environment', '1.')}
              <EntityEnvironmentSection formData={formData} onFormDataChange={onFormDataChange} />
            </div>;
        } else if (targetSection.id === 'rapd') {
          renderedEntityContent = <div className="space-y-4">
              {renderSectionHeader('RAPD', '4.')}
              <RAPDSection formData={formData} onFormDataChange={onFormDataChange} />
            </div>;
        } else if (targetSection.id === 'ceramic') {
          renderedEntityContent = <div className="space-y-4">
              {renderSectionHeader('CERAMIC', '1.')}
              <CERAMICSection formData={formData} onFormDataChange={onFormDataChange} />
            </div>;
        } else if (targetSection.id === 'it-understanding') {
          renderedEntityContent = <div className="space-y-4">
              {renderSectionHeader('IT Understanding', '2.')}
              <Card>
                <CardContent className="p-6">
                  <ITEnvironmentSection formData={formData} onFormDataChange={onFormDataChange} />
                </CardContent>
              </Card>
            </div>;
        } else if (targetSection.id === 'risk-business-processes') {
           renderedEntityContent = <div className="space-y-4">
               {renderSectionHeader('Business processes', '3.')}
               <BusinessProcessesSection formData={formData} onFormDataChange={onFormDataChange} />
             </div>;
         } else if (targetSection.id === 'gitc-controls') {
           // Show cards for GITC Controls children
           renderedEntityContent = renderEntityWideProceduresContent(targetSection);
          } else if (targetSection.id === 'ad-1-1-apd-1') {
            // Show cards for AD 1.1APD-1 children
            renderedEntityContent = renderEntityWideProceduresContent(targetSection);
          } else if (targetSection.id === 'ad-1-1-apd-1-d-i') {
            // D&I Section content
            renderedEntityContent = <div className="space-y-4">
                {renderSectionHeader('1 - D&I')}
                <Card>
                  <CardContent className="p-6">
                    <DISection formData={formData} onFormDataChange={onFormDataChange} />
                  </CardContent>
                </Card>
              </div>;
           } else if (targetSection.id === 'ad-1-1-apd-1-2-toe') {
             // 2 - TOE Section content (moved from Comptes à pouvoir)
             renderedEntityContent = <div className="space-y-4">
                 {renderSectionHeader('2 - TOE')}
                 <Card>
                   <CardContent className="p-6">
                     <ComptesAPouvoirSection formData={formData} handleFormDataChange={handleFormDataFieldChange} />
                   </CardContent>
                 </Card>
               </div>;
           } else if (targetSection.id === 'ad-1-4-apd-1') {
             // AD 1.4 APD-1 - Comptes à pouvoir Section content (empty state restored)
             renderedEntityContent = <div className="space-y-4">
                 {renderSectionHeader('AD 1.4 APD-1 - Comptes à pouvoir')}
                 {renderPlaceholderSection('AD 1.4 APD-1 - Comptes à pouvoir')}
               </div>;
          } else if (targetSection.id.startsWith('ad-1-1-apd-1-') || targetSection.id.startsWith('ad-') || targetSection.id.startsWith('seebi-') || targetSection.id.startsWith('talend-')) {
            // Individual GITC control items and their children
            renderedEntityContent = <div className="space-y-4">
                {renderSectionHeader(targetSection.title)}
                {renderPlaceholderSection(targetSection.title)}
               </div>;
          } else if (targetSection.id === 'fraud-risk') {
            // Fraud risk assessment section
            renderedEntityContent = <div className="space-y-4">
                {renderSectionHeader('Fraud risk assessment and response', '1.')}
                <FraudRiskAssessmentSection formData={formData} onFormDataChange={onFormDataChange} />
              </div>;
          } else {
           // Render placeholder for other leaves
           renderedEntityContent = <div className="space-y-8">
               {renderSectionHeader(targetSection.title, targetSection.number)}
               {renderPlaceholderSection(targetSection.title + " coming soon")}
             </div>;
        }
      }
    }
  }

  // Business processes section logic
  const businessProcessesSection = sidebarSections.find(s => s.id === 'business-processes');
  
  const renderBusinessProcessesContent = () => {
    if (!businessProcessesSection) return null;
    return (
      <div className="space-y-8">
        {renderSectionHeader(businessProcessesSection.title, businessProcessesSection.number)}
        <MainBusinessProcessesSection onSectionChange={onSectionChange} />
      </div>
    );
  };

  const renderFinancialReportingContent = () => {
    const financialReportingSection = businessProcessesSection?.children?.find(c => c.id === 'financial-reporting');
    if (!financialReportingSection) return null;
    return (
      <div className="space-y-8">
        {renderSectionHeader(financialReportingSection.title, financialReportingSection.number)}
        {renderCardsForSection(financialReportingSection)}
      </div>
    );
  };

  // Engagement management cards logic
  const engagementManagementSection = sidebarSections.find(s => s.id === "engagement-management");

  // Independence cards logic: USE THE RECURSIVE LOOKUP HERE!
  const independenceSection = findSectionById(sidebarSections, "independence-section");

  const renderIndependenceContent = () => {
    if (!independenceSection) return null;
    return (
      <div className="space-y-8">
        {renderSectionHeader(independenceSection.title, independenceSection.number)}
        {renderCardsForSection(independenceSection)}
      </div>
    );
  };

  return <div className="flex-1 overflow-y-auto">
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <ProjectHeader projectName={project?.engagement_name || ''} engagementId={project?.engagement_id || ''} activeSection={activeSection} clientName={selectedClient?.name} auditType={formData.audit_type} onBack={onBack} onSave={onSave} saving={saving} />

        {/* Main parent section - shows all nested content for 1. Engagement management */}
        {activeSection === 'engagement-management' && <div className="space-y-8">
            {renderOverviewInfo()}
            {renderCardsForSection(engagementManagementSection)}
          </div>}

        {/* Section 1, Engagement management children keep as before */}
        {activeSection === 'engagement-profile-section' && <div className="space-y-8">
            {renderEngagementProfileContent()}
            <div className="ml-4">
              {renderSignOffContent()}
            </div>
          </div>}
        {activeSection === 'sp-specialists-section' && renderSPSpecialistsContent()}
        {activeSection === 'independence-section' && renderIndependenceContent()}
        {activeSection === 'communications-section' && renderCommunicationsContent()}
        {activeSection === 'sign-off-1' && renderSignOffContent()}
        {activeSection === 'sign-off-2' && renderSignOffContent()}
        {activeSection === 'sign-off-3' && renderSignOffContent()}
        {activeSection === 'tech-risk-corp' && <div className="space-y-4">
            {renderSectionHeader('Tech Risk Corp - IT Audit')}
            {renderPlaceholderSection('Tech Risk Corp - IT Audit')}
          </div>}
        {activeSection === 'initial-independence' && <div className="space-y-4">
            {renderSectionHeader('Initial independence and conclusion', '1.')}
            <IndependenceRequirementsSection formData={formData} onFormDataChange={onFormDataChange} />
          </div>}
        {activeSection === 'fraud-risk' && <div className="space-y-4">
            {renderSectionHeader('Fraud risk assessment and response', '1.')}
            <FraudRiskAssessmentSection formData={formData} onFormDataChange={onFormDataChange} />
          </div>}
        {/* END of engagement management custom blocks */}

        {/* BUSINESS PROCESSES LOGIC (section 3 and its tree) */}
        {activeSection === 'business-processes' && renderBusinessProcessesContent()}
        {activeSection === 'financial-reporting' && renderFinancialReportingContent()}
        {activeSection === 'financial-reporting-process' && (
          <div className="space-y-4">
            <FinancialReportingProcessSection formData={formData} onFormDataChange={onFormDataChange} />
          </div>
        )}
        {activeSection === 'control-activities' && (
          <div className="space-y-8">
            {renderSectionHeader('CA - Control activities')}
            {renderCardsForSection(businessProcessesSection?.children?.find(c => c.id === 'financial-reporting')?.children?.find(c => c.id === 'control-activities'))}
          </div>
        )}
        {activeSection === 'controle-24' && (
          <div className="space-y-8">
            {renderSectionHeader('Contrôle 24', '')}
            <p className="text-sm text-muted-foreground">Réconciliation des états financiers</p>
            {renderCardsForSection(businessProcessesSection?.children?.find(c => c.id === 'financial-reporting')?.children?.find(c => c.id === 'control-activities')?.children?.find(c => c.id === 'controle-24'))}
          </div>
        )}
        {activeSection === 'controle-24-d-i' && (
          <div className="space-y-4">
            {renderSectionHeader('1 - D&I', '')}
            {renderPlaceholderSection('Contrôle 24 - D&I')}
          </div>
        )}
        {activeSection === 'controle-24-toe' && (
          <div className="space-y-4">
            {renderSectionHeader('2 - TOE', '')}
            {renderPlaceholderSection('Contrôle 24 - TOE')}
          </div>
        )}
        {activeSection === 'controle-25' && (
          <div className="space-y-4">
            {renderSectionHeader('Contrôle 25', '')}
            <p className="text-sm text-muted-foreground">SOD</p>
            {renderPlaceholderSection('Contrôle 25 - SOD')}
          </div>
        )}

        {/* ENTITY WIDE PROCEDURES LOGIC (section 2 and its entire tree) */}
        {renderedEntityContent}

        {/* TEAM SECTION */}
        {activeSection === 'team-section' && (
          <div className="space-y-4">
            {renderSectionHeader('Team Management')}
            <TeamSection
              formData={formData}
              users={users}
              currentUserId={currentUserId || ''}
              isLeadDeveloper={currentUserId === formData.lead_developer_id}
              onFormDataChange={onFormDataChange}
              onSave={onSave}
              saving={saving}
            />
          </div>
        )}
      </div>
    </div>
  </div>;
};
export default ProjectEditContent;
