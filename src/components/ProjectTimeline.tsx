
import { useEffect, useState } from 'react';
import { Sprint } from '@/types';
import { useAppStore } from '@/store';
import { format, parseISO, addMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectTimelineProps {
  projectId: string;
}

export const ProjectTimeline = ({ projectId }: ProjectTimelineProps) => {
  const { getSprintsByProject, fetchSprints } = useAppStore();
  const [months, setMonths] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSprints = async () => {
      setLoading(true);
      await fetchSprints(projectId);
      setLoading(false);
    };
    
    loadSprints();
    
    // Calculate months for the timeline
    const now = new Date();
    const startDate = startOfMonth(addMonths(now, -2)); // 2 months ago
    const endDate = endOfMonth(addMonths(now, 4)); // 4 months ahead
    
    const monthsInterval = eachMonthOfInterval({
      start: startDate,
      end: endDate
    });
    
    setMonths(monthsInterval);
  }, [projectId, fetchSprints]);
  
  const sprints = getSprintsByProject(projectId);
  
  // Function to determine sprint position based on dates
  const getSprintPosition = (sprint: Sprint) => {
    const startDate = sprint.startDate ? parseISO(sprint.startDate) : new Date();
    const endDate = sprint.endDate ? parseISO(sprint.endDate) : addMonths(startDate, 1);
    
    // Position is relative to the timeline's start month
    const startMonth = format(startDate, 'yyyy-MM');
    const endMonth = format(endDate, 'yyyy-MM');
    
    // Find start and end positions in the timeline
    const startIndex = months.findIndex(month => format(month, 'yyyy-MM') === startMonth);
    const endIndex = months.findIndex(month => format(month, 'yyyy-MM') === endMonth);
    
    return {
      startIndex: startIndex >= 0 ? startIndex : 0,
      endIndex: endIndex >= 0 ? endIndex : months.length - 1,
      color: getSprintColor(sprint.status)
    };
  };
  
  const getSprintColor = (status: Sprint['status']) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading timeline...</div>;
  }
  
  return (
    <div className="p-4">
      <Card className="border rounded-md overflow-hidden">
        <CardContent className="p-0">
          {/* Timeline Header with Months */}
          <div className="flex border-b">
            <div className="w-32 min-w-32 p-2 font-medium border-r">Sprints</div>
            {months.map((month) => (
              <div 
                key={month.toString()} 
                className="flex-1 p-2 text-center font-medium border-r last:border-r-0 min-w-[120px]"
              >
                {format(month, 'MMMM yyyy')}
              </div>
            ))}
          </div>
          
          {/* Timeline Body with Sprints */}
          <div>
            {sprints.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No sprints found</div>
            ) : (
              sprints.map((sprint) => {
                const position = getSprintPosition(sprint);
                return (
                  <div key={sprint.id} className="flex items-center border-b last:border-b-0">
                    <div className="w-32 min-w-32 p-2 font-medium border-r truncate">
                      {sprint.name}
                    </div>
                    
                    {months.map((month, index) => {
                      const isInSprintRange = index >= position.startIndex && index <= position.endIndex;
                      const isStart = index === position.startIndex;
                      const isEnd = index === position.endIndex;
                      
                      return (
                        <div 
                          key={month.toString()} 
                          className="flex-1 p-2 border-r last:border-r-0 min-h-[40px] min-w-[120px]"
                        >
                          {isInSprintRange && (
                            <div 
                              className={`${position.color} h-4 rounded-md`}
                              style={{
                                borderTopLeftRadius: isStart ? '0.375rem' : '0',
                                borderBottomLeftRadius: isStart ? '0.375rem' : '0',
                                borderTopRightRadius: isEnd ? '0.375rem' : '0',
                                borderBottomRightRadius: isEnd ? '0.375rem' : '0'
                              }}
                            ></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
