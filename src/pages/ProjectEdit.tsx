import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProjectData } from '@/hooks/useProjectData';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useComments } from '@/hooks/useComments';
import ProjectSidebar from '@/components/ProjectEdit/ProjectSidebar';
import ProjectEditContent from '@/components/ProjectEdit/ProjectEditContent';
import LoadingScreen from '@/components/ProjectEdit/LoadingScreen';
import { RightToolbar, CommentsPanel } from '@/components/ProjectEdit/Comments';
import { canViewTeamManagement, getProjectRole, getPendingReviewRoles } from '@/utils/permissions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ProjectEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('project-dashboard');
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedFieldLabel, setSelectedFieldLabel] = useState<string>('');
  const [mappedProcesses, setMappedProcesses] = useState<Array<{ id: string; name: string }>>([]);
  const [isFinancialStatementsValidated, setIsFinancialStatementsValidated] = useState(false);

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

  useEffect(() => {
    if (!id) {
      setMappedProcesses([]);
      setIsFinancialStatementsValidated(false);
      return;
    }

    const mappingRef = doc(db, `projects/${id}/knowledge_base/process_mapping`);
    const fsRef = doc(db, `projects/${id}/knowledge_base/financial_statements`);

    const unsubMapping = onSnapshot(mappingRef, (snap) => {
      if (!snap.exists()) {
        setMappedProcesses([]);
        return;
      }
      const data = snap.data() as { processes?: Array<{ id?: string; name?: string }> };
      const processes = (data.processes ?? [])
        .map((processItem, index) => ({
          id: String(processItem.id ?? `process-${index + 1}`),
          name: String(processItem.name ?? '').trim(),
        }))
        .filter((processItem) => processItem.name.length > 0);
      setMappedProcesses(processes);
    });

    const unsubFs = onSnapshot(fsRef, (snap) => {
      if (!snap.exists()) {
        setIsFinancialStatementsValidated(false);
        return;
      }
      const data = snap.data() as { tree?: unknown[] };
      setIsFinancialStatementsValidated(Array.isArray(data.tree) && data.tree.length > 0);
    });

    return () => {
      unsubMapping();
      unsubFs();
    };
  }, [id]);

  const {
    comments,
    createComment,
    markResolved,
    getSectionCommentCount,
    getFieldCommentCount,
  } = useComments(id);

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
            {
              id: 'related-parties',
              title: 'RP - Related parties',
              active: false,
              isParent: true,
              signOffLevel: 'incharge' as const,
              children: [
                {
                  id: 'related-parties-intercos',
                  title: 'Intercos',
                  subtitle: 'R\u00e9conciliation des comptes intercos',
                  active: false,
                  signOffLevel: 'incharge' as const,
                },
              ],
            },
          ]
        },
        {
          id: 'litigation-claims',
          title: 'Litigation, claims and assessments',
          number: '2.',
          active: false,
          isParent: true,
          signOffLevel: 'incharge' as const,
          children: [
            { id: 'litigation-claims-leadsheet', title: 'Leadsheet', number: '0', active: false, signOffLevel: 'incharge' as const },
            { id: 'litigation-claims-understanding', title: 'Understanding, Risks and Response', number: '1', active: false, signOffLevel: 'incharge' as const },
            { id: 'litigation-claims-laws', title: 'Understand laws & litigation', number: '1.1', active: false, signOffLevel: 'incharge' as const },
            { id: 'litigation-claims-results', title: 'Results', number: '2', active: false, signOffLevel: 'incharge' as const },
            {
              id: 'litigation-claims-substantive',
              title: 'Substantive Procedures',
              number: 'SUB',
              active: false,
              isParent: true,
              signOffLevel: 'incharge' as const,
              children: [
                {
                  id: 'litigation-claims-substantive-tod-01',
                  title: 'TOD_01. Revue des PRC',
                  active: false,
                  isParent: true,
                  signOffLevel: 'incharge' as const,
                  children: [
                    { id: 'litigation-claims-substantive-tod-01-design', title: '1. Design TOD', active: false, signOffLevel: 'incharge' as const },
                    { id: 'litigation-claims-substantive-tod-01-perform', title: '2. Perform TOD', active: false, signOffLevel: 'incharge' as const },
                  ],
                },
              ],
            },
          ],
        },
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
      children: [
        {
          id: 'conclusions-reporting-evaluate-result',
          title: '1. Evaluate audit result',
          active: false,
          isParent: true,
          signOffLevel: 'incharge' as const,
          children: [
            { id: 'conclusions-reporting-final-analytics', title: '0. Final analytics', active: false, signOffLevel: 'incharge' as const },
            { id: 'conclusions-reporting-risk-update', title: '1. Risk assessment update', active: false, signOffLevel: 'incharge' as const },
            { id: 'conclusions-reporting-management-bias', title: '2. Management bias', active: false, signOffLevel: 'incharge' as const },
            { id: 'conclusions-reporting-evaluate-financial-statements', title: '3. Evaluate financial statements', active: false, signOffLevel: 'incharge' as const },
            { id: 'conclusions-reporting-summary-misstatements', title: '4. Summary of audit misstatements', active: false, signOffLevel: 'incharge' as const },
            { id: 'conclusions-reporting-subsequent-events', title: '5. Subsequent events', active: false, signOffLevel: 'incharge' as const },
            { id: 'conclusions-reporting-completion', title: '6. Completion', active: false, signOffLevel: 'incharge' as const },
          ],
        },
        {
          id: 'conclusions-reporting-reporting',
          title: '2. Reporting',
          active: false,
          signOffLevel: 'incharge' as const,
        },
      ],
    },
  ];

  const sidebarSectionsWithDynamicProcesses = useMemo(() => {
    const copy = JSON.parse(JSON.stringify(sidebarSections));
    const businessProcesses = copy.find((section: any) => section.id === 'business-processes');
    if (!businessProcesses || !Array.isArray(businessProcesses.children)) return copy;

    const baseChildren = businessProcesses.children.filter(
      (child: any) => typeof child.id === 'string' && !child.id.startsWith('bp-process-')
    );
    const mnsaIndex = baseChildren.findIndex((child: any) => child.id === 'mnsa-material-accounts');

    const slugify = (value: string) =>
      value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const dynamicSections =
      isFinancialStatementsValidated
        ? mappedProcesses.map((processItem, index) => {
            const slug = slugify(processItem.name || processItem.id || `process-${index + 1}`);
            const baseId = `bp-process-${slug || processItem.id || index + 1}`;
            return {
              id: baseId,
              title: processItem.name,
              number: `${index + 3}.`,
              active: false,
              isParent: true,
              signOffLevel: 'incharge' as const,
              meta: {
                processId: processItem.id,
                processName: processItem.name,
              },
              children: [
                { id: `${baseId}-leadsheet`, title: 'Leadsheet', number: '0', active: false, signOffLevel: 'incharge' as const, meta: { processId: processItem.id, processName: processItem.name } },
                { id: `${baseId}-understanding`, title: 'Understanding, Risks and Response', number: '1', active: false, signOffLevel: 'incharge' as const, meta: { processId: processItem.id, processName: processItem.name } },
                { id: `${baseId}-results`, title: 'Results', number: '2', active: false, signOffLevel: 'incharge' as const, meta: { processId: processItem.id, processName: processItem.name } },
                { id: `${baseId}-ca`, title: 'Control activities', number: 'CA', active: false, signOffLevel: 'incharge' as const, meta: { processId: processItem.id, processName: processItem.name } },
                { id: `${baseId}-sub`, title: 'Substantive Procedures', number: 'SUB', active: false, signOffLevel: 'incharge' as const, meta: { processId: processItem.id, processName: processItem.name } },
              ],
            };
          })
        : [];

    if (mnsaIndex >= 0) {
      baseChildren.splice(mnsaIndex, 0, ...dynamicSections);
    } else {
      baseChildren.push(...dynamicSections);
    }

    businessProcesses.children = baseChildren;
    return copy;
  }, [sidebarSections, mappedProcesses, isFinancialStatementsValidated]);

  const isDashboardOrKnowledgeBase =
    activeSection === 'project-dashboard' || activeSection === 'knowledge-base';

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

  useEffect(() => {
    if (location.pathname.endsWith('/knowledge-base')) {
      setActiveSection('knowledge-base');
      return;
    }

    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [location.pathname, location.search]);

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

  // Get all team member IDs for comments
  const selectedClient = clients.find(c => c.id === formData.client_id);
  const userProjectRole = getProjectRole(user, formData);

  // Get all team member IDs for comments
  const teamMemberIds = [
    ...(formData.team_assignments?.staff_ids || []),
    ...(formData.team_assignments?.in_charge_ids || []),
    ...(formData.team_assignments?.manager_ids || []),
    ...(formData.team_assignments?.partner_ids || []),
    formData.team_assignments?.lead_partner_id,
  ].filter(Boolean) as string[];

  const handleCreateComment = (fieldId: string, sectionId: string, fieldLabel?: string) => {
    setSelectedFieldId(fieldId);
    setSelectedFieldLabel(fieldLabel || fieldId);
    setShowCommentsPanel(true);
  };

  const handleCloseCommentsPanel = () => {
    setShowCommentsPanel(false);
    setSelectedFieldId(null);
    setSelectedFieldLabel('');
  };

  const totalSectionComments = getSectionCommentCount(activeSection);

  // Calculate team member count
  const teamMemberCount = teamMemberIds.length;

  // Calculate sign-off stats and collect unsigned sections
  const getSignOffData = (sections: any[]) => {
    let total = 0;
    let unsigned = 0;
    const unsignedSections: { id: string; title: string; number?: string }[] = [];
    
    const processSection = (section: any) => {
      if (section.signOffLevel) {
        total++;
        const isSigned = formData.signoffs?.[section.id]?.signedBy;
        if (!isSigned) {
          unsigned++;
          unsignedSections.push({
            id: section.id,
            title: section.title,
            number: section.number,
          });
        }
      }
      if (section.children && section.children.length > 0) {
        section.children.forEach(processSection);
      }
    };
    
    sections.forEach(processSection);
    return { total, unsigned, unsignedSections };
  };
  
  const signOffData = getSignOffData(sidebarSectionsWithDynamicProcesses);

  // Calculate pending reviews
  const getPendingReviewsData = (sections: any[]) => {
    const pendingReviews: { sectionId: string; sectionTitle: string; pendingRoles: string[] }[] = [];
    
    const processSection = (section: any) => {
      if (section.signOffLevel) {
        const pendingRoles = getPendingReviewRoles(section.id, formData);
        // Only include if there are some completed reviews (section is in review flow)
        const hasAnyReview = formData.reviews?.[section.id];
        if (hasAnyReview && pendingRoles.length > 0 && pendingRoles.length < 5) {
          pendingReviews.push({
            sectionId: section.id,
            sectionTitle: section.title,
            pendingRoles: pendingRoles.map(role => role.replace('_', ' ')),
          });
        }
      }
      if (section.children && section.children.length > 0) {
        section.children.forEach(processSection);
      }
    };
    
    sections.forEach(processSection);
    return pendingReviews;
  };

  const pendingReviews = getPendingReviewsData(sidebarSectionsWithDynamicProcesses);

  const findSectionTitle = (sections: any[], sectionId: string): string | null => {
    for (const section of sections) {
      if (section.id === sectionId) return section.number ? `${section.number} ${section.title}` : section.title;
      if (Array.isArray(section.children) && section.children.length > 0) {
        const nested = findSectionTitle(section.children, sectionId);
        if (nested) return nested;
      }
    }
    return null;
  };

  const currentSectionTitle = findSectionTitle(sidebarSectionsWithDynamicProcesses, activeSection) ?? undefined;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isDashboardOrKnowledgeBase && (
        <ProjectSidebar
          projectName={project?.engagement_name || ''}
          clientName={selectedClient?.name}
          sections={sidebarSectionsWithDynamicProcesses}
          activeSection={activeSection}
          currentUserRole={user?.role}
          formData={formData}
          currentUser={user}
          userProjectRole={userProjectRole}
          onBack={() => navigate('/projects')}
          onSectionChange={setActiveSection}
        />
      )}

      <div className={`flex-1 ${!isDashboardOrKnowledgeBase ? 'pl-64' : ''}`}>
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
        sidebarSections={sidebarSectionsWithDynamicProcesses}
        onSectionChange={setActiveSection}
        onReview={handleReview}
        onUnreview={handleUnreview}
        // Comments props
        onCreateComment={handleCreateComment}
        getFieldCommentCount={getFieldCommentCount}
        // Dashboard props
        signOffData={signOffData}
        pendingReviews={pendingReviews}
        teamMemberCount={teamMemberCount}
        currentSectionTitle={currentSectionTitle}
      />

      <RightToolbar
        onOpenComments={() => setShowCommentsPanel(true)}
        commentCount={totalSectionComments}
        onNavigateToTeam={() => setActiveSection('team-section')}
        onNavigateToSignOffs={() => setActiveSection('project-signoffs-summary')}
        showTeamManagement={canViewTeamManagement(user)}
        activeSection={activeSection}
        sidebarVisible={!isDashboardOrKnowledgeBase}
        teamMemberCount={teamMemberCount}
        unsignedSectionsCount={signOffData.unsigned}
        totalSectionsCount={signOffData.total}
        unsignedSections={signOffData.unsignedSections}
        pendingReviews={pendingReviews}
        onNavigateToSection={setActiveSection}
        userProjectRole={userProjectRole}
        projectId={id}
        />
      </div>

      <CommentsPanel
        isOpen={showCommentsPanel}
        onClose={handleCloseCommentsPanel}
        comments={comments}
        users={users}
        currentUserId={user?.id || ''}
        projectId={id || ''}
        sectionId={activeSection}
        fieldId={selectedFieldId}
        fieldLabel={selectedFieldLabel}
        teamMemberIds={teamMemberIds}
        onCreateComment={createComment}
        onMarkResolved={markResolved}
      />
    </div>
  );
};

export default ProjectEdit;
