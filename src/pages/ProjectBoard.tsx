
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Board } from "@/components/Board";
import { useEffect } from "react";
import { useAppStore } from "@/store";

const ProjectBoard = () => {
  const { projectId = "" } = useParams();
  const { fetchIssues } = useAppStore();
  
  // Pre-fetch issues when the component mounts
  useEffect(() => {
    if (projectId) {
      fetchIssues(projectId);
    }
  }, [projectId, fetchIssues]);
  
  return (
    <div className="h-full flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="flex-1 overflow-auto">
        <Board projectId={projectId} />
      </div>
    </div>
  );
};

export default ProjectBoard;
