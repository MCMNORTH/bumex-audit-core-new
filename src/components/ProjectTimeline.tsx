
import { useEffect, useState } from 'react';
import { Sprint } from '@/types';
import { useAppStore } from '@/store';
import { format, parseISO, addMonths, isSameMonth, isWithinInterval, isSameDay } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ProjectTimelineProps {
  projectId: string;
}

export const ProjectTimeline = ({ projectId }: ProjectTimelineProps) => {
  const { getSprintsByProject, fetchSprints } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [numMonths, setNumMonths] = useState(6); // Show 6 months at a time
  
  // Fetching sprints data
  useEffect(() => {
    const loadSprints = async () => {
      setLoading(true);
      await fetchSprints(projectId);
      setLoading(false);
    };
    
    loadSprints();
  }, [projectId, fetchSprints]);
  
  const sprints = getSprintsByProject(projectId);
  
  // Helper function to get sprint color based on status
  const getSprintColor = (status: Sprint['status']) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };
  
  // Get array of months to display
  const getMonths = () => {
    const months: Date[] = [];
    for (let i = 0; i < numMonths; i++) {
      months.push(addMonths(startDate, i));
    }
    return months;
  };

  // Navigate to previous/next set of months
  const prevMonths = () => {
    setStartDate(prev => addMonths(prev, -numMonths));
  };
  
  const nextMonths = () => {
    setStartDate(prev => addMonths(prev, numMonths));
  };
  
  // Helper to check if a sprint is active in a given month
  const isSprintActiveInMonth = (sprint: Sprint, month: Date) => {
    if (!sprint.startDate || !sprint.endDate) return false;
    
    const startDate = parseISO(sprint.startDate);
    const endDate = parseISO(sprint.endDate);
    
    // Check if any day of the month falls within the sprint period
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    return (
      // Sprint starts in this month
      isSameMonth(startDate, month) ||
      // Sprint ends in this month
      isSameMonth(endDate, month) ||
      // Sprint spans this entire month
      (startDate < firstDayOfMonth && endDate > lastDayOfMonth)
    );
  };
  
  // Helper to check if a given date is the start or end date of a sprint
  const isSprintBoundary = (sprint: Sprint, date: Date) => {
    if (!sprint.startDate || !sprint.endDate) return false;
    
    const startDate = parseISO(sprint.startDate);
    const endDate = parseISO(sprint.endDate);
    
    return isSameDay(date, startDate) || isSameDay(date, endDate);
  };
  
  // Calculate the width of the sprint bar for a particular month
  const getSprintBarWidth = (sprint: Sprint, month: Date) => {
    if (!sprint.startDate || !sprint.endDate) return '100%';
    
    const startDate = parseISO(sprint.startDate);
    const endDate = parseISO(sprint.endDate);
    
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // If sprint starts and ends within this month
    if (isSameMonth(startDate, month) && isSameMonth(endDate, month)) {
      const sprintStartDay = startDate.getDate();
      const sprintEndDay = endDate.getDate();
      const sprintDuration = sprintEndDay - sprintStartDay + 1;
      return `${(sprintDuration / daysInMonth) * 100}%`;
    }
    
    // If sprint starts in this month but ends in a future month
    if (isSameMonth(startDate, month)) {
      const sprintStartDay = startDate.getDate();
      const daysLeftInMonth = daysInMonth - sprintStartDay + 1;
      return `${(daysLeftInMonth / daysInMonth) * 100}%`;
    }
    
    // If sprint ends in this month but started in a previous month
    if (isSameMonth(endDate, month)) {
      const sprintEndDay = endDate.getDate();
      return `${(sprintEndDay / daysInMonth) * 100}%`;
    }
    
    // If sprint spans the entire month
    return '100%';
  };
  
  // Calculate the offset of the sprint bar from the left of the month column
  const getSprintBarOffset = (sprint: Sprint, month: Date) => {
    if (!sprint.startDate) return '0%';
    
    const startDate = parseISO(sprint.startDate);
    
    // Only calculate offset if sprint starts in this month
    if (isSameMonth(startDate, month)) {
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      const sprintStartDay = startDate.getDate();
      return `${((sprintStartDay - 1) / daysInMonth) * 100}%`;
    }
    
    return '0%';
  };
  
  // Check if today's date falls within this month
  const isTodayInMonth = (month: Date) => {
    const today = new Date();
    return isSameMonth(today, month);
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading timeline...</div>;
  }

  const months = getMonths();
  const today = new Date();
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonths}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">{format(startDate, 'MMM yyyy')} - {format(addMonths(startDate, numMonths - 1), 'MMM yyyy')}</h3>
          <Button variant="outline" size="sm" onClick={nextMonths}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Today: {format(today, 'MMM d, yyyy')}</span>
        </div>
      </div>
      
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <ScrollArea className="h-[calc(100vh-20rem)] w-full">
            <div className="min-w-[900px]">
              {/* Month Headers */}
              <div className="flex border-b">
                <div className="flex-none w-48 p-3 font-medium bg-muted">Sprints</div>
                {months.map((month, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex-1 p-3 text-center font-medium border-l",
                      isTodayInMonth(month) ? "bg-blue-50" : "bg-muted"
                    )}
                  >
                    {format(month, 'MMMM yyyy')}
                  </div>
                ))}
              </div>
              
              {/* Sprint Rows */}
              {sprints.length > 0 ? (
                sprints.map((sprint) => (
                  <div key={sprint.id} className="flex border-b hover:bg-gray-50">
                    <div className="flex-none w-48 p-3 truncate">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-3 w-3 rounded-full", getSprintColor(sprint.status))}></div>
                        <span className="font-medium">{sprint.name}</span>
                      </div>
                    </div>
                    
                    {months.map((month, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex-1 p-3 relative border-l",
                          isTodayInMonth(month) ? "bg-blue-50" : ""
                        )}
                      >
                        {isSprintActiveInMonth(sprint, month) && (
                          <div 
                            className="absolute h-6 rounded-full"
                            style={{
                              left: getSprintBarOffset(sprint, month),
                              width: getSprintBarWidth(sprint, month),
                              backgroundColor: sprint.status === 'active' ? '#10b981' : 
                                              sprint.status === 'completed' ? '#3b82f6' : '#9ca3af',
                              opacity: 0.7,
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }}
                          >
                            <div className="w-full h-full flex items-center justify-center text-xs text-white font-medium overflow-hidden whitespace-nowrap px-2">
                              {sprint.name}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No sprints available. Create sprints in the Sprints tab to see them on the timeline.
                </div>
              )}
              
              {/* Today indicator */}
              {months.findIndex(month => isTodayInMonth(month)) !== -1 && (
                <div 
                  className="absolute top-0 bottom-0 border-r-2 border-blue-500 z-10"
                  style={{
                    left: `calc(${48 + months.findIndex(month => isTodayInMonth(month)) * (100 / numMonths)}% + ${(today.getDate() / new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()) * (100 / numMonths)}%)`,
                    pointerEvents: 'none'
                  }}
                ></div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-4 gap-2">
        <Button 
          variant={numMonths === 3 ? "default" : "outline"} 
          size="sm"
          onClick={() => setNumMonths(3)}
        >
          Quarters
        </Button>
        <Button 
          variant={numMonths === 6 ? "default" : "outline"} 
          size="sm"
          onClick={() => setNumMonths(6)}
        >
          6 Months
        </Button>
        <Button 
          variant={numMonths === 12 ? "default" : "outline"} 
          size="sm"
          onClick={() => setNumMonths(12)}
        >
          12 Months
        </Button>
      </div>
    </div>
  );
};
