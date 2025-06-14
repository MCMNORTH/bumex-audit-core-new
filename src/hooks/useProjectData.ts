
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, updateDoc, getDocs, collection, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, Client, User } from '@/types';

export const useProjectData = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    engagement_evaluation_id: '',
    engagement_evaluation_status: 'Not Selected',
    evaluation_approval_date: '',
    planned_expiration_date: '',
    sentinel_approval_number: '',
    sentinel_approval_status: 'Not Selected',
    sentinel_approval_date: '',
    sentinel_expiration_date: '',
    first_period_auditing: 'Not selected',
    sentinel_approval_email_files: [] as Array<{name: string, url: string, type: string}>,
    ceac_approval_email_files: [] as Array<{name: string, url: string, type: string}>,
    other_documents_files: [] as Array<{name: string, url: string, type: string}>,
    financial_statement_audit_report: false,
    auditing_standards: [] as string[],
    financial_reporting_framework: [] as string[],
    audit_report_date: '',
    required_audit_file_closeout_date: '',
    component_reporting: false,
    component_reporting_details: '',
    group_auditor: false,
    engagement_quality_control_reviewer: false,
    limited_scope_quality_control_reviewer: false,
    other_reviewer: false,
    governance_management_same_persons: false,
    entity_has_internal_audit_function: false,
    entity_uses_service_organization: false,
    plan_to_involve_specialists: false,
    specialist_teams: [] as Array<{
      id: string;
      description: string;
      name: string;
      title: string;
    }>,
    entity_highly_dependent_on_it: 'Not selected',
    plan_to_rely_on_automated_controls: 'Not selected',
    use_it_critically_checklist: false,
    sufficient_appropriate_resources: false,
    team_competence_and_capabilities: false,
    direction_supervision_documentation: '',
    significant_factors_directing_activities: '',
    additional_information_documentation: '',
    // New audit strategy and planning fields
    gaap_conversion_activity: false,
    gaas_conversion_activity: false,
    current_period_evaluation_method: 'Dual method',
    prior_period_evaluation_method: 'Dual method',
    minimum_review_requirement: 'Global - No EQCR',
  });

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
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
        engagement_evaluation_id: (projectData as any).engagement_evaluation_id || '',
        engagement_evaluation_status: (projectData as any).engagement_evaluation_status || 'Not Selected',
        evaluation_approval_date: (projectData as any).evaluation_approval_date || '',
        planned_expiration_date: (projectData as any).planned_expiration_date || '',
        sentinel_approval_number: (projectData as any).sentinel_approval_number || '',
        sentinel_approval_status: (projectData as any).sentinel_approval_status || 'Not Selected',
        sentinel_approval_date: (projectData as any).sentinel_approval_date || '',
        sentinel_expiration_date: (projectData as any).sentinel_expiration_date || '',
        first_period_auditing: (projectData as any).first_period_auditing || 'Not selected',
        sentinel_approval_email_files: (projectData as any).sentinel_approval_email_files || [],
        ceac_approval_email_files: (projectData as any).ceac_approval_email_files || [],
        other_documents_files: (projectData as any).other_documents_files || [],
        financial_statement_audit_report: (projectData as any).financial_statement_audit_report || false,
        auditing_standards: (projectData as any).auditing_standards || [],
        financial_reporting_framework: (projectData as any).financial_reporting_framework || [],
        audit_report_date: (projectData as any).audit_report_date || '',
        required_audit_file_closeout_date: (projectData as any).required_audit_file_closeout_date || '',
        component_reporting: (projectData as any).component_reporting || false,
        component_reporting_details: (projectData as any).component_reporting_details || '',
        group_auditor: (projectData as any).group_auditor || false,
        engagement_quality_control_reviewer: (projectData as any).engagement_quality_control_reviewer || false,
        limited_scope_quality_control_reviewer: (projectData as any).limited_scope_quality_control_reviewer || false,
        other_reviewer: (projectData as any).other_reviewer || false,
        governance_management_same_persons: (projectData as any).governance_management_same_persons || false,
        entity_has_internal_audit_function: (projectData as any).entity_has_internal_audit_function || false,
        entity_uses_service_organization: (projectData as any).entity_uses_service_organization || false,
        plan_to_involve_specialists: (projectData as any).plan_to_involve_specialists || false,
        specialist_teams: (projectData as any).specialist_teams || [],
        entity_highly_dependent_on_it: (projectData as any).entity_highly_dependent_on_it || 'Not selected',
        plan_to_rely_on_automated_controls: (projectData as any).plan_to_rely_on_automated_controls || 'Not selected',
        use_it_critically_checklist: (projectData as any).use_it_critically_checklist || false,
        sufficient_appropriate_resources: (projectData as any).sufficient_appropriate_resources || false,
        team_competence_and_capabilities: (projectData as any).team_competence_and_capabilities || false,
        direction_supervision_documentation: (projectData as any).direction_supervision_documentation || '',
        significant_factors_directing_activities: (projectData as any).significant_factors_directing_activities || '',
        additional_information_documentation: (projectData as any).additional_information_documentation || '',
        // New audit strategy and planning fields
        gaap_conversion_activity: (projectData as any).gaap_conversion_activity || false,
        gaas_conversion_activity: (projectData as any).gaas_conversion_activity || false,
        current_period_evaluation_method: (projectData as any).current_period_evaluation_method || 'Dual method',
        prior_period_evaluation_method: (projectData as any).prior_period_evaluation_method || 'Dual method',
        minimum_review_requirement: (projectData as any).minimum_review_requirement || 'Global - No EQCR',
      });

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

  return {
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
    setFormData
  };
};
