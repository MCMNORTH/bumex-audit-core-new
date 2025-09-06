import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReferenceData } from '@/hooks/useReferenceData';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/Layout/MainLayout';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { getProjectRole, canSignOffSection } from '@/utils/permissions';
import { 
  FolderOpen, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Star,
  FileText,
  Calendar,
  TrendingUp,
  PenTool,
  ChevronRight,
  Building
} from 'lucide-react';

interface ProjectWithRole extends Project {
  client_name?: string;
  user_role?: string | null;
  ready_sections?: Array<{
    id: string;
    title: string;
    level: 'incharge' | 'manager';
  }>;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { clients, users, loading: refLoading } = useReferenceData();
  const navigate = useNavigate();
  const [userProjects, setUserProjects] = useState<ProjectWithRole[]>([]);
  const [readyToSignSections, setReadyToSignSections] = useState<Array<{
    projectId: string;
    projectName: string;
    sectionId: string;
    sectionTitle: string;
    level: 'incharge' | 'manager';
  }>>([]);
  const [stats, setStats] = useState({
    totalAssignedProjects: 0,
    leadDeveloperProjects: 0,
    leadPartnerProjects: 0,
    managerProjects: 0,
    inChargeProjects: 0,
    staffProjects: 0,
    readyToSignCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Define sections that can be signed off
  const signOffSections = [
    { id: 'engagement-profile-section', title: 'Engagement Profile & Strategy', level: 'incharge' as const },
    { id: 'sp-specialists-section', title: 'SP. Specialists', level: 'incharge' as const },
    { id: 'independence-section', title: 'Independence', level: 'incharge' as const },
    { id: 'communications-section', title: 'Communications, Inquiries and Minutes', level: 'incharge' as const },
    { id: 'tech-risk-corp', title: 'Tech Risk Corp - IT Audit', level: 'incharge' as const },
    { id: 'initial-independence', title: 'Initial independence and conclusion', level: 'incharge' as const },
    { id: 'materiality-materiality', title: 'Materiality', level: 'incharge' as const },
    { id: 'materiality-reevaluate', title: 'Re-evaluate', level: 'incharge' as const },
    { id: 'entity-and-env', title: 'Entity and its environment', level: 'incharge' as const },
    { id: 'rapd', title: 'RAPD', level: 'incharge' as const },
    { id: 'ceramic', title: 'CERAMIC', level: 'incharge' as const },
    { id: 'fraud-risk', title: 'Fraud risk assessment and response', level: 'incharge' as const },
    { id: 'financial-reporting-process', title: 'Financial reporting process', level: 'incharge' as const },
    { id: 'engagement-management', title: 'Engagement Management', level: 'manager' as const },
    { id: 'entity-wide-procedures', title: 'Entity Wide Procedures', level: 'manager' as const },
    { id: 'business-processes', title: 'Business Processes', level: 'manager' as const },
    { id: 'conclusions-and-reporting', title: 'Conclusions and Reporting', level: 'manager' as const },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const projectsQuery = query(collection(db, 'projects'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const allProjects = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date(),
          period_start: doc.data().period_start?.toDate() || new Date(),
          period_end: doc.data().period_end?.toDate() || new Date(),
        })) as Project[];

        // Filter projects where user has a role
        const userAssignedProjects: ProjectWithRole[] = allProjects
          .map(project => {
            // Create a minimal project data object with required team and signoff structure
            const projectFormData = {
              team_assignments: project.team_assignments || {
                lead_partner_id: '',
                partner_ids: [],
                manager_ids: [],
                in_charge_ids: [],
                staff_ids: [],
              },
              signoffs: project.signoffs || {},
              lead_developer_id: project.lead_developer_id || '',
            };

            const userRole = getProjectRole(user, projectFormData as any);
            const isLeadDeveloper = project.lead_developer_id === user.id;
            
            if (!userRole && !isLeadDeveloper) {
              return null;
            }

            const client = clients.find(c => c.id === project.client_id);
            const finalUserRole = userRole || (isLeadDeveloper ? 'lead_developer' : null);
            
            return {
              ...project,
              client_name: client?.name || 'Unknown Client',
              user_role: finalUserRole,
            } as ProjectWithRole;
          })
          .filter((project): project is ProjectWithRole => project !== null);

        // Find sections ready to sign off
        const readySections: Array<{
          projectId: string;
          projectName: string;
          sectionId: string;
          sectionTitle: string;
          level: 'incharge' | 'manager';
        }> = [];

        userAssignedProjects.forEach(project => {
          // Create a minimal project data object for permissions checking
          const projectFormData = {
            team_assignments: project.team_assignments || {
              lead_partner_id: '',
              partner_ids: [],
              manager_ids: [],
              in_charge_ids: [],
              staff_ids: [],
            },
            signoffs: project.signoffs || {},
            lead_developer_id: project.lead_developer_id || '',
          };

          signOffSections.forEach(section => {
            const isAlreadySigned = projectFormData.signoffs[section.id]?.signed;
            const canSign = canSignOffSection(user, projectFormData as any, section.level);
            
            if (!isAlreadySigned && canSign) {
              readySections.push({
                projectId: project.id,
                projectName: project.engagement_name,
                sectionId: section.id,
                sectionTitle: section.title,
                level: section.level,
              });
            }
          });
        });

        // Calculate stats
        const roleStats = {
          totalAssignedProjects: userAssignedProjects.length,
          leadDeveloperProjects: userAssignedProjects.filter(p => p.user_role === 'lead_developer').length,
          leadPartnerProjects: userAssignedProjects.filter(p => p.user_role === 'lead_partner').length,
          managerProjects: userAssignedProjects.filter(p => p.user_role === 'manager').length,
          inChargeProjects: userAssignedProjects.filter(p => p.user_role === 'in_charge').length,
          staffProjects: userAssignedProjects.filter(p => p.user_role === 'staff').length,
          readyToSignCount: readySections.length,
        };

        setUserProjects(userAssignedProjects.slice(0, 6)); // Show recent 6
        setReadyToSignSections(readySections.slice(0, 8)); // Show top 8
        setStats(roleStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!refLoading && user) {
      fetchDashboardData();
    }
  }, [refLoading, user, clients]);

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'lead_developer':
        return 'bg-purple-100 text-purple-800';
      case 'lead_partner':
        return 'bg-red-100 text-red-800';
      case 'partner':
        return 'bg-orange-100 text-orange-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'in_charge':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'lead_developer':
        return 'Lead Developer';
      case 'lead_partner':
        return 'Lead Partner';
      case 'partner':
        return 'Partner';
      case 'manager':
        return 'Manager';
      case 'in_charge':
        return 'In Charge';
      case 'staff':
        return 'Staff';
      default:
        return 'Unknown';
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleSectionClick = (projectId: string, sectionId: string) => {
    navigate(`/projects/${projectId}?section=${sectionId}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.first_name}! Here's your project overview.</p>
          </div>
        </div>

        {/* Priority Actions */}
        {stats.readyToSignCount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-900">Ready for Sign-off</CardTitle>
              </div>
              <CardDescription className="text-orange-700">
                {stats.readyToSignCount} sections are ready for your review and sign-off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {readyToSignSections.slice(0, 4).map((section) => (
                  <div 
                    key={`${section.projectId}-${section.sectionId}`}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 hover:border-orange-300 cursor-pointer transition-colors"
                    onClick={() => handleSectionClick(section.projectId, section.sectionId)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{section.sectionTitle}</div>
                      <div className="text-sm text-gray-600">{section.projectName}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={section.level === 'manager' ? 'destructive' : 'secondary'}>
                        {section.level === 'manager' ? 'Manager+' : 'In Charge+'}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
                {readyToSignSections.length > 4 && (
                  <Button variant="outline" className="w-full mt-2">
                    View All {stats.readyToSignCount} Ready Sections
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAssignedProjects}</p>
                </div>
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {stats.leadDeveloperProjects > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lead Dev</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.leadDeveloperProjects}</p>
                  </div>
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {stats.leadPartnerProjects > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lead Partner</p>
                    <p className="text-2xl font-bold text-red-600">{stats.leadPartnerProjects}</p>
                  </div>
                  <Users className="h-6 w-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {stats.managerProjects > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Manager</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.managerProjects}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {stats.inChargeProjects > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Charge</p>
                    <p className="text-2xl font-bold text-green-600">{stats.inChargeProjects}</p>
                  </div>
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Ready to Sign</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.readyToSignCount}</p>
                </div>
                <PenTool className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Projects</CardTitle>
                <CardDescription>Projects where you have assigned roles</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/projects')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {userProjects.length > 0 ? (
              <div className="space-y-3">
                {userProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FolderOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{project.engagement_name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Building className="h-3 w-3" />
                          <span>{project.client_name}</span>
                          <span>•</span>
                          <span>{project.audit_type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getRoleColor(project.user_role)}>
                        {getRoleLabel(project.user_role)}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{project.period_end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assigned projects</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't been assigned to any projects yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
