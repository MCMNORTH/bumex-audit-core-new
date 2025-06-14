
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

  // Extended formData to match ProjectEditContent's FormData interface
  const extendedFormData = {
    ...formData,
    // Add missing fields with default values
    engagement_partner_id: '',
    engagement_manager_id: '',
    engagement_senior_id: '',
    engagement_associate_id: '',
    nature_of_engagement: '',
    engagement_description: '',
    team_partner_id: '',
    team_manager_id: '',
    team_senior_id: '',
    team_associate_id: '',
    planning_start_date: '',
    fieldwork_start_date: '',
    fieldwork_end_date: '',
    report_date: '',
    planning_documentation: [] as Array<{name: string, url: string, type: string}>,
    risk_assessment_documentation: [] as Array<{name: string, url: string, type: string}>,
    audit_procedures_documentation: [] as Array<{name: string, url: string, type: string}>,
    risk_assessment_summary: '',
    identified_risks: '',
    audit_approach: '',
    materiality_assessment: '',
    plan_to_rely_on_automated_controls: formData.plan_to_rely_on_automated_controls || 'Not selected',
    use_it_critically_checklist: formData.use_it_critically_checklist || false,
    sufficient_appropriate_resources: formData.sufficient_appropriate_resources || false,
    team_competence_and_capabilities: formData.team_competence_and_capabilities || false,
    direction_supervision_documentation: formData.direction_supervision_documentation || '',
  };

  // Wrapper function to handle assignment changes with correct signature
  const handleAssignmentChangeWrapper = (field: string, value: string) => {
    // For assignment changes, we expect field to be userId and value to be 'true'/'false'
    handleAssignmentChange(field, value === 'true');
  };

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
        formData={extendedFormData}
        activeSection={activeSection}
        saving={saving}
        uploadedFile={uploadedFile}
        uploadStatus={uploadStatus}
        onBack={() => navigate('/projects')}
        onSave={handleSave}
        onFormDataChange={handleFormDataChange}
        onAssignmentChange={handleAssignmentChangeWrapper}
        onFileUpload={handleFileUpload}
        onRemoveFile={handleRemoveFileWrapper}
        onDownloadFile={handleDownloadFileWrapper}
        projectId={id}
      />
    </div>
  );
};

export default ProjectEdit;
