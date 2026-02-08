
import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, differenceInDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sprint } from "@/types";
import { cn } from "@/lib/utils";

const ProjectTimeline = () => {
  const { projectId = "" } = useParams();
  const { getSprintsByProject, fetchSprints, loading } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeframe, setTimeframe] = useState<"month" | "quarter" | "year">("month");
  
  // Fetch sprints on component mount
  useEffect(() => {
    if (projectId) {
      fetchSprints(projectId);
    }
  }, [projectId, fetchSprints]);
  
  const sprints = getSprintsByProject(projectId);
  
  // Generate dates based on selected timeframe
  const generateTimelineDates = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (timeframe) {
      case "month":
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(addMonths(startDate, 1));
        break;
      case "quarter":
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(addMonths(startDate, 2));
        break;
      case "year":
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(addMonths(startDate, 11));
        break;
    }
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };
  
  const dates = generateTimelineDates();
  const months = Array.from(new Set(dates.map(date => format(date, 'MMM yyyy'))));
  
  const handlePreviousPeriod = () => {
    switch (timeframe) {
      case "month":
        setCurrentDate(prevDate => addMonths(prevDate, -1));
        break;
      case "quarter":
        setCurrentDate(prevDate => addMonths(prevDate, -3));
        break;
      case "year":
        setCurrentDate(prevDate => addMonths(prevDate, -12));
        break;
    }
  };
  
  const handleNextPeriod = () => {
    switch (timeframe) {
      case "month":
        setCurrentDate(prevDate => addMonths(prevDate, 1));
        break;
      case "quarter":
        setCurrentDate(prevDate => addMonths(prevDate, 3));
        break;
      case "year":
        setCurrentDate(prevDate => addMonths(prevDate, 12));
        break;
    }
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get valid sprints with proper date formatting
  const validSprints = sprints.filter(sprint => 
    sprint.startDate && 
    sprint.endDate && 
    !isNaN(new Date(sprint.startDate).getTime()) && 
    !isNaN(new Date(sprint.endDate).getTime())
  );

  // Organize sprints by their timeline position to prevent overlaps
  const calculateSprintRows = () => {
    if (!validSprints.length || !dates.length) return [];
    
    const sortedSprints = [...validSprints].sort((a, b) => 
      new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
    );
    
    const rows: Sprint[][] = [];
    
    sortedSprints.forEach(sprint => {
      // Find a row where this sprint can fit
      let placed = false;
      for (let i = 0; i < rows.length; i++) {
        const lastSprintInRow = rows[i][rows[i].length - 1];
        const lastEndDate = new Date(lastSprintInRow.endDate!);
        const currentStartDate = new Date(sprint.startDate!);
        
        // If there's enough space after the last sprint in this row
        if (lastEndDate < currentStartDate) {
          rows[i].push(sprint);
          placed = true;
          break;
        }
      }
      
      // If couldn't place in existing rows, create a new row
      if (!placed) {
        rows.push([sprint]);
      }
    });
    
    return rows;
  };
  
  const sprintRows = calculateSprintRows();
  
  // Calculate visual properties for a sprint on the timeline
  const getSprintStyle = (sprint: Sprint) => {
    if (!sprint.startDate || !sprint.endDate || !dates.length) return null;
    
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const timelineStart = dates[0];
    const timelineEnd = dates[dates.length - 1];
    
    // If sprint is outside the visible range
    if (endDate < timelineStart || startDate > timelineEnd) {
      return null;
    }
    
    const visibleStartDate = startDate < timelineStart ? timelineStart : startDate;
    const visibleEndDate = endDate > timelineEnd ? timelineEnd : endDate;
    
    const daysFromStart = differenceInDays(visibleStartDate, timelineStart);
    const sprintDuration = differenceInDays(visibleEndDate, visibleStartDate) + 1;
    const totalDays = dates.length;
    
    const startPercent = (daysFromStart / totalDays) * 100;
    const widthPercent = (sprintDuration / totalDays) * 100;
    
    let backgroundColor = '#4CAF50'; // Green for active
    if (sprint.status === 'completed') {
      backgroundColor = '#9E9E9E'; // Gray for completed
    } else if (sprint.status === 'future') {
      backgroundColor = '#2196F3'; // Blue for future
    }
    
    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`,
      backgroundColor
    };
  };
  
  const getMonthWidth = (monthName: string) => {
    const monthDates = dates.filter(date => format(date, 'MMM yyyy') === monthName);
    return (monthDates.length / dates.length) * 100;
  };

  if (loading.sprints) {
    return (
      <div className="h-full flex flex-col">
        <ProjectHeader projectId={projectId} />
        <div className="p-4 flex-1 overflow-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading sprints...</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="p-4 flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Project Timeline</h2>
          <div className="flex space-x-2">
            <div className="border rounded-md overflow-hidden">
              <Button 
                onClick={() => setTimeframe("month")} 
                variant={timeframe === "month" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none",
                  timeframe === "month" ? "bg-blue-500 hover:bg-blue-600" : ""
                )}
              >
                Month
              </Button>
              <Button 
                onClick={() => setTimeframe("quarter")} 
                variant={timeframe === "quarter" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none",
                  timeframe === "quarter" ? "bg-blue-500 hover:bg-blue-600" : ""
                )}
              >
                Quarter
              </Button>
              <Button 
                onClick={() => setTimeframe("year")} 
                variant={timeframe === "year" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none",
                  timeframe === "year" ? "bg-blue-500 hover:bg-blue-600" : ""
                )}
              >
                Year
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreviousPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden bg-white shadow">
          {/* Header with current period */}
          <div className="bg-blue-50 border-b p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium">
                {timeframe === "month" && format(currentDate, 'MMMM yyyy')}
                {timeframe === "quarter" && `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`}
                {timeframe === "year" && format(currentDate, 'yyyy')}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {validSprints.length} {validSprints.length === 1 ? 'sprint' : 'sprints'}
            </div>
          </div>
          
          {/* Month headers */}
          <div className="flex border-b bg-gray-50">
            {months.map((month, index) => (
              <div 
                key={index} 
                className="text-center py-2 border-r last:border-r-0 font-medium text-gray-700"
                style={{ width: `${getMonthWidth(month)}%` }}
              >
                {month}
              </div>
            ))}
          </div>
          
          {/* Today indicator */}
          {dates.some(date => isToday(date)) && (
            <div className="relative">
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
                style={{ 
                  left: `${(dates.findIndex(date => isToday(date)) / dates.length) * 100}%`
                }}
              >
                <div className="absolute -top-1 -translate-x-1/2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                  Today
                </div>
              </div>
            </div>
          )}
          
          {/* Sprint rows */}
          <div className="relative">
            {sprintRows.length ? (
              <div className="p-4">
                {sprintRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="relative h-12 mb-3 last:mb-0">
                    {row.map((sprint) => {
                      const style = getSprintStyle(sprint);
                      if (!style) return null;
                      
                      return (
                        <div
                          key={sprint.id}
                          className="absolute h-10 rounded-md shadow-sm flex items-center justify-center px-2 text-white cursor-pointer hover:opacity-90 transition-opacity"
                          style={{
                            left: style.left,
                            width: style.width,
                            backgroundColor: style.backgroundColor,
                            top: '0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={`${sprint.name} (${sprint.startDate ? format(new Date(sprint.startDate), 'MMM d') : 'No date'} - ${sprint.endDate ? format(new Date(sprint.endDate), 'MMM d') : 'No date'})`}
                        >
                          <span className="text-sm font-medium truncate">
                            {sprint.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-1">No sprints with valid dates found</div>
                <div className="text-sm text-gray-400">Create sprints with start and end dates to see them on the timeline</div>
              </div>
            )}
          </div>
          
          {/* Timeline grid */}
          <div className="h-12 border-t flex">
            {months.map((month, index) => (
              <div 
                key={index}
                className="border-r last:border-r-0 relative"
                style={{ width: `${getMonthWidth(month)}%` }}
              >
                <div className="absolute inset-0 grid grid-cols-[repeat(auto-fit,_minmax(0,_1fr))]">
                  {dates
                    .filter(date => format(date, 'MMM yyyy') === month)
                    .map((date, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "border-r last:border-r-0 relative",
                          isToday(date) ? "bg-red-50" : i % 2 === 0 ? "bg-gray-50" : "bg-white"
                        )}
                      >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">
                          {format(date, 'd')}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sprint legend */}
        <div className="mt-4 flex items-center justify-end space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#2196F3] mr-2"></div>
            <span className="text-sm text-gray-600">Future</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#4CAF50] mr-2"></div>
            <span className="text-sm text-gray-600">Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#9E9E9E] mr-2"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
