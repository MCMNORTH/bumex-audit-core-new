import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReferenceData } from '@/hooks/useReferenceData';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/types';
import { Search, FolderOpen, Calendar, Users, Building, Briefcase } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const MyProjects = () => {
  const { user } = useAuth();
  const { clients, loading: refLoading } = useReferenceData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projects, setProjects] = useState<(Project & { client_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!refLoading && user) fetchMyProjects();
  }, [refLoading, user]);

  const fetchMyProjects = async () => {
    if (!user) return;
    
    try {
      const projectsQuery = query(collection(db, 'projects'), orderBy('created_at', 'desc'));
      const projectsSnapshot = await getDocs(projectsQuery);

      const allProjects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        period_start: doc.data().period_start?.toDate() || new Date(),
        period_end: doc.data().period_end?.toDate() || new Date(),
      })) as Project[];

      // Filter projects where current user is part of the team
      const userProjects = allProjects.filter(project => {
        const assignments = project.team_assignments;
        if (!assignments) return false;

        return (
          assignments.lead_partner_id === user.id ||
          assignments.partner_ids?.includes(user.id) ||
          assignments.manager_ids?.includes(user.id) ||
          assignments.in_charge_ids?.includes(user.id) ||
          assignments.staff_ids?.includes(user.id) ||
          project.assigned_to?.includes(user.id) || // Legacy support
          project.lead_developer_id === user.id
        );
      });

      // Add client names
      const projectsWithClientNames = userProjects.map(project => {
        const client = clients.find(c => c.id === project.client_id);
        return {
          ...project,
          client_name: client?.name || 'Unknown Client'
        };
      });

      setProjects(projectsWithClientNames);
    } catch (error) {
      console.error('Error fetching my projects:', error);
      toast({
        title: t('common.error') || 'Error',
        description: t('myProjects.fetchError') || 'Failed to fetch your projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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

  const getUserRole = (project: Project) => {
    if (!user || !project.team_assignments) return t('myProjects.roles.teamMember');
    
    const assignments = project.team_assignments;
    
    if (assignments.lead_partner_id === user.id) return t('myProjects.roles.leadPartner');
    if (assignments.partner_ids?.includes(user.id)) return t('myProjects.roles.partner');
    if (assignments.manager_ids?.includes(user.id)) return t('myProjects.roles.manager');
    if (assignments.in_charge_ids?.includes(user.id)) return t('myProjects.roles.inCharge');
    if (assignments.staff_ids?.includes(user.id)) return t('myProjects.roles.staff');
    if (project.lead_developer_id === user.id) return t('myProjects.roles.leadDeveloper');
    if (project.assigned_to?.includes(user.id)) return t('myProjects.roles.teamMember');
    
    return t('myProjects.roles.teamMember');
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.engagement_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.audit_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{t('myProjects.title')}</h1>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('myProjects.title')}</h1>
            <p className="text-gray-600">{t('myProjects.description')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t('myProjects.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('myProjects.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('myProjects.allStatus')}</SelectItem>
              <SelectItem value="new">{t('status.new')}</SelectItem>
              <SelectItem value="inprogress">{t('status.inprogress')}</SelectItem>
              <SelectItem value="closed">{t('status.closed')}</SelectItem>
              <SelectItem value="archived">{t('status.archived')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? t('myProjects.noProjectsFound') : t('myProjects.noProjectsAssigned')}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? t('myProjects.tryAdjusting')
                    : t('myProjects.notAssigned')
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProjectClick(project.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.engagement_name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        {project.client_name}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{t('myProjects.yourRole')}: {getUserRole(project)}</span>
                    </div>
                    <div className="flex items-center">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      <span>{project.audit_type}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {project.period_start.toLocaleDateString()} - {project.period_end.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      ID: {project.engagement_id}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyProjects;
