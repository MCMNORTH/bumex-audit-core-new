
import { useEffect, useState, useRef } from 'react';
import { Sprint } from '@/types';
import { useAppStore } from '@/store';
import { 
  format, 
  parseISO, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  eachWeekOfInterval, 
  eachMonthOfInterval,
  isSameMonth,
  isSameWeek,
  isSameDay,
  addDays,
  addWeeks
} from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from '@/components/ui/toggle-group';

type TimelineView = 'days' | 'weeks' | 'months';

interface ProjectTimelineProps {
  projectId: string;
}

export const ProjectTimeline = ({ projectId }: ProjectTimelineProps) => {
  const { getSprintsByProject, fetchSprints } = useAppStore();
  const [timeUnits, setTimeUnits] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<TimelineView>('months');
  const [startDate, setStartDate] = useState(() => startOfMonth(addMonths(new Date(), -1)));
  const [endDate, setEndDate] = useState(() => endOfMonth(addMonths(new Date(), 2)));
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Fetching sprints data
  useEffect(() => {
    const loadSprints = async () => {
      setLoading(true);
      await fetchSprints(projectId);
      setLoading(false);
    };
    
    loadSprints();
  }, [projectId, fetchSprints]);
  
  // Update timeline units based on selected view
  useEffect(() => {
    let units: Date[] = [];
    
    switch (view) {
      case 'days':
        units = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'weeks':
        units = eachWeekOfInterval({ start: startDate, end: endDate });
        break;
      case 'months':
        units = eachMonthOfInterval({ start: startDate, end: endDate });
        break;
    }
    
    setTimeUnits(units);
  }, [view, startDate, endDate]);
  
  const sprints = getSprintsByProject(projectId);
  
  // Time navigation handlers
  const navigatePrevious = () => {
    switch (view) {
      case 'days':
        setStartDate(prev => addDays(prev, -14));
        setEndDate(prev => addDays(prev, -14));
        break;
      case 'weeks':
        setStartDate(prev => addWeeks(prev, -4));
        setEndDate(prev => addWeeks(prev, -4));
        break;
      case 'months':
        setStartDate(prev => addMonths(prev, -3));
        setEndDate(prev => addMonths(prev, -3));
        break;
    }
  };
  
  const navigateNext = () => {
    switch (view) {
      case 'days':
        setStartDate(prev => addDays(prev, 14));
        setEndDate(prev => addDays(prev, 14));
        break;
      case 'weeks':
        setStartDate(prev => addWeeks(prev, 4));
        setEndDate(prev => addWeeks(prev, 4));
        break;
      case 'months':
        setStartDate(prev => addMonths(prev, 3));
        setEndDate(prev => addMonths(prev, 3));
        break;
    }
  };
  
  // Dragging functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    timelineRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // Helper function to check if a sprint is active during a specific time unit
  const isSprintActiveInTimeUnit = (sprint: Sprint, timeUnit: Date) => {
    if (!sprint.startDate || !sprint.endDate) return false;
    
    const sprintStart = parseISO(sprint.startDate);
    const sprintEnd = parseISO(sprint.endDate);
    
    if (view === 'days') {
      return (
        isSameDay(timeUnit, sprintStart) ||
        isSameDay(timeUnit, sprintEnd) ||
        (timeUnit > sprintStart && timeUnit < sprintEnd)
      );
    } else if (view === 'weeks') {
      return (
        isSameWeek(timeUnit, sprintStart) ||
        isSameWeek(timeUnit, sprintEnd) ||
        (timeUnit > sprintStart && timeUnit < sprintEnd)
      );
    } else {
      return (
        isSameMonth(timeUnit, sprintStart) ||
        isSameMonth(timeUnit, sprintEnd) ||
        (timeUnit > sprintStart && timeUnit < sprintEnd)
      );
    }
  };
  
  // Helper function to get sprint color based on status
  const getSprintColor = (status: Sprint['status']) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  // Helper function to format time unit label
  const formatTimeUnitLabel = (date: Date) => {
    switch (view) {
      case 'days':
        return format(date, 'MMM d');
      case 'weeks':
        return `Week of ${format(date, 'MMM d')}`;
      case 'months':
        return format(date, 'MMMM yyyy');
    }
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading timeline...</div>;
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={navigatePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={navigateNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <ToggleGroup 
          type="single" 
          value={view}
          onValueChange={(value) => {
            if (value) setView(value as TimelineView);
          }}
        >
          <ToggleGroupItem value="days">Days</ToggleGroupItem>
          <ToggleGroupItem value="weeks">Weeks</ToggleGroupItem>
          <ToggleGroupItem value="months">Months</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <Card className="border rounded-md overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={timelineRef}
            className="overflow-x-auto"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="min-w-max">
              {/* Timeline Header */}
              <div className="flex border-b sticky top-0 bg-white z-10">
                <div className="w-32 min-w-32 p-2 font-medium border-r">Sprints</div>
                {timeUnits.map((unit) => (
                  <div 
                    key={unit.toString()} 
                    className="min-w-[120px] p-2 text-center font-medium border-r last:border-r-0"
                  >
                    {formatTimeUnitLabel(unit)}
                  </div>
                ))}
              </div>
              
              {/* Timeline Body */}
              <div>
                {sprints.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No sprints found</div>
                ) : (
                  sprints.map((sprint) => (
                    <div key={sprint.id} className="flex items-center border-b last:border-b-0">
                      <div className="w-32 min-w-32 p-2 font-medium border-r truncate">
                        {sprint.name}
                      </div>
                      
                      {timeUnits.map((unit) => {
                        const isActive = isSprintActiveInTimeUnit(sprint, unit);
                        return (
                          <div 
                            key={unit.toString()}
                            className="min-w-[120px] p-2 border-r last:border-r-0 min-h-[40px]"
                          >
                            {isActive && (
                              <div 
                                className={`${getSprintColor(sprint.status)} h-4 rounded-md`}
                                title={sprint.name}
                              ></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
