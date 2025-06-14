import { Card, CardContent } from '@/components/ui/card';
import { Client, User, Project } from '@/types';
import { ProjectFormData } from '@/types/formData';
import ProjectHeader from './ProjectHeader';
import EngagementProfileSection from './EngagementProfileSection';
import IndependenceRequirementsSection from './IndependenceRequirementsSection';

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
  onDownloadMRRFile
}: ProjectEditContentProps) => {
  const selectedClient = clients.find(c => c.id === formData.client_id);

  const handleAssignmentChange = (userId: string, checked: boolean) => {
    const currentAssignments = formData.assigned_to || [];
    const updatedAssignments = checked 
      ? [...currentAssignments, userId]
      : currentAssignments.filter(id => id !== userId);
    
    onFormDataChange({ assigned_to: updatedAssignments });
  };

  const renderPlaceholderSection = (title: string) => (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-gray-500">{title} section coming soon</p>
      </CardContent>
    </Card>
  );

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

          {/* Main parent section */}
          {activeSection === 'engagement-management' && renderPlaceholderSection('Engagement Management')}

          {/* Engagement Profile parent section */}
          {activeSection === 'engagement-profile-section' && renderPlaceholderSection('Engagement Profile & Strategy Overview')}

          {/* SP Specialists parent section */}
          {activeSection === 'sp-specialists-section' && renderPlaceholderSection('SP. Specialists Overview')}

          {/* Independence parent section */}
          {activeSection === 'independence-section' && renderPlaceholderSection('Independence Overview')}

          {/* Communications parent section */}
          {activeSection === 'communications-section' && renderPlaceholderSection('Communications, Inquiries and Minutes Overview')}

          {/* Existing sections - now as leaf nodes */}
          {activeSection === 'engagement-profile' && (
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
          )}

          {/* Sign-off sections */}
          {activeSection === 'sign-off-1' && renderPlaceholderSection('Sign-off')}
          {activeSection === 'sign-off-2' && renderPlaceholderSection('Sign-off')}
          {activeSection === 'sign-off-3' && renderPlaceholderSection('Sign-off')}

          {/* Tech Risk Corp - IT Audit */}
          {activeSection === 'tech-risk-corp' && renderPlaceholderSection('Tech Risk Corp - IT Audit')}

          {/* Initial independence and conclusion */}
          {activeSection === 'initial-independence' && (
            <IndependenceRequirementsSection
              formData={formData}
              onFormDataChange={onFormDataChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEditContent;
