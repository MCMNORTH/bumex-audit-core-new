import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store";
import { Edit, Star, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
interface ProjectHeaderProps {
  projectId: string;
}
export const ProjectHeader = ({
  projectId
}: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    getProjectById,
    toggleStarProject
  } = useAppStore();
  const project = getProjectById(projectId);
  const [activeTab, setActiveTab] = useState<string>("");
  useEffect(() => {
    // Set the active tab based on the current route
    if (location.pathname === `/projects/${projectId}`) {
      setActiveTab("board");
    } else if (location.pathname === `/projects/${projectId}/issues`) {
      setActiveTab("issues");
    } else if (location.pathname === `/projects/${projectId}/sprints`) {
      setActiveTab("sprints");
    } else if (location.pathname === `/projects/${projectId}/timeline`) {
      setActiveTab("timeline");
    }
  }, [location.pathname, projectId]);
  if (!project) {
    return <div className="bg-accent border-b border-border p-4">Project not found</div>;
  }
  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleStarProject(projectId);
  };
  const handleTabClick = (value: string) => {
    let route = `/projects/${projectId}`;
    if (value !== "board") {
      route += `/${value}`;
    }
    navigate(route);
  };
  return <div className="bg-accent border-b border-border">
      <div className="container py-4 mx-auto bg-[jira-dark-sidebar] bg-orange-500">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {project.imageUrl ? <img src={project.imageUrl} alt={project.name} className="w-10 h-10 rounded-md object-cover" /> : <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-semibold">
                {project.key.substring(0, 2).toUpperCase()}
              </div>}
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <span className="text-sm text-white">{project.key}</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500" onClick={handleStarClick}>
              <Star className={cn("h-5 w-5", project.starred ? "fill-yellow-400 text-yellow-400" : "fill-none")} />
              <span className="sr-only">{project.starred ? "Unstar" : "Star"} project</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/create-issue`)} className="flex items-center gap-1 bg-[jira-dark-sidebar] bg-orange-500 hover:bg-orange-400">
              <FilePlus className="h-4 w-4" />
              Create Issue
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => navigate(`/projects/${projectId}/edit`)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
          <TabsList>
            <TabsTrigger value="board" className="focus:outline-none">
              Board
            </TabsTrigger>
            <TabsTrigger value="issues" className="focus:outline-none">
              List
            </TabsTrigger>
            <TabsTrigger value="sprints" className="focus:outline-none">
              Sprints
            </TabsTrigger>
            <TabsTrigger value="timeline" className="focus:outline-none">
              Timeline
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>;
};