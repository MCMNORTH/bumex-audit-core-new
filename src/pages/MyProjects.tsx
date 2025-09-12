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
import { isPrivilegedUser } from '@/utils/permissions';

const MyProjects = () => {
  const { user } = useAuth();
  const { clients, loading: refLoading } = useReferenceData();
  const { toast } = useToast();
  const navigate = useNavigate();
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
      const projectsQuery = isPrivilegedUser(user)
        ? query(collection(db, 'projects'))
        : query(collection(db, 'projects'), where('member_ids', 'array-contains', user.id));
      const projectsSnapshot = await getDocs(projectsQuery);

      const allProjects = (projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        period_start: doc.data().period_start?.toDate() || new Date(),
        period_end: doc.data().period_end?.toDate() || new Date(),
      })) as Project[]).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

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
      console.error('Failed to fetch projects');
      toast({
        title: 'Error',
        description: 'Failed to fetch your projects',
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
    if (!user || !project.team_assignments) return 'Team Member';
    
    const assignments = project.team_assignments;
    
    if (assignments.lead_partner_id === user.id) return 'Lead Partner';
    if (assignments.partner_ids?.includes(user.id)) return 'Partner';
    if (assignments.manager_ids?.includes(user.id)) return 'Manager';
    if (assignments.in_charge_ids?.includes(user.id)) return 'In Charge';
    if (assignments.staff_ids?.includes(user.id)) return 'Staff';
    if (project.lead_developer_id === user.id) return 'Lead Developer';
    if (project.assigned_to?.includes(user.id)) return 'Team Member';
    
    return 'Team Member';
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
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600">Projects where you are assigned as a team member</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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

        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No projects found' : 'No projects assigned'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria.'
                    : 'You are not currently assigned to any projects.'
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
                      <span>Your Role: {getUserRole(project)}</span>
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