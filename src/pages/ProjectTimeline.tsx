
import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sprint } from "@/types";

const ProjectTimeline = () => {
  const { projectId = "" } = useParams();
  const { getSprintsByProject, fetchSprints } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [months, setMonths] = useState<Date[]>([]);
  
  // Generate 6 months starting from current month
  useEffect(() => {
    const nextMonths = Array.from({ length: 6 }, (_, i) => 
      startOfMonth(addMonths(currentDate, i))
    );
    setMonths(nextMonths);
  }, [currentDate]);
  
  // Fetch sprints on component mount
  useEffect(() => {
    if (projectId) {
      fetchSprints(projectId);
    }
  }, [projectId, fetchSprints]);
  
  const sprints = getSprintsByProject(projectId);
  
  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, -1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate sprint position and width based on dates
  const calculateSprintPosition = (sprint: Sprint) => {
    if (!sprint.startDate || !sprint.endDate) return null;
    
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    
    // Check if sprint is within the displayed months range
    const firstDisplayedMonth = months[0];
    const lastDisplayedMonth = endOfMonth(months[months.length - 1]);
    
    if (endDate < firstDisplayedMonth || startDate > lastDisplayedMonth) {
      return null; // Sprint is outside the visible range
    }
    
    // Calculate position
    const timelineStart = firstDisplayedMonth.getTime();
    const timelineEnd = lastDisplayedMonth.getTime();
    const timelineWidth = timelineEnd - timelineStart;
    
    const sprintStartPos = Math.max(startDate.getTime() - timelineStart, 0);
    const sprintEndPos = Math.min(endDate.getTime() - timelineStart, timelineWidth);
    
    const leftPercent = (sprintStartPos / timelineWidth) * 100;
    const widthPercent = ((sprintEndPos - sprintStartPos) / timelineWidth) * 100;
    
    // Determine color based on sprint status
    let backgroundColor = '#4CAF50'; // Green for active
    if (sprint.status === 'completed') {
      backgroundColor = '#9E9E9E'; // Gray for completed
    } else if (sprint.status === 'future') {
      backgroundColor = '#2196F3'; // Blue for future
    }
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      backgroundColor
    };
  };
  
  return (
    <div className="h-full flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="p-4 flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Project Timeline</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="border rounded-md overflow-auto">
          {/* Month headers */}
          <div className="flex border-b">
            <div className="w-48 min-w-48 flex-shrink-0 border-r p-2 font-medium">
              Sprints
            </div>
            <div className="flex-1 flex">
              {months.map((month, index) => (
                <div 
                  key={index} 
                  className="flex-1 p-2 text-center font-medium border-r last:border-r-0"
                >
                  {format(month, 'MMMM yyyy')}
                </div>
              ))}
            </div>
          </div>
          
          {/* Today indicator */}
          <div className="relative">
            {months.some(month => isSameMonth(month, new Date())) && (
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-blue-500 z-10"
                style={{ 
                  left: `calc(${(months.findIndex(month => isSameMonth(month, new Date())) / months.length) * 100}% + ${(new Date().getDate() / 30) * (100 / months.length)}%)`,
                }}
              >
                <div className="absolute top-0 -left-[15px] bg-blue-500 text-white text-xs px-1 rounded">
                  Today
                </div>
              </div>
            )}
            
            {/* Sprint rows */}
            {sprints.length === 0 ? (
              <div className="flex h-32">
                <div className="w-48 min-w-48 flex-shrink-0 border-r p-2">
                  No sprints
                </div>
                <div className="flex-1 p-4 text-center text-gray-500">
                  No sprints have been created for this project
                </div>
              </div>
            ) : (
              sprints.map(sprint => {
                const sprintStyle = calculateSprintPosition(sprint);
                
                return (
                  <div key={sprint.id} className="flex border-b last:border-b-0">
                    <div className="w-48 min-w-48 flex-shrink-0 border-r p-2 flex items-center">
                      <div>
                        <div className="font-medium">{sprint.name}</div>
                        <div className="text-xs text-gray-500">
                          {sprint.startDate && sprint.endDate ? 
                            `${format(new Date(sprint.startDate), 'MMM d')} - ${format(new Date(sprint.endDate), 'MMM d')}` : 
                            'No dates set'}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative h-16">
                      {sprintStyle && (
                        <div 
                          className="absolute h-8 top-4 rounded-md opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-white text-xs flex items-center justify-center"
                          style={sprintStyle}
                          title={sprint.name}
                        >
                          {sprintStyle.width !== '0%' && sprint.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
