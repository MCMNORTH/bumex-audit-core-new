import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';

interface ProjectSignOffsSummaryProps {
  formData: ProjectFormData;
  users: User[];
  sidebarSections: any[];
}

const ProjectSignOffsSummary: React.FC<ProjectSignOffsSummaryProps> = ({
  formData,
  users,
  sidebarSections
}) => {
  // Define sections that require sign-offs with their levels
  const signOffSections = [
    { id: 'engagement-profile-section', title: 'Engagement Profile & Strategy', level: 'incharge' },
    { id: 'independence-section', title: 'Independence', level: 'incharge' },
    { id: 'communications-section', title: 'Communications, Inquiries and Minutes', level: 'incharge' },
    { id: 'materiality', title: 'Materiality', level: 'incharge' },
    { id: 'risk-assessment', title: 'Risk Assessment', level: 'incharge' },
    { id: 'components-of-internal-control', title: 'Components of Internal Control', level: 'incharge' },
    { id: 'fraud', title: 'Fraud', level: 'incharge' },
    { id: 'overall-response', title: 'Overall Response', level: 'incharge' },
    { id: 'engagement-management', title: 'Engagement Management (Complete)', level: 'manager' },
    { id: 'entity-wide-procedures', title: 'Entity Wide Procedures (Complete)', level: 'manager' },
    { id: 'business-processes', title: 'Business Processes (Complete)', level: 'manager' },
    { id: 'conclusions-and-reporting', title: 'Conclusions and Reporting (Complete)', level: 'manager' },
  ];

  const getSignOffData = (sectionId: string) => {
    return formData.signoffs?.[sectionId] || { signed: false };
  };

  const getSignedByUser = (signedBy?: string) => {
    return signedBy ? users.find(u => u.id === signedBy) : null;
  };

  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleString() : '';
  };

  const getProgressStats = () => {
    const total = signOffSections.length;
    const signed = signOffSections.filter(section => getSignOffData(section.id).signed).length;
    const percentage = total > 0 ? Math.round((signed / total) * 100) : 0;
    
    return { total, signed, percentage };
  };

  const { total, signed, percentage } = getProgressStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Project Sign-offs Summary</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {signed}/{total} Complete ({percentage}%)
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Overall Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{signed}</div>
              <div className="text-sm text-gray-500">Signed Off</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{total - signed}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections by Level */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">In Charge+ Sections</h3>
          <div className="space-y-3">
            {signOffSections
              .filter(section => section.level === 'incharge')
              .map(section => {
                const signOffData = getSignOffData(section.id);
                const signedByUser = getSignedByUser(signOffData.signedBy);
                
                return (
                  <Card key={section.id} className={`border-l-4 ${
                    signOffData.signed ? 'border-l-green-500 bg-green-50' : 'border-l-yellow-500 bg-yellow-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {signOffData.signed ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{section.title}</h4>
                            {signOffData.signed && signedByUser && signOffData.signedAt && (
                              <p className="text-sm text-gray-600">
                                Signed by {signedByUser.first_name} {signedByUser.last_name} on {formatDate(signOffData.signedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={signOffData.signed ? "default" : "secondary"}>
                          {signOffData.signed ? "Signed" : "Pending"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manager+ Sections</h3>
          <div className="space-y-3">
            {signOffSections
              .filter(section => section.level === 'manager')
              .map(section => {
                const signOffData = getSignOffData(section.id);
                const signedByUser = getSignedByUser(signOffData.signedBy);
                
                return (
                  <Card key={section.id} className={`border-l-4 ${
                    signOffData.signed ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {signOffData.signed ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{section.title}</h4>
                            {signOffData.signed && signedByUser && signOffData.signedAt && (
                              <p className="text-sm text-gray-600">
                                Signed by {signedByUser.first_name} {signedByUser.last_name} on {formatDate(signOffData.signedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={signOffData.signed ? "default" : "destructive"}>
                          {signOffData.signed ? "Signed" : "Requires Manager+"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSignOffsSummary;