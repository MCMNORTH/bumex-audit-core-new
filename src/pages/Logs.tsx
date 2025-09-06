import { useState, useEffect } from 'react';
import { useReferenceData } from '@/hooks/useReferenceData';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Log } from '@/types';
import { Search, Activity, Clock, User as UserIcon, ChevronDown, Globe, Monitor, MapPin, Wifi } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LogLocationMap } from '@/components/LogLocationMap';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Logs = () => {
  const { users, loading: refLoading } = useReferenceData();
  const [logs, setLogs] = useState<(Log & { user_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserAgents, setExpandedUserAgents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!refLoading) fetchLogs();
    // eslint-disable-next-line
  }, [refLoading]);

  const fetchLogs = async () => {
    try {
      // Fetch logs only, users come from context
      const logsQuery = query(
        collection(db, 'logs'), 
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const logsSnapshot = await getDocs(logsQuery);
      
      // Combine logs with user names from context
      const logsData = logsSnapshot.docs.map(doc => {
        const logData = {
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        } as Log;
        
        const user = users.find(u => u.id === logData.user_id);
        return {
          ...logData,
          user_name: user ? `${user.first_name} ${user.last_name}` : 'Unknown User'
        };
      });

      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'update':
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-purple-100 text-purple-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log as any).ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log as any).user_agent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log as any).country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log as any).city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log as any).isp?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserAgent = (logId: string) => {
    setExpandedUserAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          </div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600">Track all system activities and changes</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest 100 system activities</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length > 0 ? (
              <Accordion type="multiple" className="space-y-2">
                {filteredLogs.map((log) => (
                  <AccordionItem key={log.id} value={log.id} className="border rounded-lg">
                    <AccordionTrigger className="flex items-center space-x-4 p-4 hover:bg-gray-50 [&[data-state=open]]:bg-gray-50">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getActionIcon(log.action)}
                        </div>
                        
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-gray-900">{log.user_name}</p>
                            <Badge className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Target: {log.target_id}
                            {log.details && (
                              <span className="ml-2 text-gray-500">• {log.details}</span>
                            )}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>
                            {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Log Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Log ID:</span>
                                <span className="text-gray-900 font-mono text-xs">{log.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">User ID:</span>
                                <span className="text-gray-900 font-mono text-xs">{log.user_id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Target ID:</span>
                                <span className="text-gray-900 font-mono text-xs">{log.target_id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Action:</span>
                                <span className="text-gray-900">{log.action}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Timestamp Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span className="text-gray-900">{log.timestamp.toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Time:</span>
                                <span className="text-gray-900">{log.timestamp.toLocaleTimeString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Full Timestamp:</span>
                                <span className="text-gray-900 font-mono text-xs">{log.timestamp.toISOString()}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Client Information</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex items-start space-x-2">
                                <Globe className="h-3 w-3 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-gray-500">IP Address:</span>
                                  <div className="text-gray-900 font-mono text-xs mt-1">
                                    {(log as any).ip_address || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                               {((log as any).country || (log as any).city) && (
                                 <div className="flex items-start space-x-2">
                                   <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                                   <div className="flex-1">
                                     <span className="text-gray-500">Location:</span>
                                     <div className="text-gray-900 text-xs mt-1">
                                       {[(log as any).city, (log as any).region, (log as any).country]
                                         .filter(Boolean)
                                         .join(', ') || 'N/A'}
                                     </div>
                                     {(log as any).timezone && (
                                       <div className="text-gray-600 text-xs">
                                         Timezone: {(log as any).timezone}
                                       </div>
                                     )}
                                     {/* Show button if we have any location data - either precise GPS or IP-based */}
                                     {(((log as any).latitude && (log as any).longitude) || ((log as any).city && (log as any).country)) && (
                                       <Dialog>
                                         <DialogTrigger asChild>
                                           <Button variant="outline" size="sm" className="mt-2">
                                             <MapPin className="h-3 w-3 mr-1" />
                                             View Location
                                           </Button>
                                         </DialogTrigger>
                                          <DialogContent className="max-w-4xl">
                                            <DialogHeader>
                                              <DialogTitle>Log Location - {log.user_name}</DialogTitle>
                                              <DialogDescription>
                                                Showing location data for this log entry
                                              </DialogDescription>
                                            </DialogHeader>
                                           <LogLocationMap 
                                             logs={[{
                                               id: log.id,
                                               latitude: (log as any).latitude,
                                               longitude: (log as any).longitude,
                                               precise_location: (log as any).precise_location,
                                               user_name: log.user_name,
                                               action: log.action,
                                               timestamp: log.timestamp,
                                               city: (log as any).city,
                                               country: (log as any).country
                                             }]}
                                           />
                                         </DialogContent>
                                       </Dialog>
                                     )}
                                   </div>
                                 </div>
                               )}
                              
                              {(log as any).isp && (
                                <div className="flex items-start space-x-2">
                                  <Wifi className="h-3 w-3 text-gray-400 mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-gray-500">ISP:</span>
                                    <div className="text-gray-900 text-xs mt-1">
                                      {(log as any).isp}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-start space-x-2">
                                <Monitor className="h-3 w-3 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-gray-500">User Agent:</span>
                                  <div className="text-gray-900 text-xs mt-1">
                                    {(log as any).user_agent ? (
                                      <div className="space-y-1">
                                        <div className={expandedUserAgents.has(log.id) ? '' : 'break-all'}>
                                          {expandedUserAgents.has(log.id) 
                                            ? (log as any).user_agent 
                                            : `${(log as any).user_agent.substring(0, 100)}${(log as any).user_agent.length > 100 ? '...' : ''}`
                                          }
                                        </div>
                                        {(log as any).user_agent.length > 100 && (
                                          <button
                                            onClick={() => toggleUserAgent(log.id)}
                                            className="text-blue-600 hover:text-blue-800 text-xs underline"
                                          >
                                            {expandedUserAgents.has(log.id) ? 'Show less' : 'Show more'}
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      'N/A'
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {log.details && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Details</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{log.details}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'No activity logs available'}
                </p>
              </div>
              )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Logs;
