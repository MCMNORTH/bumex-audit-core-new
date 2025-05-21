
import { useEffect, useState } from 'react';
import { Sprint } from '@/types';
import { useAppStore } from '@/store';
import { format, parseISO, isSameDay, isWithinInterval, addMonths } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ProjectTimelineProps {
  projectId: string;
}

export const ProjectTimeline = ({ projectId }: ProjectTimelineProps) => {
  const { getSprintsByProject, fetchSprints } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  
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

  // Navigate to previous/next month
  const prevMonth = () => {
    setMonth(prev => addMonths(prev, -1));
  };
  
  const nextMonth = () => {
    setMonth(prev => addMonths(prev, 1));
  };
  
  // Custom day rendering to highlight sprint dates
  const renderDay = (date: Date) => {
    // Track which sprints are active on this day
    const activeSprints = sprints.filter(sprint => {
      if (!sprint.startDate || !sprint.endDate) return false;
      
      const startDate = parseISO(sprint.startDate);
      const endDate = parseISO(sprint.endDate);
      
      return isWithinInterval(date, { start: startDate, end: endDate }) ||
             isSameDay(date, startDate) ||
             isSameDay(date, endDate);
    });

    if (activeSprints.length === 0) return null;
    
    return (
      <div className="h-full w-full relative">
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
          {activeSprints.slice(0, 3).map((sprint, i) => (
            <div 
              key={sprint.id}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                getSprintColor(sprint.status)
              )}
              title={sprint.name}
            ></div>
          ))}
          {activeSprints.length > 3 && (
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500" title={`+${activeSprints.length - 3} more sprints`}></div>
          )}
        </div>
      </div>
    );
  };
  
  // Handle day click to show sprint details
  const handleDayClick = (day: Date) => {
    const activeSprints = sprints.filter(sprint => {
      if (!sprint.startDate || !sprint.endDate) return false;
      
      const startDate = parseISO(sprint.startDate);
      const endDate = parseISO(sprint.endDate);
      
      return isWithinInterval(day, { start: startDate, end: endDate }) ||
             isSameDay(day, startDate) ||
             isSameDay(day, endDate);
    });
    
    if (activeSprints.length > 0) {
      // If there's only one sprint on this day, select it directly
      if (activeSprints.length === 1) {
        setSelectedSprint(activeSprints[0]);
      } else if (selectedSprint) {
        // If there's already a selected sprint and it's in the active sprints, cycle to the next one
        const currentIndex = activeSprints.findIndex(s => s.id === selectedSprint.id);
        if (currentIndex >= 0 && currentIndex < activeSprints.length - 1) {
          setSelectedSprint(activeSprints[currentIndex + 1]);
        } else {
          setSelectedSprint(activeSprints[0]);
        }
      } else {
        // If nothing is selected, select the first active sprint
        setSelectedSprint(activeSprints[0]);
      }
    } else {
      setSelectedSprint(null);
    }
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading calendar...</div>;
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">{format(month, 'MMMM yyyy')}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {sprints.length > 0 && (
          <Select 
            value={selectedSprint?.id || ""} 
            onValueChange={(value) => {
              const sprint = sprints.find(s => s.id === value);
              setSelectedSprint(sprint || null);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a sprint" />
            </SelectTrigger>
            <SelectContent>
              {sprints.map(sprint => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            className={cn("w-full pointer-events-auto")}
            onDayClick={handleDayClick}
            components={{
              Day: ({ date, ...props }: { date: Date; [key: string]: any }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 w-9 p-0 font-normal relative aria-selected:opacity-100",
                    props.className
                  )}
                  {...props}
                >
                  {format(date, "d")}
                  {renderDay(date)}
                </Button>
              ),
            }}
          />
        </CardContent>
      </Card>
      
      {selectedSprint && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", getSprintColor(selectedSprint.status))}></div>
                <h3 className="font-semibold">{selectedSprint.name}</h3>
                <span className={cn("ml-2 px-2 py-0.5 rounded-full text-xs font-medium", 
                  selectedSprint.status === 'active' ? "bg-green-100 text-green-800" : 
                  selectedSprint.status === 'completed' ? "bg-blue-100 text-blue-800" : 
                  "bg-gray-100 text-gray-800")}>
                  {selectedSprint.status.charAt(0).toUpperCase() + selectedSprint.status.slice(1)}
                </span>
              </div>
              
              {selectedSprint.goal && (
                <p className="text-sm text-gray-500">{selectedSprint.goal}</p>
              )}
              
              <div className="text-xs text-gray-500">
                {selectedSprint.startDate && (
                  <span>Start: {format(parseISO(selectedSprint.startDate), 'MMM d, yyyy')}</span>
                )}
                {selectedSprint.startDate && selectedSprint.endDate && (
                  <span> • </span>
                )}
                {selectedSprint.endDate && (
                  <span>End: {format(parseISO(selectedSprint.endDate), 'MMM d, yyyy')}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {sprints.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No sprints available. Create sprints in the Sprints tab to see them on the calendar.
        </div>
      )}
    </div>
  );
};
