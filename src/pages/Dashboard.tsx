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
import { getProjectRole, canUserReviewSection, getSectionReviewIndicator } from '@/utils/permissions';
import { useTranslation } from '@/contexts/TranslationContext';
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
  reviews?: any;
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
  const { t } = useTranslation();
  const [userProjects, setUserProjects] = useState<ProjectWithRole[]>([]);
  const [readyForReviewSections, setReadyForReviewSections] = useState<Array<{
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
    readyForReviewCount: 0,
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

        // Find sections ready for user's review (orange dot - lower roles have reviewed)
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
            reviews: project.reviews || {},
            lead_developer_id: project.lead_developer_id || '',
          };

          signOffSections.forEach(section => {
            // Check if this section shows orange dot (ready for user's review)
            const indicator = getSectionReviewIndicator(section.id, projectFormData as any, user);
            
            if (indicator === 'orange') {
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
          readyForReviewCount: readySections.length,
        };

        setUserProjects(userAssignedProjects.slice(0, 6)); // Show recent 6
        setReadyForReviewSections(readySections.slice(0, 8)); // Show top 8
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
        return t('dashboard.roles.leadDeveloper');
      case 'lead_partner':
        return t('dashboard.roles.leadPartner');
      case 'partner':
        return t('dashboard.roles.partner');
      case 'manager':
        return t('dashboard.roles.manager');
      case 'in_charge':
        return t('dashboard.roles.inCharge');
      case 'staff':
        return t('dashboard.roles.staff');
      default:
        return t('dashboard.roles.unknown');
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleSectionClick = (projectId: string, sectionId: string) => {
    navigate(`/projects/${projectId}?section=${sectionId}`);
  };

  const handleViewAllReadySections = () => {
    // Navigate to the first project's sign-offs summary, or projects page if no projects
    if (userProjects.length > 0) {
      navigate(`/projects/${userProjects[0].id}?section=project-signoffs-summary`);
    } else {
      navigate('/projects');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-600">{t('dashboard.welcomeBack')}, {user?.first_name}! {t('dashboard.projectOverview')}</p>
          </div>
        </div>

        {/* Priority Actions */}
        {stats.readyForReviewCount > 0 ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-900">{t('dashboard.readyForReview')}</CardTitle>
              </div>
              <CardDescription className="text-blue-700">
                {stats.readyForReviewCount} {t('dashboard.sectionsReady')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {readyForReviewSections.slice(0, 4).map((section) => (
                  <div 
                    key={`${section.projectId}-${section.sectionId}`}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => handleSectionClick(section.projectId, section.sectionId)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{section.sectionTitle}</div>
                      <div className="text-sm text-gray-600">{section.projectName}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={section.level === 'manager' ? 'destructive' : 'secondary'}>
                        {section.level === 'manager' ? t('dashboard.managerPlus') : t('dashboard.inChargePlus')}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
                {readyForReviewSections.length > 4 && (
                  <Button variant="outline" className="w-full mt-2" onClick={handleViewAllReadySections}>
                    {t('dashboard.viewAll')} {stats.readyForReviewCount} {t('dashboard.sectionsReady')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-gray-400" />
                <CardTitle className="text-gray-600">{t('dashboard.readyForReview')}</CardTitle>
              </div>
              <CardDescription className="text-gray-500">
                {t('dashboard.noSectionsReady')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-gray-400 mb-2">
                  <CheckCircle className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">
                  {t('dashboard.allCaughtUp')}
                </p>
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
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.myProjects')}</p>
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
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.leadDev')}</p>
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
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.leadPartner')}</p>
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
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.manager')}</p>
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
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.inCharge')}</p>
                    <p className="text-2xl font-bold text-green-600">{stats.inChargeProjects}</p>
                  </div>
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t('dashboard.readyToReview')}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.readyForReviewCount}</p>
                </div>
                <PenTool className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.myProjects')}</CardTitle>
                <CardDescription>{t('dashboard.projectsAssigned')}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/projects')}>
                {t('dashboard.viewAll')}
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('dashboard.noAssignedProjects')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('dashboard.notAssignedYet')}
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
