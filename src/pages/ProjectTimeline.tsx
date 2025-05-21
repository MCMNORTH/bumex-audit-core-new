
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ProjectTimeline } from "@/components/ProjectTimeline";

const ProjectTimelinePage = () => {
  const { projectId = "" } = useParams();
  
  return (
    <div className="h-full flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="flex-1 overflow-auto">
        <h2 className="text-xl font-semibold p-4 pb-2">Timeline</h2>
        <ProjectTimeline projectId={projectId} />
      </div>
    </div>
  );
};

export default ProjectTimelinePage;
