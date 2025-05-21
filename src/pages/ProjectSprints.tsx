
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { SprintBoard } from "@/components/SprintBoard";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateSprintDialog } from "@/components/CreateSprintDialog";
import { useAppStore } from "@/store";

const ProjectSprints = () => {
  const { projectId = "" } = useParams();
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const { fetchSprints, fetchIssues } = useAppStore();
  
  // Pre-fetch sprints and issues when the component mounts
  useEffect(() => {
    if (projectId) {
      Promise.all([
        fetchSprints(projectId),
        fetchIssues(projectId)
      ]);
    }
  }, [projectId, fetchSprints, fetchIssues]);
  
  return (
    <div className="h-full flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">Sprints</h2>
        <Button 
          onClick={() => setIsCreateSprintOpen(true)} 
          className="bg-jira-blue hover:bg-jira-blue-dark"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Sprint
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <SprintBoard projectId={projectId} />
      </div>
      
      <CreateSprintDialog 
        open={isCreateSprintOpen} 
        onOpenChange={setIsCreateSprintOpen} 
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectSprints;
