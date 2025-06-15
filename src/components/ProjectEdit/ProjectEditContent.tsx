import { Card, CardContent } from '@/components/ui/card';
import { Client, User, Project } from '@/types';
import { ProjectFormData } from '@/types/formData';
import ProjectHeader from './ProjectHeader';
import EngagementProfileSection from './EngagementProfileSection';
import IndependenceRequirementsSection from './IndependenceRequirementsSection';
import { Separator } from '@/components/ui/separator';
import TCWGCommunicationsSection from './TCWGCommunicationsSection';

interface ProjectEditContentProps {
  project: Project | null;
  clients: Client[];
  users: User[];
  formData: ProjectFormData;
  activeSection: string;
  saving: boolean;
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
}

const ProjectEditContent = ({
  project,
  clients,
  users,
  formData,
  activeSection,
  saving,
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
}: ProjectEditContentProps) => {
  const selectedClient = clients.find(c => c.id === formData.client_id);

  const handleAssignmentChange = (userId: string, checked: boolean) => {
    const currentAssignments = formData.assigned_to || [];
    const updatedAssignments = checked 
      ? [...currentAssignments, userId]
      : currentAssignments.filter(id => id !== userId);
    
    onFormDataChange({ assigned_to: updatedAssignments });
  };

  // NEW: Renders summary info for the Engagement Management overview
  const renderOverviewInfo = () => (
    <div className="flex flex-col gap-2 items-start text-sm">
      <div>
        <span className="text-muted-foreground font-medium">Client: </span>
        <span>{selectedClient?.name || '—'}</span>
      </div>
      <div>
        <span className="text-muted-foreground font-medium">Status: </span>
        <span className="capitalize">{project?.status || '—'}</span>
      </div>
      <div>
        <span className="text-muted-foreground font-medium">Engagement Name: </span>
        <span>{project?.engagement_name || '—'}</span>
      </div>
      <div>
        <span className="text-muted-foreground font-medium">Engagement ID: </span>
        <span>{project?.engagement_id || '—'}</span>
      </div>
      <div>
        <span className="text-muted-foreground font-medium">Project ID: </span>
        <span>{project?.project_id || project?.id || '—'}</span>
      </div>
      <div>
        <span className="text-muted-foreground font-medium">Audit Type: </span>
        <span>{project?.audit_type || formData.audit_type || '—'}</span>
      </div>
    </div>
  );

  const renderPlaceholderSection = (title: string) => (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-gray-500">{title} section coming soon</p>
      </CardContent>
    </Card>
  );

  const renderSectionHeader = (title: string, number?: string) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {number && `${number} `}{title}
      </h3>
      <Separator className="mt-2" />
    </div>
  );

  const renderEngagementProfileContent = () => (
    <div className="space-y-6">
      {renderSectionHeader('Engagement Profile & Strategy', '1.')}
      <EngagementProfileSection
        formData={formData}
        clients={clients}
        users={users}
        uploadedFile={uploadedFile}
        uploadStatus={uploadStatus}
        onFormDataChange={onFormDataChange}
        onAssignmentChange={handleAssignmentChange}
        onFileUpload={onFileUpload}
        onRemoveFile={onRemoveFile}
        onDownloadFile={onDownloadFile}
        projectId={projectId}
        mrrUploadedFile={mrrUploadedFile}
        mrrUploadStatus={mrrUploadStatus}
        mrrFileInputRef={mrrFileInputRef}
        onMRRFileUpload={onMRRFileUpload}
        onRemoveMRRFile={onRemoveMRRFile}
        onDownloadMRRFile={onDownloadMRRFile}
      />
    </div>
  );

  const renderSignOffContent = (title: string = 'Sign-off') => (
    <div className="space-y-4">
      {renderSectionHeader(title)}
      {renderPlaceholderSection('Sign-off')}
    </div>
  );

  const renderSPSpecialistsContent = () => (
    <div className="space-y-6">
      {renderSectionHeader('SP. Specialists')}
      {renderPlaceholderSection('SP. Specialists Overview')}
      
      <div className="ml-4 space-y-4">
        {renderSectionHeader('Tech Risk Corp - IT Audit')}
        {renderPlaceholderSection('Tech Risk Corp - IT Audit')}
      </div>
    </div>
  );

  const renderIndependenceContent = () => (
    <div className="space-y-6">
      {renderSectionHeader('Independence', '2.')}
      {renderPlaceholderSection('Independence Overview')}
      
      <div className="ml-4 space-y-6">
        {renderSectionHeader('Initial independence and conclusion', '1.')}
        <IndependenceRequirementsSection
          formData={formData}
          onFormDataChange={onFormDataChange}
        />
        
        <div className="mt-6">
          {renderSignOffContent()}
        </div>
      </div>
    </div>
  );

  const renderCommunicationsContent = () => (
    <div className="space-y-6">
      {renderSectionHeader('Communications, Inquiries and Minutes', '4.')}
      <TCWGCommunicationsSection
        formData={formData}
        onFormDataChange={onFormDataChange}
      />
      
      <div className="ml-4 space-y-4">
        {renderSignOffContent()}
      </div>
    </div>
  );

  // Find the engagement management section and its children
  const engagementMgmtSection = sidebarSections.find(
    s => s.id === 'engagement-management'
  );
  const engagementChildren = engagementMgmtSection?.children || [];

  // Find the entity wide procedures section and its children
  const entityWideSection = sidebarSections.find(
    s => s.id === 'entity-wide-procedures'
  );
  const entityChildren = entityWideSection?.children || [];

  // Dynamic cards based on sidebar section children (for engagement management)
  const renderEngagementManagementCardList = () => (
    <div className="flex flex-row flex-wrap gap-6 mt-2 mb-4">
      {engagementChildren.map(card => (
        <div
          key={card.id}
          className="w-[260px] flex-shrink-0"
        >
          <Card
            className="cursor-pointer border border-gray-200 shadow-md rounded-xl transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full"
            tabIndex={0}
            onClick={() => onSectionChange(card.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onSectionChange(card.id);
            }}
            aria-label={card.title}
            role="button"
          >
            <CardContent className="flex flex-col p-8 items-start min-h-[120px] h-full">
              <span className="text-xs text-muted-foreground font-semibold mb-1">
                {card.number ? card.number : ""}
              </span>
              <span className="text-gray-900 text-base font-medium">{card.title}</span>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );

  // Dynamic cards for entity wide procedures
  const renderEntityWideProceduresCardList = () => (
    <div className="flex flex-row flex-wrap gap-6 mt-2 mb-4">
      {entityChildren.map(card => (
        <div
          key={card.id}
          className="w-[260px] flex-shrink-0"
        >
          <Card
            className="cursor-pointer border border-gray-200 shadow-md rounded-xl transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full"
            tabIndex={0}
            onClick={() => onSectionChange(card.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onSectionChange(card.id);
            }}
            aria-label={card.title}
            role="button"
          >
            <CardContent className="flex flex-col p-8 items-start min-h-[120px] h-full">
              <span className="text-xs text-muted-foreground font-semibold mb-1">
                {card.number ? card.number : ""}
              </span>
              <span className="text-gray-900 text-base font-medium">{card.title}</span>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );

  // OVERRIDE EngagementManagementContent to cards navigation instead of info
  const renderEngagementManagementContent = () => (
    <div className="space-y-8">
      {renderSectionHeader('Engagement Management', '1.')}
      {renderEngagementManagementCardList()}

      <div className="ml-4 space-y-8">
        {renderEngagementProfileContent()}
        <div className="ml-4">
          {renderSignOffContent()}
        </div>
        
        {renderSPSpecialistsContent()}
        
        {renderIndependenceContent()}
        
        {renderCommunicationsContent()}
      </div>
    </div>
  );

  // NEW: Render cards overview for Entity wide procedures
  const renderEntityWideProceduresContent = () => (
    <div className="space-y-8">
      {renderSectionHeader('Entity wide procedures', '2.')}
      {renderEntityWideProceduresCardList()}

      {/* Optional: add child section renders if needed */}
    </div>
  );

  // Entity Wide Procedures parent section - shows its content and children
  {activeSection === 'entity-wide-procedures' && renderEntityWideProceduresContent()}

  // Entity Wide Procedures child sections
  {entityChildren.map(child =>
    activeSection === child.id ? (
      <div key={child.id} className="space-y-4">
        {renderSectionHeader(child.title, child.number)}
        {renderPlaceholderSection(child.title + " coming soon")}
      </div>
    ) : null
  )}

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <ProjectHeader
            projectName={project?.engagement_name || ''}
            engagementId={project?.engagement_id || ''}
            activeSection={activeSection}
            clientName={selectedClient?.name}
            auditType={formData.audit_type}
            onBack={onBack}
            onSave={onSave}
            saving={saving}
          />

          {/* Main parent section - shows all nested content */}
          {activeSection === 'engagement-management' && renderEngagementManagementContent()}

          {/* Engagement Profile parent section - shows its content and children */}
          {activeSection === 'engagement-profile-section' && (
            <div className="space-y-8">
              {renderEngagementProfileContent()}
              <div className="ml-4">
                {renderSignOffContent()}
              </div>
            </div>
          )}

          {/* SP Specialists parent section - shows its content and children */}
          {activeSection === 'sp-specialists-section' && renderSPSpecialistsContent()}

          {/* Independence parent section - shows its content and children */}
          {activeSection === 'independence-section' && renderIndependenceContent()}

          {/* Communications parent section - shows its content and children */}
          {activeSection === 'communications-section' && renderCommunicationsContent()}

          {/* Individual leaf sections */}
          {activeSection === 'sign-off-1' && renderSignOffContent()}
          {activeSection === 'sign-off-2' && renderSignOffContent()}
          {activeSection === 'sign-off-3' && renderSignOffContent()}

          {activeSection === 'tech-risk-corp' && (
            <div className="space-y-4">
              {renderSectionHeader('Tech Risk Corp - IT Audit')}
              {renderPlaceholderSection('Tech Risk Corp - IT Audit')}
            </div>
          )}

          {activeSection === 'initial-independence' && (
            <div className="space-y-4">
              {renderSectionHeader('Initial independence and conclusion', '1.')}
              <IndependenceRequirementsSection
                formData={formData}
                onFormDataChange={onFormDataChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEditContent;
