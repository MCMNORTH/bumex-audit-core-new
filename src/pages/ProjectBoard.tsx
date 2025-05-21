
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Board } from "@/components/Board";
import { useAppStore } from "@/store";
import { useEffect } from "react";

const ProjectBoard = () => {
  const { projectId = "" } = useParams();
  const { fetchIssues } = useAppStore();
  
  // Fetch issues when component mounts
  useEffect(() => {
    if (projectId) {
      console.log("ProjectBoard: Fetching issues for project", projectId);
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
