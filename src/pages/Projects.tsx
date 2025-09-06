import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReferenceData } from '@/hooks/useReferenceData';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/types';
import { Plus, Search, FolderOpen, Calendar, Users, Building } from 'lucide-react';
import { useLogging } from '@/hooks/useLogging';

const Projects = () => {
  const { user } = useAuth();
  const { clients, users, loading: refLoading } = useReferenceData();
  const { toast } = useToast();
  const { logProjectAction } = useLogging();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<(Project & { client_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    engagement_name: '',
    engagement_id: '',
    project_id: '',
    lead_developer_id: '',
    team_assignments: {
      lead_partner_id: '',
      partner_ids: [],
      manager_ids: [],
      in_charge_ids: [],
      staff_ids: [],
    },
    assigned_to: [] as string[], // Deprecated but kept for backward compatibility
    status: 'new' as Project['status'],
    period_start: '',
    period_end: '',
    audit_type: '',
    jurisdiction: '',
    bumex_office: '',
    language: 'English',
    is_first_audit: false,
  });

  const auditTypes = [
    'Financial Audit',
    'Compliance Audit',
    'Operational Audit',
    'IT Audit',
    'Internal Audit',
    'Tax Audit',
    'Forensic Audit',
    'Environmental Audit'
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Other'];

  const bumexOffices = ['Nouakchott'];

  useEffect(() => {
    if (!refLoading) fetchData();
  // eslint-disable-next-line
  }, [refLoading]);

  const fetchData = async () => {
    try {
      // Fetch projects only, clients/users come from context
      const projectsQuery = query(collection(db, 'projects'), orderBy('created_at', 'desc'));
      const projectsSnapshot = await getDocs(projectsQuery);

      const projectsData = projectsSnapshot.docs.map(doc => {
        const projectData = {
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date(),
          period_start: doc.data().period_start?.toDate() || new Date(),
          period_end: doc.data().period_end?.toDate() || new Date(),
        } as Project;

        const client = clients.find(c => c.id === projectData.client_id);
        return {
          ...projectData,
          client_name: client?.name || 'Unknown Client'
        };
      });

      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        ...formData,
        period_start: new Date(formData.period_start),
        period_end: new Date(formData.period_end),
        created_by: user?.id,
        created_at: new Date(),
      };

      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), projectData);
        
        // Log project update
        await logProjectAction.update(editingProject.id, `Project ${projectData.engagement_name} updated`);
        
        toast({
          title: 'Success',
          description: 'Project updated successfully',
        });
      } else {
        const docRef = await addDoc(collection(db, 'projects'), projectData);
        
        // Log project creation
        await logProjectAction.create(docRef.id, `Project ${projectData.engagement_name} created`);
        
        toast({
          title: 'Success',
          description: 'Project created successfully',
        });
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      engagement_name: '',
      engagement_id: '',
      project_id: '',
      lead_developer_id: '',
      team_assignments: {
        lead_partner_id: '',
        partner_ids: [],
        manager_ids: [],
        in_charge_ids: [],
        staff_ids: [],
      },
      assigned_to: [],
      status: 'new',
      period_start: '',
      period_end: '',
      audit_type: '',
      jurisdiction: '',
      bumex_office: '',
      language: 'English',
      is_first_audit: false,
    });
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      client_id: project.client_id,
      engagement_name: project.engagement_name,
      engagement_id: project.engagement_id,
      project_id: project.project_id || '',
      lead_developer_id: project.lead_developer_id,
      team_assignments: {
        lead_partner_id: project.team_assignments?.lead_partner_id || '',
        partner_ids: project.team_assignments?.partner_ids || [],
        manager_ids: project.team_assignments?.manager_ids || [],
        in_charge_ids: project.team_assignments?.in_charge_ids || [],
        staff_ids: project.team_assignments?.staff_ids || [],
      },
      assigned_to: project.assigned_to,
      status: project.status,
      period_start: project.period_start.toISOString().split('T')[0],
      period_end: project.period_end.toISOString().split('T')[0],
      audit_type: project.audit_type,
      jurisdiction: project.jurisdiction,
      bumex_office: project.bumex_office || '',
      language: project.language,
      is_first_audit: project.is_first_audit,
    });
    setIsDialogOpen(true);
  };

  const handleAssignmentChange = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: checked 
        ? [...prev.assigned_to, userId]
        : prev.assigned_to.filter(id => id !== userId)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'inprogress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.engagement_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.audit_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canCreateProject = user?.role === 'dev' || user?.role === 'admin';
  const canEditProject = user?.role === 'dev' || user?.role === 'admin' || user?.role === 'semi-admin';

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          {canCreateProject && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                  <DialogDescription>
                    {editingProject ? 'Update project information' : 'Create a new audit engagement'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_id">Client</Label>
                      <Select
                        value={formData.client_id}
                        onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as Project['status'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="inprogress">In Progress</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="engagement_name">Engagement Name</Label>
                    <Input
                      id="engagement_name"
                      value={formData.engagement_name}
                      onChange={(e) => setFormData({ ...formData, engagement_name: e.target.value })}
                      required
                      placeholder="Enter engagement name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="engagement_id">Engagement ID</Label>
                    <Input
                      id="engagement_id"
                      value={formData.engagement_id}
                      onChange={(e) => setFormData({ ...formData, engagement_id: e.target.value })}
                      required
                      placeholder="Enter engagement ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="project_id">Project ID</Label>
                    <Input
                      id="project_id"
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      placeholder="Enter project ID"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="period_start">Period Start</Label>
                      <Input
                        id="period_start"
                        type="date"
                        value={formData.period_start}
                        onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="period_end">Period End</Label>
                      <Input
                        id="period_end"
                        type="date"
                        value={formData.period_end}
                        onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="audit_type">Audit Type</Label>
                      <Select
                        value={formData.audit_type}
                        onValueChange={(value) => setFormData({ ...formData, audit_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select audit type" />
                        </SelectTrigger>
                        <SelectContent>
                          {auditTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => setFormData({ ...formData, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="jurisdiction">Jurisdiction</Label>
                    <Input
                      id="jurisdiction"
                      value={formData.jurisdiction}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                      placeholder="Enter jurisdiction"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bumex_office">BUMEX Office</Label>
                    <Select
                      value={formData.bumex_office}
                      onValueChange={(value) => setFormData({ ...formData, bumex_office: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select BUMEX office" />
                      </SelectTrigger>
                      <SelectContent>
                        {bumexOffices.map((office) => (
                          <SelectItem key={office} value={office}>
                            {office}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="lead_developer_id">Lead Developer</Label>
                    <Select
                      value={formData.lead_developer_id}
                      onValueChange={(value) => setFormData({ ...formData, lead_developer_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead developer" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(user => user.role === 'dev').map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_first_audit"
                      checked={formData.is_first_audit}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_first_audit: checked as boolean })}
                    />
                    <Label htmlFor="is_first_audit">First-time audit</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProject ? 'Update' : 'Create'} Project
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6" onClick={() => handleProjectClick(project.id)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.engagement_name}</h3>
                      <p className="text-sm text-gray-500">{project.engagement_id}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{project.client_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {project.period_start.toLocaleDateString()} - {project.period_end.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{project.assigned_to.length} team members</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{project.audit_type}</span>
                    {project.is_first_audit && (
                      <Badge variant="secondary" className="text-xs">
                        First Audit
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search terms or filters' 
                : 'Get started by creating a new project'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Projects;
