import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, updateDoc, getDocs, collection, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Project, Client, User } from '@/types';

import ProjectSidebar from '@/components/ProjectEdit/ProjectSidebar';
import ProjectHeader from '@/components/ProjectEdit/ProjectHeader';
import EngagementProfileSection from '@/components/ProjectEdit/EngagementProfileSection';
import LoadingScreen from '@/components/ProjectEdit/LoadingScreen';

const ProjectEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('engagement-profile');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState({
    client_id: '',
    engagement_name: '',
    engagement_id: '',
    project_id: '',
    assigned_to: [] as string[],
    status: 'new' as Project['status'],
    period_start: '',
    period_end: '',
    expected_start_date: '',
    audit_type: '',
    jurisdiction: '',
    bumex_office: '',
    language: 'English',
    is_first_audit: false,
    plan_to_roll_forward: false,
    enable_external_documents: false,
    engagement_structure_file: '',
    // New engagement evaluation fields
    engagement_evaluation_id: '',
    engagement_evaluation_status: 'Not Selected',
    evaluation_approval_date: '',
    planned_expiration_date: '',
    // New sentinel approval fields
    sentinel_approval_number: '',
    sentinel_approval_status: 'Not Selected',
    sentinel_approval_date: '',
    sentinel_expiration_date: '',
    // New radio button field
    first_period_auditing: 'Not selected',
    // Document attachment fields
    sentinel_approval_email_files: [] as Array<{name: string, url: string, type: string}>,
    ceac_approval_email_files: [] as Array<{name: string, url: string, type: string}>,
    other_documents_files: [] as Array<{name: string, url: string, type: string}>,
    // Engagement scope and scale fields
    financial_statement_audit_report: false,
    auditing_standards: [] as string[],
    financial_reporting_framework: [] as string[],
    audit_report_date: '',
    required_audit_file_closeout_date: '',
    // New component reporting and reviewer fields
    component_reporting: false,
    component_reporting_details: '',
    group_auditor: false,
    engagement_quality_control_reviewer: false,
    limited_scope_quality_control_reviewer: false,
    other_reviewer: false,
    governance_management_same_persons: false,
    entity_has_internal_audit_function: false,
    // New involvement of others fields
    entity_uses_service_organization: false,
    plan_to_involve_specialists: false,
    specialist_teams: [] as Array<{
      id: string;
      description: string;
      name: string;
      title: string;
    }>,
    // IT environment field
    entity_highly_dependent_on_it: 'Not selected',
    plan_to_rely_on_automated_controls: 'Not selected',
    use_it_critically_checklist: false,
    // Engagement team fields
    sufficient_appropriate_resources: false,
    team_competence_and_capabilities: false,
    // Direction and supervision field
    direction_supervision_documentation: '',
  });

  const sidebarSections = [
    { id: 'engagement-profile', title: 'Engagement Profile', active: true },
    { id: 'team-assignment', title: 'Team Assignment', active: false },
    { id: 'timeline', title: 'Timeline & Milestones', active: false },
    { id: 'documentation', title: 'Documentation', active: false },
    { id: 'risk-assessment', title: 'Risk Assessment', active: false },
    { id: 'planning', title: 'Audit Planning', active: false },
  ];

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      // Fetch project
      const projectDoc = await getDoc(doc(db, 'projects', id!));
      if (!projectDoc.exists()) {
        toast({
          title: 'Error',
          description: 'Project not found',
          variant: 'destructive',
        });
        navigate('/projects');
        return;
      }

      const projectData = {
        id: projectDoc.id,
        ...projectDoc.data(),
        created_at: projectDoc.data().created_at?.toDate() || new Date(),
        period_start: projectDoc.data().period_start?.toDate() || new Date(),
        period_end: projectDoc.data().period_end?.toDate() || new Date(),
      } as Project;

      setProject(projectData);
      setFormData({
        client_id: projectData.client_id,
        engagement_name: projectData.engagement_name,
        engagement_id: projectData.engagement_id,
        project_id: projectData.project_id || '',
        assigned_to: projectData.assigned_to,
        status: projectData.status,
        period_start: projectData.period_start.toISOString().split('T')[0],
        period_end: projectData.period_end.toISOString().split('T')[0],
        expected_start_date: projectData.period_start.toISOString().split('T')[0],
        audit_type: projectData.audit_type,
        jurisdiction: projectData.jurisdiction,
        bumex_office: projectData.bumex_office || '',
        language: projectData.language,
        is_first_audit: projectData.is_first_audit,
        plan_to_roll_forward: false,
        enable_external_documents: false,
        engagement_structure_file: (projectData as any).engagement_structure_file || '',
        // New engagement evaluation fields with defaults
        engagement_evaluation_id: (projectData as any).engagement_evaluation_id || '',
        engagement_evaluation_status: (projectData as any).engagement_evaluation_status || 'Not Selected',
        evaluation_approval_date: (projectData as any).evaluation_approval_date || '',
        planned_expiration_date: (projectData as any).planned_expiration_date || '',
        // New sentinel approval fields with defaults
        sentinel_approval_number: (projectData as any).sentinel_approval_number || '',
        sentinel_approval_status: (projectData as any).sentinel_approval_status || 'Not Selected',
        sentinel_approval_date: (projectData as any).sentinel_approval_date || '',
        sentinel_expiration_date: (projectData as any).sentinel_expiration_date || '',
        // New radio button field with default
        first_period_auditing: (projectData as any).first_period_auditing || 'Not selected',
        // Document attachment fields with defaults
        sentinel_approval_email_files: (projectData as any).sentinel_approval_email_files || [],
        ceac_approval_email_files: (projectData as any).ceac_approval_email_files || [],
        other_documents_files: (projectData as any).other_documents_files || [],
        // Engagement scope and scale fields with defaults
        financial_statement_audit_report: (projectData as any).financial_statement_audit_report || false,
        auditing_standards: (projectData as any).auditing_standards || [],
        financial_reporting_framework: (projectData as any).financial_reporting_framework || [],
        audit_report_date: (projectData as any).audit_report_date || '',
        required_audit_file_closeout_date: (projectData as any).required_audit_file_closeout_date || '',
        // New component reporting and reviewer fields with defaults
        component_reporting: (projectData as any).component_reporting || false,
        component_reporting_details: (projectData as any).component_reporting_details || '',
        group_auditor: (projectData as any).group_auditor || false,
        engagement_quality_control_reviewer: (projectData as any).engagement_quality_control_reviewer || false,
        limited_scope_quality_control_reviewer: (projectData as any).limited_scope_quality_control_reviewer || false,
        other_reviewer: (projectData as any).other_reviewer || false,
        governance_management_same_persons: (projectData as any).governance_management_same_persons || false,
        entity_has_internal_audit_function: (projectData as any).entity_has_internal_audit_function || false,
        // New involvement of others fields with defaults
        entity_uses_service_organization: (projectData as any).entity_uses_service_organization || false,
        plan_to_involve_specialists: (projectData as any).plan_to_involve_specialists || false,
        specialist_teams: (projectData as any).specialist_teams || [],
        // IT environment field with default
        entity_highly_dependent_on_it: (projectData as any).entity_highly_dependent_on_it || 'Not selected',
        plan_to_rely_on_automated_controls: (projectData as any).plan_to_rely_on_automated_controls || 'Not selected',
        use_it_critically_checklist: (projectData as any).use_it_critically_checklist || false,
        // Engagement team fields with defaults
        sufficient_appropriate_resources: (projectData as any).sufficient_appropriate_resources || false,
        team_competence_and_capabilities: (projectData as any).team_competence_and_capabilities || false,
        // Direction and supervision field with default
        direction_supervision_documentation: (projectData as any).direction_supervision_documentation || '',
      });

      // If there's an existing file, set the upload status and create a mock file object for display
      if ((projectData as any).engagement_structure_file) {
        setUploadStatus('success');
        // Extract filename from URL for display purposes
        const url = (projectData as any).engagement_structure_file;
        
        // Better filename extraction - decode URL and get the actual filename
        try {
          // For Firebase Storage URLs, the filename is typically after the last '/' and before '?'
          const decodedUrl = decodeURIComponent(url);
          const urlParts = decodedUrl.split('/');
          const fileNameWithPath = urlParts[urlParts.length - 1].split('?')[0];
          
          // Remove the folder path (e.g., "engagement-structures/projectId/timestamp-filename.pdf" -> "timestamp-filename.pdf")
          const fileName = fileNameWithPath.split('/').pop() || fileNameWithPath;
          
          // Remove the timestamp prefix if it exists (e.g., "1234567890-filename.pdf" -> "filename.pdf")
          const displayName = fileName.includes('-') && /^\d+/.test(fileName)
            ? fileName.substring(fileName.indexOf('-') + 1)
            : fileName;
          
          setUploadedFile({ name: displayName } as File);
        } catch (error) {
          console.error('Error extracting filename:', error);
          // Fallback to a generic name if extraction fails
          setUploadedFile({ name: 'engagement-structure.pdf' } as File);
        }
      }

      // Fetch clients and users
      const [clientsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'clients'))),
        getDocs(query(collection(db, 'users')))
      ]);

      setClients(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Client));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User));
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadStatus('uploading');
    
    try {
      // Create a reference to the file in Firebase Storage
      const fileName = `engagement-structures/${id}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      setUploadedFile(file);
      setUploadStatus('success');
      setFormData(prev => ({
        ...prev,
        engagement_structure_file: downloadURL
      }));
      
      toast({
        title: 'File uploaded',
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFile = async () => {
    if (formData.engagement_structure_file && formData.engagement_structure_file.startsWith('https://')) {
      try {
        // Delete the file from Firebase Storage
        const storageRef = ref(storage, formData.engagement_structure_file);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
        // Continue with removing the reference even if storage deletion fails
      }
    }

    setUploadedFile(null);
    setUploadStatus('idle');
    setFormData(prev => ({
      ...prev,
      engagement_structure_file: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadFile = () => {
    if (formData.engagement_structure_file) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = formData.engagement_structure_file;
      link.download = uploadedFile?.name || 'engagement-structure.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        ...formData,
        period_start: new Date(formData.period_start),
        period_end: new Date(formData.period_end),
        expected_start_date: new Date(formData.expected_start_date),
      };

      await updateDoc(doc(db, 'projects', id!), updateData);
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignmentChange = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: checked 
        ? [...prev.assigned_to, userId]
        : prev.assigned_to.filter(id => id !== userId)
    }));
  };

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);

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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <ProjectHeader
              projectName={project?.engagement_name || ''}
              engagementId={project?.engagement_id || ''}
              activeSection={activeSection}
              clientName={selectedClient?.name}
              auditType={formData.audit_type}
              onBack={() => navigate('/projects')}
              onSave={handleSave}
              saving={saving}
            />

            {activeSection === 'engagement-profile' && (
              <EngagementProfileSection
                formData={formData}
                clients={clients}
                users={users}
                uploadedFile={uploadedFile}
                uploadStatus={uploadStatus}
                onFormDataChange={handleFormDataChange}
                onAssignmentChange={handleAssignmentChange}
                onFileUpload={handleFileUpload}
                onRemoveFile={handleRemoveFile}
                onDownloadFile={handleDownloadFile}
                projectId={id}
              />
            )}

            {activeSection !== 'engagement-profile' && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">This section is under development</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEdit;
