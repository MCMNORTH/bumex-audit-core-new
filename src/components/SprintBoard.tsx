
import { useAppStore } from "@/store";
import { Sprint } from "@/types";
import { useEffect, useState } from "react";
import { SprintCard } from "./SprintCard";
import { useToast } from "@/hooks/use-toast";

interface SprintBoardProps {
  projectId: string;
}

export const SprintBoard = ({ projectId }: SprintBoardProps) => {
  const { getSprintsByProject, fetchSprints, loading, getIssuesByProject, updateIssueSprint, fetchIssues } = useAppStore();
  const { toast } = useToast();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (projectId) {
        console.log("SprintBoard: Loading data for project", projectId);
        await fetchIssues(projectId);
        await fetchSprints(projectId);
        const projectSprints = getSprintsByProject(projectId);
        setSprints(projectSprints);
      }
    };
    
    loadData();
  }, [projectId, fetchIssues, fetchSprints, getSprintsByProject]);
  
  const issues = getIssuesByProject(projectId);
  const backlogIssues = issues.filter(issue => !issue.sprintId);
  
  const handleDragStart = (issueId: string) => {
    setDraggedIssueId(issueId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, sprintId: string | "backlog") => {
    e.preventDefault();
    
    if (!draggedIssueId) return;
    
    try {
      // If dropping in backlog, set sprintId to null
      const targetSprintId = sprintId === "backlog" ? null : sprintId;
      await updateIssueSprint(draggedIssueId, targetSprintId);
      
      toast({
        title: "Issue updated",
        description: `Issue moved to ${sprintId === "backlog" ? "Backlog" : "Sprint"}`
      });
    } catch (error) {
      console.error("Error updating issue sprint:", error);
      toast({
        title: "Error",
        description: "Failed to update issue sprint",
        variant: "destructive"
      });
    } finally {
      setDraggedIssueId(null);
    }
  };
  
  if (loading.sprints || loading.issues) {
    return <div className="p-4">Loading sprints and issues...</div>;
  }
  
  return (
    <div className="p-4">
      {/* Backlog */}
      <div 
        className="mb-6" 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "backlog")}
      >
        <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
          Backlog
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {backlogIssues.length}
          </span>
        </h3>
        <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
          {backlogIssues.length === 0 ? (
            <div className="text-gray-500 text-center">No issues in backlog</div>
          ) : (
            <div className="space-y-2">
              {backlogIssues.map((issue) => (
                <div 
                  key={issue.id}
                  draggable
                  onDragStart={() => handleDragStart(issue.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  {/* Re-use the IssueCard component here */}
                  <div className="bg-white p-3 rounded-md shadow border border-gray-200 mb-2">
                    <div className="font-medium text-sm">{issue.title}</div>
                    <div className="text-xs text-gray-500 mt-1">ID: {issue.id.substring(0, 8)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Sprints */}
      {sprints.map((sprint) => (
        <SprintCard 
          key={sprint.id} 
          sprint={sprint} 
          projectId={projectId}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, sprint.id)}
          onDragStart={handleDragStart}
        />
      ))}
      
      {sprints.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No sprints created yet.</p>
          <p className="text-sm text-gray-400">Create a sprint to start planning your work.</p>
        </div>
      )}
    </div>
  );
};
