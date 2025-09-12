import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProjectData } from '@/hooks/useProjectData';
import { useFileUpload } from '@/hooks/useFileUpload';
import ProjectSidebar from '@/components/ProjectEdit/ProjectSidebar';
import ProjectEditContent from '@/components/ProjectEdit/ProjectEditContent';
import LoadingScreen from '@/components/ProjectEdit/LoadingScreen';
import { canViewTeamManagement } from '@/utils/permissions';

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
    handleReview,
    handleUnreview,
    handleSignOff,
    handleUnsign,
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
      signOffLevel: 'manager' as const,
      children: [
        { 
          id: 'engagement-profile-section', 
          title: 'Engagement profile & Strategy', 
          active: true, 
          number: '1.',
          signOffLevel: 'incharge' as const,
          isParent: true,
          children: []
        },
        { 
          id: 'sp-specialists-section', 
          title: 'SP. Specialists', 
          active: false,
          signOffLevel: 'incharge' as const,
          isParent: true,
          children: [
            { 
              id: 'tech-risk-corp', 
              title: 'Tech Risk Corp - IT Audit', 
              active: false,
              signOffLevel: 'incharge' as const,
            },
          ]
        },
        {
          id: 'independence-section',
          title: 'Independence',
          active: false,
          isParent: true,
          number: '2.',
          signOffLevel: 'incharge' as const,
          children: [
            { 
              id: 'initial-independence', 
              title: 'Initial independence and conclusion', 
              active: false, 
              number: '1.',
              signOffLevel: 'incharge' as const,
            },
          ]
        },
        {
          id: 'communications-section',
          title: 'Communications, inquiries and minutes',
          active: false,
          isParent: true,
          number: '4.',
          signOffLevel: 'incharge' as const,
          children: []
        }
      ]
    },
    {
      id: 'entity-wide-procedures',
      title: 'Entity wide procedures',
      isParent: true,
      active: false,
      number: '2.',
      signOffLevel: 'manager' as const,
      children: [
        {
          id: 'materiality',
          title: 'Materiality',
          isParent: true,
          number: '1.',
          active: false,
          signOffLevel: 'incharge' as const,
          children: [
            { id: 'materiality-summary', title: 'Summary', number: '1.', active: false, signOffLevel: 'incharge' as const },
            { id: 'materiality-materiality', title: 'Materiality', number: '2.', active: false, signOffLevel: 'incharge' as const },
            { id: 'materiality-reevaluate', title: 'Re-evaluate', number: '3.', active: false, signOffLevel: 'incharge' as const },
          ],
        },
        {
          id: 'risk-assessment',
          title: 'Risk Assessment',
          isParent: true,
          number: '2.',
          active: false,
          signOffLevel: 'incharge' as const,
          children: [
            { id: 'entity-and-env', title: 'Entity and its environment', number: '1.', active: false, signOffLevel: 'incharge' as const },
            { id: 'planning-analytics', title: 'Planning analytics', number: '2.', active: false, signOffLevel: 'incharge' as const },
            { id: 'risk-business-processes', title: 'Business processes', number: '3.', active: false, signOffLevel: 'incharge' as const },
            { id: 'rapd', title: 'RAPD', number: '4.', active: false, signOffLevel: 'incharge' as const },
          ],
        },
        {
          id: 'components-of-internal-control',
          title: 'Components of internal control',
          isParent: true,
          number: '3.',
          active: false,
          signOffLevel: 'incharge' as const,
          children: [
            { id: 'ceramic', title: 'CERAMIC', number: '1.', active: false, signOffLevel: 'incharge' as const },
            { id: 'it-understanding', title: 'IT Understanding', number: '2.', active: false, signOffLevel: 'incharge' as const },
            { 
              id: 'gitc-controls', 
              title: 'GITC. Controls', 
              active: false,
              isParent: true,
              signOffLevel: 'incharge' as const,
              children: [
                { 
                  id: 'ad-1-1-apd-1', 
                  title: 'AD 1.1APD-1 - Configuration des mots de passe', 
                  active: false,
                  isParent: true,
                  signOffLevel: 'incharge' as const,
                  children: [
                    { id: 'ad-1-1-apd-1-d-i', title: '1 - D&I', active: false, signOffLevel: 'incharge' as const },
                    { id: 'ad-1-1-apd-1-toe', title: '2 - TOE', active: false, signOffLevel: 'incharge' as const },
                  ]
                },
                { id: 'ad-1-4-apd-1', title: 'AD 1.4 APD-1 - Comptes à pouvoir', active: false, signOffLevel: 'incharge' as const },
                { id: 'ad-2-1-pc-2', title: 'AD 2.1 PC-2 - Validation de la mise en production des changements', active: false, signOffLevel: 'incharge' as const },
                { id: 'seebi-1-1-apd-1', title: 'Seebi 1.1 APD-1 - Configuration des mots de passe', active: false, signOffLevel: 'incharge' as const },
                { id: 'seebi-1-4-apd-1', title: 'Seebi 1.4 APD-1 - Compte à pouvoir', active: false, signOffLevel: 'incharge' as const },
                { id: 'seebi-2-1-pc-1', title: 'Seebi 2.1 PC-1 - Validation de la mise en production des changements', active: false, signOffLevel: 'incharge' as const },
                { id: 'talend-4-1-co-1', title: 'Talend 4.1 CO-1 - Paramétrage de l\'ordonnanceur', active: false, signOffLevel: 'incharge' as const },
                { id: 'talend-4-1-co-2', title: 'Talend 4.1 CO-2 - Suivi et résolution des anomalies', active: false, signOffLevel: 'incharge' as const },
              ]
            },
            { id: 'significant-control-deficiencies', title: 'Significant Control Deficiencies', number: '3.', active: false, signOffLevel: 'incharge' as const },
            { id: 'def-deficiencies', title: 'DEF. Deficiencies', active: false, signOffLevel: 'incharge' as const },
            { id: 'so-service-org', title: 'SO. Service Organization', active: false, signOffLevel: 'incharge' as const },
          ],
        },
        {
          id: 'fraud',
          title: 'Fraud',
          isParent: true,
          number: '4.',
          active: false,
          signOffLevel: 'incharge' as const,
          children: [
            { id: 'fraud-risk', title: 'Fraud risk assessment and response', number: '1.', active: false, signOffLevel: 'incharge' as const },
            { id: 'je-plan-testwork', title: 'Journal entry plan and testwork', number: '2.', active: false, signOffLevel: 'incharge' as const },
          ],
        },
        {
          id: 'overall-response',
          title: 'Overall Response',
          isParent: true,
          number: '5.',
          active: false,
          signOffLevel: 'incharge' as const,
          children: [
            { id: 'general', title: 'General', number: '1.', active: false, signOffLevel: 'incharge' as const },
          ],
        },
        {
          id: 'plan-revisions',
          title: 'Plan revisions',
          isParent: false,
          number: '6.',
          active: false,
          signOffLevel: 'incharge' as const,
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
      signOffLevel: 'manager' as const,
      children: [
        { 
          id: 'financial-reporting', 
          title: 'Financial reporting', 
          number: '1.', 
          active: false,
          isParent: true,
          signOffLevel: 'incharge' as const,
          children: [
            { id: 'financial-reporting-process', title: 'Financial reporting process', number: '1.', active: false, signOffLevel: 'incharge' as const },
            { 
              id: 'control-activities', 
              title: 'CA - Control activities', 
              active: false,
              isParent: true,
              signOffLevel: 'incharge' as const,
              children: [
                { 
                  id: 'controle-24', 
                  title: 'Contrôle 24', 
                  subtitle: 'Réconciliation des états financiers', 
                  active: false,
                  isParent: true,
                  signOffLevel: 'incharge' as const,
                  children: [
                    { id: 'controle-24-d-i', title: '1 - D&I', active: false, signOffLevel: 'incharge' as const },
                    { id: 'controle-24-toe', title: '2 - TOE', active: false, signOffLevel: 'incharge' as const },
                  ]
                },
                { id: 'controle-25', title: 'Contrôle 25', subtitle: 'SOD', active: false, signOffLevel: 'incharge' as const },
              ]
            },
            { id: 'related-parties', title: 'RP - Related parties', active: false, signOffLevel: 'incharge' as const },
          ]
        },
        { id: 'litigation-claims', title: 'Litigation, claims and assessments', number: '2.', active: false, signOffLevel: 'incharge' as const },
        { id: 'ventes-clients', title: 'Ventes - Clients', number: '3.', active: false, signOffLevel: 'incharge' as const },
        { id: 'achats-fournisseurs', title: 'Achats - Fournisseurs', number: '4.', active: false, signOffLevel: 'incharge' as const },
        { id: 'immobilisations-incorporelles', title: 'Immobilisations Incorporelles', number: '5.', active: false, signOffLevel: 'incharge' as const },
        { id: 'stocks', title: 'Stocks', number: '6.', active: false, signOffLevel: 'incharge' as const },
        { id: 'tresorerie', title: 'Trésorerie', number: '7.', active: false, signOffLevel: 'incharge' as const },
        { id: 'mnsa-material-accounts', title: 'MNSA. Material non-significant accounts', number: '8.', active: false, signOffLevel: 'incharge' as const },
      ],
    },
    {
      id: 'conclusions-and-reporting',
      title: 'Conclusions and reporting',
      isParent: true,
      active: false,
      number: '4.',
      signOffLevel: 'manager' as const,
    },
    {
      id: 'team-section',
      title: 'Team Management',
      isParent: false,
      active: false,
    },
    {
      id: 'project-signoffs-summary',
      title: 'Project Sign-offs Summary',
      isParent: false,
      active: false,
    },
  ];

  // Initialize existing files

  useEffect(() => {
    if (formData.engagement_structure_file) {
      initializeExistingFile(formData.engagement_structure_file);
    }
  }, [formData.engagement_structure_file]);

  useEffect(() => {
    if (formData.mrr_file) {
      initializeMRRFile(formData.mrr_file);
    }
  }, [formData.mrr_file]);

  const handleRemoveFileWrapper = () => {
    handleRemoveFile(formData.engagement_structure_file);
    handleFormDataChange({ engagement_structure_file: '' });
  };

  const handleDownloadFileWrapper = () => {
    handleDownloadFile(formData.engagement_structure_file);
  };

  const handleRemoveMRRFileWrapper = () => {
    handleRemoveMRRFile(formData.mrr_file);
    handleFormDataChange({ mrr_file: '' });
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
        currentUserRole={user?.role}
        formData={formData}
        currentUser={user}
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
        currentUserId={user?.id}
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
        // Pass sidebarSections for dynamic cards and sign-off handlers
        sidebarSections={sidebarSections}
        onSectionChange={setActiveSection}
        onReview={handleReview}
        onUnreview={handleUnreview}
      />
    </div>
  );
};

export default ProjectEdit;
