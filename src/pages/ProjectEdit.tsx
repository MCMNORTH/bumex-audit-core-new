
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProjectData } from '@/hooks/useProjectData';
import { useFileUpload } from '@/hooks/useFileUpload';
import ProjectSidebar from '@/components/ProjectEdit/ProjectSidebar';
import ProjectEditContent from '@/components/ProjectEdit/ProjectEditContent';
import LoadingScreen from '@/components/ProjectEdit/LoadingScreen';

const ProjectEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('engagement-profile');

  const {
    id,
    project,
    clients,
    users,
    loading,
    saving,
    formData,
    handleSave,
    handleAssignmentChange,
    handleFormDataChange,
  } = useProjectData();

  const {
    uploadedFile,
    uploadStatus,
    handleFileUpload,
    handleRemoveFile,
    handleDownloadFile,
    initializeExistingFile
  } = useFileUpload(id || '', (url) => handleFormDataChange({ engagement_structure_file: url }));

  const sidebarSections = [
    { id: 'engagement-profile', title: 'Engagement Profile', active: true },
    { id: 'team-assignment', title: 'Team Assignment', active: false },
    { id: 'timeline', title: 'Timeline & Milestones', active: false },
    { id: 'documentation', title: 'Documentation', active: false },
    { id: 'risk-assessment', title: 'Risk Assessment', active: false },
    { id: 'planning', title: 'Audit Planning', active: false },
  ];

  useEffect(() => {
    if (formData.engagement_structure_file) {
      initializeExistingFile(formData.engagement_structure_file);
    }
  }, [formData.engagement_structure_file]);

  const handleRemoveFileWrapper = () => {
    handleRemoveFile(formData.engagement_structure_file);
  };

  const handleDownloadFileWrapper = () => {
    handleDownloadFile(formData.engagement_structure_file);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar
        projectName={project?.engagement_name || ''}
        engagementId={project?.engagement_id || ''}
        sections={sidebarSections}
        activeSection={activeSection}
        onBack={() => navigate('/projects')}
        onSectionChange={setActiveSection}
      />

      <ProjectEditContent
        project={project}
        clients={clients}
        users={users}
        formData={formData}
        activeSection={activeSection}
        saving={saving}
        uploadedFile={uploadedFile}
        uploadStatus={uploadStatus}
        onBack={() => navigate('/projects')}
        onSave={handleSave}
        onFormDataChange={handleFormDataChange}
        onAssignmentChange={handleAssignmentChange}
        onFileUpload={handleFileUpload}
        onRemoveFile={handleRemoveFileWrapper}
        onDownloadFile={handleDownloadFileWrapper}
        projectId={id}
      />
    </div>
  );
};

export default ProjectEdit;
