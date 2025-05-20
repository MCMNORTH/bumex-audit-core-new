
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Board } from "@/components/Board";

const ProjectBoard = () => {
  const { projectId = "" } = useParams();
  
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
