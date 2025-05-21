
import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { SprintCard } from "@/components/SprintCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateSprintDialog } from "@/components/CreateSprintDialog";
import { Sprint } from "@/types";

const ProjectSprints = () => {
  const { projectId = "" } = useParams();
  const { 
    getSprintsByProject, 
    updateIssueSprint, 
    fetchSprints,
    loading 
  } = useAppStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  
  useEffect(() => {
    if (projectId) {
      fetchSprints(projectId);
    }
  }, [projectId, fetchSprints]);
  
  const sprints = getSprintsByProject(projectId);
  
  // Sort sprints by creation date (newest first)
  const sortedSprints = [...sprints].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, sprintId: string) => {
    e.preventDefault();
    if (draggedIssueId) {
      updateIssueSprint(draggedIssueId, sprintId);
      setDraggedIssueId(null);
    }
  };

  const handleDragStart = (issueId: string) => {
    setDraggedIssueId(issueId);
  };

  return (
    <div className="h-full flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Sprints</h2>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#459ed7] hover:bg-[#3688bd] flex gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Create Sprint
          </Button>
        </div>
        
        {loading.sprints ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading sprints...</p>
          </div>
        ) : sortedSprints.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-md border">
            <p className="text-gray-500 mb-4">No sprints found</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First Sprint
            </Button>
          </div>
        ) : (
          <div>
            {sortedSprints.map((sprint: Sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                projectId={projectId}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, sprint.id)}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        )}
      </div>
      
      <CreateSprintDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectSprints;
