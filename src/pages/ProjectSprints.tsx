
import { useEffect } from "react";
import { useAppStore } from "@/store";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { SprintBoard } from "@/components/SprintBoard";

const ProjectSprints = () => {
  const { projectId = "" } = useParams();
  const { fetchSprints, fetchIssues } = useAppStore();
  
  useEffect(() => {
    if (projectId) {
      // Fetch both issues and sprints when component mounts
      Promise.all([
        fetchIssues(projectId),
        fetchSprints(projectId)
      ]);
    }
  }, [projectId, fetchSprints, fetchIssues]);
  
  return (
    <div className="h-full flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-6">Sprint Planning</h2>
        
        <div className="w-full">
          <SprintBoard projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

export default ProjectSprints;
