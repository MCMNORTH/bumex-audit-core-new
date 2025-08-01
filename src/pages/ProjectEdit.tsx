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
          ]
        },
        {
          id: 'communications-section',
          title: 'Communications, inquiries and minutes',
          active: false,
          isParent: true,
          number: '4.',
          children: [
          ]
        }
      ]
    },
    {
      id: 'entity-wide-procedures',
      title: 'Entity wide procedures',
      isParent: true,
      active: false,
      number: '2.',
      children: [
        {
          id: 'materiality',
          title: 'Materiality',
          isParent: true,
          number: '1.',
          active: false,
          children: [
            { id: 'materiality-summary', title: 'Summary', number: '1.', active: false },
            { id: 'materiality-materiality', title: 'Materiality', number: '2.', active: false },
            { id: 'materiality-reevaluate', title: 'Re-evaluate', number: '3.', active: false },
          ],
        },
        {
          id: 'risk-assessment',
          title: 'Risk Assessment',
          isParent: true,
          number: '2.',
          active: false,
          children: [
            { id: 'entity-and-env', title: 'Entity and its environment', number: '1.', active: false },
            { id: 'planning-analytics', title: 'Planning analytics', number: '2.', active: false },
            { id: 'business-processes', title: 'Business processes', number: '3.', active: false },
            { id: 'rapd', title: 'RAPD', number: '4.', active: false },
          ],
        },
        {
          id: 'components-of-internal-control',
          title: 'Components of internal control',
          isParent: true,
          number: '3.',
          active: false,
          children: [
            { id: 'ceramic', title: 'CERAMIC', number: '1.', active: false },
            { id: 'it-understanding', title: 'IT Understanding', number: '2.', active: false },
            { 
              id: 'gitc-controls', 
              title: 'GITC. Controls', 
              active: false,
              isParent: true,
              children: [
                { 
                  id: 'ad-1-1-apd-1', 
                  title: 'AD 1.1APD-1 - Configuration des mots de passe', 
                  active: false,
                  isParent: true,
                  children: [
                    { id: 'ad-1-1-apd-1-d-i', title: '1 - D&I', active: false },
                    { id: 'ad-1-1-apd-1-toe', title: '2 - TOE', active: false },
                  ]
                },
                { id: 'ad-1-4-apd-1', title: 'AD 1.4 APD-1 - Comptes à pouvoir', active: false },
                { id: 'ad-2-1-pc-2', title: 'AD 2.1 PC-2 - Validation de la mise en production des changements', active: false },
                { id: 'seebi-1-1-apd-1', title: 'Seebi 1.1 APD-1 - Configuration des mots de passe', active: false },
                { id: 'seebi-1-4-apd-1', title: 'Seebi 1.4 APD-1 - Compte à pouvoir', active: false },
                { id: 'seebi-2-1-pc-1', title: 'Seebi 2.1 PC-1 - Validation de la mise en production des changements', active: false },
                { id: 'talend-4-1-co-1', title: 'Talend 4.1 CO-1 - Paramétrage de l\'ordonnanceur', active: false },
                { id: 'talend-4-1-co-2', title: 'Talend 4.1 CO-2 - Suivi et résolution des anomalies', active: false },
              ]
            },
            { id: 'significant-control-deficiencies', title: 'Significant Control Deficiencies', number: '3.', active: false },
            { id: 'def-deficiencies', title: 'DEF. Deficiencies', active: false },
            { id: 'so-service-org', title: 'SO. Service Organization', active: false },
          ],
        },
        {
          id: 'fraud',
          title: 'Fraud',
          isParent: true,
          number: '4.',
          active: false,
          children: [
            { id: 'fraud-risk', title: 'Fraud risk assessment and response', number: '1.', active: false },
            { id: 'je-plan-testwork', title: 'Journal entry plan and testwork', number: '2.', active: false },
          ],
        },
        {
          id: 'overall-response',
          title: 'Overall Response',
          isParent: true,
          number: '5.',
          active: false,
          children: [
            { id: 'general', title: 'General', number: '1.', active: false },
          ],
        },
        {
          id: 'plan-revisions',
          title: 'Plan revisions',
          isParent: false,
          number: '6.',
          active: false,
          // no children
        },
      ],
    },
    {
      id: 'business-processes',
      title: 'Business processes',
      isParent: true,
      active: false,
      number: '3.',
      children: [
        { 
          id: 'financial-reporting', 
          title: 'Financial reporting', 
          number: '1.', 
          active: false,
          isParent: true,
          children: [
            { id: 'financial-reporting-process', title: 'Financial reporting process', number: '1.', active: false },
            { 
              id: 'control-activities', 
              title: 'CA - Control activities', 
              active: false,
              isParent: true,
              children: [
                { id: 'controle-24', title: 'Contrôle 24', subtitle: 'Réconciliation des états financiers', active: false },
                { id: 'controle-25', title: 'Contrôle 25', subtitle: 'SOD', active: false },
              ]
            },
            { id: 'related-parties', title: 'RP - Related parties', active: false },
          ]
        },
        { id: 'litigation-claims', title: 'Litigation, claims and assessments', number: '2.', active: false },
        { id: 'ventes-clients', title: 'Ventes - Clients', number: '3.', active: false },
        { id: 'achats-fournisseurs', title: 'Achats - Fournisseurs', number: '4.', active: false },
        { id: 'immobilisations-incorporelles', title: 'Immobilisations Incorporelles', number: '5.', active: false },
        { id: 'stocks', title: 'Stocks', number: '6.', active: false },
        { id: 'tresorerie', title: 'Trésorerie', number: '7.', active: false },
        { id: 'mnsa-material-accounts', title: 'MNSA. Material non-significant accounts', number: '8.', active: false },
      ],
    },
    {
      id: 'conclusions-and-reporting',
      title: 'Conclusions and reporting',
      isParent: true,
      active: false,
      number: '4.',
    },
  ];

  // Team management state (local, to control dialog changes before Save)
  const [pendingLeadId, setPendingLeadId] = useState(formData.assigned_to[0] || '');
  const [pendingAssigned, setPendingAssigned] = useState([...formData.assigned_to]);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamSaving, setTeamSaving] = useState(false);

  useEffect(() => {
    if (formData.engagement_structure_file) {
      initializeExistingFile(formData.engagement_structure_file);
    }
    if (formData.mrr_file) {
      initializeMRRFile(formData.mrr_file);
    }
  }, [formData.engagement_structure_file, formData.mrr_file]);

  useEffect(() => {
    if (teamDialogOpen) {
      setPendingAssigned([...formData.assigned_to]);
      setPendingLeadId(formData.assigned_to[0] || '');
    }
  }, [teamDialogOpen, formData.assigned_to]);

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

  // Save assignments: project lead is always first member of assigned_to
  const handleSaveTeam = async () => {
    setTeamSaving(true);
    // Always place the lead at the front
    const distinctAssigned = pendingAssigned
      .filter(uid => uid !== pendingLeadId);
    const newAssigned = [pendingLeadId, ...distinctAssigned];
    // FIX: Pass newAssigned as value (string[]) for assigned_to
    await handleAssignmentChange('assigned_to', newAssigned as any); // Suppress type error here; ideally typing should support string[], but for now cast as any
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
        // Pass sidebarSections for dynamic cards
        sidebarSections={sidebarSections}
        onSectionChange={setActiveSection}
      />
    </div>
  );
};

export default ProjectEdit;
