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
  const [activeSection, setActiveSection] = useState('engagement-management');

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
      id: 'engagement-management',
      title: 'Engagement management',
      active: true,
      isParent: true,
      number: '1.',
      children: [
        { 
          id: 'engagement-profile-section', 
          title: 'Engagement profile & Strategy', 
          active: true, 
          number: '1.',
          isParent: true,
          children: [
            { id: 'sign-off-1', title: 'Sign-off', active: false },
          ]
        },
        { 
          id: 'sp-specialists-section', 
          title: 'SP. Specialists', 
          active: false,
          isParent: true,
          children: [
            { id: 'tech-risk-corp', title: 'Tech Risk Corp - IT Audit', active: false },
          ]
        },
        {
          id: 'independence-section',
          title: 'Independence',
          active: false,
          isParent: true,
          number: '2.',
          children: [
            { id: 'initial-independence', title: 'Initial independence and conclusion', active: false, number: '1.' },
            { id: 'sign-off-2', title: 'Sign-off', active: false },
          ]
        },
        {
          id: 'communications-section',
          title: 'Communications, inquiries and minutes',
          active: false,
          isParent: true,
          number: '4.',
          children: [
            { id: 'sign-off-3', title: 'Sign-off', active: false },
          ]
        }
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

  // Team management state (local, to control dialog changes before Save)
  const [pendingLeadId, setPendingLeadId] = useState(formData.assigned_to[0] || '');
  const [pendingAssigned, setPendingAssigned] = useState([...formData.assigned_to]);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamSaving, setTeamSaving] = useState(false);

  // When dialog is opened, sync local state with current project values
  useEffect(() => {
    if (teamDialogOpen) {
      setPendingAssigned([...formData.assigned_to]);
      setPendingLeadId(formData.assigned_to[0] || '');
    }
  }, [teamDialogOpen, formData.assigned_to]);

  // Save assignments: project lead is always first member of assigned_to
  const handleSaveTeam = async () => {
    setTeamSaving(true);
    // Always place the lead at the front
    const distinctAssigned = pendingAssigned
      .filter(uid => uid !== pendingLeadId);
    const newAssigned = [pendingLeadId, ...distinctAssigned];
    await handleAssignmentChange('assigned_to', newAssigned);
    setTeamSaving(false);
    setTeamDialogOpen(false);
  };

  // TOGGLE member (multi-select)
  const handleToggleMember = (userId: string) => {
    setPendingAssigned(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // CHANGE lead
  const handleChangeLead = (userId: string) => {
    setPendingLeadId(userId);
    // Make sure lead is included in assigned
    setPendingAssigned(prev => (prev.includes(userId) ? prev : [userId, ...prev]));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar
        projectName={project?.engagement_name || ''}
        clientName={selectedClient?.name}
        sections={sidebarSections}
        activeSection={activeSection}
        onBack={() => navigate('/projects')}
        onSectionChange={setActiveSection}
        // Pass team dialog props
        users={users}
        leadId={pendingLeadId}
        assignedIds={pendingAssigned}
        onChangeLead={handleChangeLead}
        onToggleMember={handleToggleMember}
        onSaveTeam={handleSaveTeam}
        teamSaving={teamSaving}
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
