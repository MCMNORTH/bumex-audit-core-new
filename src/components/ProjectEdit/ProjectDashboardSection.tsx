import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectFormData } from '@/types/formData';
import { Client, User, Project } from '@/types';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  FileCheck,
  ClipboardCheck
} from 'lucide-react';
import { format, differenceInDays, isAfter, isBefore, isToday } from 'date-fns';

interface ProjectDashboardSectionProps {
  formData: ProjectFormData;
  project: Project | null;
  users: User[];
  clients: Client[];
  sidebarSections: any[];
  onSectionChange: (sectionId: string) => void;
  signOffData: {
    total: number;
    unsigned: number;
    unsignedSections: { id: string; title: string; number?: string }[];
  };
  pendingReviews: {
    sectionId: string;
    sectionTitle: string;
    pendingRoles: string[];
  }[];
  teamMemberCount: number;
}

const ProjectDashboardSection = ({
  formData,
  project,
  users,
  clients,
  sidebarSections,
  onSectionChange,
  signOffData,
  pendingReviews,
  teamMemberCount,
}: ProjectDashboardSectionProps) => {
  const selectedClient = clients.find(c => c.id === formData.client_id);
  
  // Parse dates
  const periodStart = formData.period_start ? new Date(formData.period_start) : null;
  const periodEnd = formData.period_end ? new Date(formData.period_end) : null;
  const expectedStart = formData.expected_start_date ? new Date(formData.expected_start_date) : null;
  const auditReportDate = formData.audit_report_date ? new Date(formData.audit_report_date) : null;
  const closeoutDate = (formData as any).closeout_date ? new Date((formData as any).closeout_date) : null;
  const today = new Date();

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!periodStart || !periodEnd) return 0;
    const totalDays = differenceInDays(periodEnd, periodStart);
    if (totalDays <= 0) return 0;
    const elapsedDays = differenceInDays(today, periodStart);
    const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
    return Math.round(progress);
  };

  const progress = calculateProgress();

  // Calculate days remaining
  const daysRemaining = periodEnd ? differenceInDays(periodEnd, today) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'in progress': 
      case 'inprogress': return 'bg-amber-100 text-amber-700';
      case 'closed': return 'bg-green-100 text-green-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Get progress bar color
  const getProgressColor = () => {
    if (isOverdue) return 'bg-red-500';
    if (daysRemaining !== null && daysRemaining <= 7) return 'bg-amber-500';
    return 'bg-primary';
  };

  // Format date helper
  const formatDate = (date: Date | null) => {
    if (!date) return '—';
    return format(date, 'MMM d, yyyy');
  };

  // Get date status
  const getDateStatus = (date: Date | null) => {
    if (!date) return { label: '', color: '' };
    if (isToday(date)) return { label: 'Today', color: 'text-blue-600' };
    if (isBefore(date, today)) return { label: 'Passed', color: 'text-gray-500' };
    const days = differenceInDays(date, today);
    if (days <= 7) return { label: `${days}d away`, color: 'text-amber-600' };
    if (days <= 30) return { label: `${days}d away`, color: 'text-blue-600' };
    return { label: `${days}d away`, color: 'text-gray-500' };
  };

  const signedCount = signOffData.total - signOffData.unsigned;
  const signOffProgress = signOffData.total > 0 ? (signedCount / signOffData.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{project?.engagement_name || 'Project Dashboard'}</h2>
          <p className="text-gray-500">{selectedClient?.name}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(formData.status || '')}>
            {formData.status || 'Not Set'}
          </Badge>
          {formData.audit_type && (
            <Badge variant="outline">{formData.audit_type}</Badge>
          )}
        </div>
      </div>

      {/* Timeline Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{formatDate(periodStart)}</span>
              <span className="font-medium">{progress}% Complete</span>
              <span className="text-gray-600">{formatDate(periodEnd)}</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              {/* Today marker */}
              {periodStart && periodEnd && progress > 0 && progress < 100 && (
                <div 
                  className="absolute top-0 w-0.5 h-5 bg-gray-800 -translate-y-1"
                  style={{ left: `${progress}%` }}
                />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              {isOverdue ? (
                <span className="text-red-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {Math.abs(daysRemaining!)} days overdue
                </span>
              ) : daysRemaining !== null ? (
                <span className={daysRemaining <= 7 ? 'text-amber-600 font-medium' : 'text-gray-600'}>
                  {daysRemaining} days remaining
                </span>
              ) : (
                <span className="text-gray-400">Period dates not set</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sign-offs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <FileCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Sign-offs</p>
                <p className="text-xl font-semibold">{signedCount} / {signOffData.total}</p>
              </div>
            </div>
            <Progress value={signOffProgress} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Pending Reviews</p>
                <p className="text-xl font-semibold">{pendingReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Size */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Team Members</p>
                <p className="text-xl font-semibold">{teamMemberCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days Remaining */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                <Clock className={`h-5 w-5 ${isOverdue ? 'text-red-600' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">{isOverdue ? 'Days Overdue' : 'Days Remaining'}</p>
                <p className="text-xl font-semibold">
                  {daysRemaining !== null ? Math.abs(daysRemaining) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Dates */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Key Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Period Start', date: periodStart },
              { label: 'Expected Start', date: expectedStart },
              { label: 'Audit Report Date', date: auditReportDate },
              { label: 'Closeout Date', date: closeoutDate },
              { label: 'Period End', date: periodEnd },
            ].map((item) => {
              const status = getDateStatus(item.date);
              return (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatDate(item.date)}</span>
                    {status.label && (
                      <span className={`text-xs ${status.color}`}>{status.label}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Unsigned Sections */}
        {signOffData.unsignedSections.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Unsigned Sections ({signOffData.unsignedSections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {signOffData.unsignedSections.slice(0, 5).map((section) => (
                  <Button
                    key={section.id}
                    variant="ghost"
                    className="w-full justify-between h-auto py-2 px-3 text-left"
                    onClick={() => onSectionChange(section.id)}
                  >
                    <span className="text-sm truncate">
                      {section.number && `${section.number} `}{section.title}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </Button>
                ))}
                {signOffData.unsignedSections.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{signOffData.unsignedSections.length - 5} more sections
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-blue-500" />
                Pending Reviews ({pendingReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {pendingReviews.slice(0, 5).map((review) => (
                  <Button
                    key={review.sectionId}
                    variant="ghost"
                    className="w-full justify-between h-auto py-2 px-3 text-left"
                    onClick={() => onSectionChange(review.sectionId)}
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm truncate w-full">{review.sectionTitle}</span>
                      <span className="text-xs text-gray-500 truncate w-full">
                        Pending: {review.pendingRoles.join(', ')}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </Button>
                ))}
                {pendingReviews.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{pendingReviews.length - 5} more sections
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All signed message */}
        {signOffData.unsignedSections.length === 0 && pendingReviews.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">All sections are signed off and reviewed!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboardSection;
