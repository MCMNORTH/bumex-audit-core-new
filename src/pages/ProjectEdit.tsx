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
    fileInputRef,
    handleFileUpload,
    handleRemoveFile,
    handleDownloadFile,
    initializeExistingFile
  } = useFileUpload(id || '', (url) => handleFormDataChange({ engagement_structure_file: url }));

  // Create a separate file upload hook for MRR files
  const {
    uploadedFile: mrrUploadedFile,
    uploadStatus: mrrUploadStatus,
    fileInputRef: mrrFileInputRef,
    handleFileUpload: handleMRRFileUpload,
    handleRemoveFile: handleRemoveMRRFile,
    handleDownloadFile: handleDownloadMRRFile,
    initializeExistingFile: initializeMRRFile
  } = useFileUpload(id || '', (url) => handleFormDataChange({ mrr_file: url }));

  const sidebarSections = [
    { 
      id: 'team-assignment', 
      title: 'Team Assignment', 
      active: false 
    },
    {
      id: 'engagement-management',
      title: 'Engagement management',
      active: true,
      isParent: true,
      number: '1.',
      children: [
        { id: 'engagement-profile', title: 'Engagement Profile & Strategy', active: true },
        { id: 'acceptance-continuance', title: 'Acceptance & continuance', active: false },
        { id: 'pre-engagement', title: 'Pre-engagement activities', active: false },
      ]
    },
    {
      id: 'independence',
      title: 'Independence',
      active: false,
      isParent: true,
      number: '2.',
      children: [
        { id: 'independence-evaluation', title: 'Independence evaluation', active: false },
        { id: 'independence-documentation', title: 'Independence documentation', active: false },
      ]
    },
    {
      id: 'planning',
      title: 'Planning',
      active: false,
      isParent: true,
      number: '3.',
      children: [
        { id: 'planning-overview', title: 'Planning overview', active: false },
        { id: 'risk-assessment', title: 'Risk assessment', active: false },
        { id: 'audit-strategy', title: 'Audit strategy', active: false },
      ]
    },
    {
      id: 'execution',
      title: 'Execution',
      active: false,
      isParent: true,
      number: '4.',
      children: [
        { id: 'execution-overview', title: 'Execution overview', active: false },
        { id: 'substantive-procedures', title: 'Substantive procedures', active: false },
        { id: 'controls-testing', title: 'Controls testing', active: false },
      ]
    },
    {
      id: 'completion',
      title: 'Completion',
      active: false,
      isParent: true,
      number: '5.',
      children: [
        { id: 'completion-overview', title: 'Completion overview', active: false },
        { id: 'final-review', title: 'Final review', active: false },
        { id: 'reporting', title: 'Reporting', active: false },
      ]
    }
  ];

  useEffect(() => {
    if (formData.engagement_structure_file) {
      initializeExistingFile(formData.engagement_structure_file);
    }
    if (formData.mrr_file) {
      initializeMRRFile(formData.mrr_file);
    }
  }, [formData.engagement_structure_file, formData.mrr_file]);

  const handleRemoveFileWrapper = () => {
    handleRemoveFile(formData.engagement_structure_file);
  };

  const handleDownloadFileWrapper = () => {
    handleDownloadFile(formData.engagement_structure_file);
  };

  const handleRemoveMRRFileWrapper = () => {
    handleRemoveMRRFile(formData.mrr_file);
  };

  const handleDownloadMRRFileWrapper = () => {
    handleDownloadMRRFile(formData.mrr_file);
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar
        projectName={project?.engagement_name || ''}
        clientName={selectedClient?.name}
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
        fileInputRef={fileInputRef}
        onBack={() => navigate('/projects')}
        onSave={handleSave}
        onFormDataChange={handleFormDataChange}
        onAssignmentChange={handleAssignmentChange}
        onFileUpload={handleFileUpload}
        onRemoveFile={handleRemoveFileWrapper}
        onDownloadFile={handleDownloadFileWrapper}
        projectId={id}
        // MRR file upload props
        mrrUploadedFile={mrrUploadedFile}
        mrrUploadStatus={mrrUploadStatus}
        mrrFileInputRef={mrrFileInputRef}
        onMRRFileUpload={handleMRRFileUpload}
        onRemoveMRRFile={handleRemoveMRRFileWrapper}
        onDownloadMRRFile={handleDownloadMRRFileWrapper}
      />
    </div>
  );
};

export default ProjectEdit;
