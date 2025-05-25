
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import ProjectProgress from "@/components/ProjectProgress";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const {
    projects,
    issues,
    epics,
    fetchProjects,
    fetchIssues,
    fetchEpics,
    toggleStarProject
  } = useAppStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Filter projects to only show those owned by the current user
  const userProjects = projects.filter(project => project.owner === currentUser?.uid);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch projects first
        await fetchProjects();

        // Get all project IDs for user's projects only
        const userProjectIds = projects
          .filter(project => project.owner === currentUser?.uid)
          .map(project => project.id);

        // Fetch all issues and epics for each user project in parallel
        if (userProjectIds.length > 0) {
          const promises = [];
          for (const projectId of userProjectIds) {
            promises.push(fetchIssues(projectId));
            promises.push(fetchEpics(projectId));
          }
          await Promise.all(promises);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser?.uid) {
      loadData();
    }
  }, [currentUser?.uid]); // Add dependency on currentUser

  const totalIssues = issues.length;
  const completedIssues = issues.filter(issue => issue.status === 'done').length;

  const handleStarClick = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleStarProject(projectId);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}/details`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading data...</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            {userProjects.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-md border">
                <p className="text-gray-500 mb-2">No projects found</p>
                <p className="text-sm text-gray-400">You don't have any projects assigned to you yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userProjects.map(project => (
                  <Card 
                    key={project.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {project.imageUrl ? (
                            <img src={project.imageUrl} alt={project.name} className="w-8 h-8 object-cover rounded" />
                          ) : (
                            <div className="w-8 h-8 bg-[#459ed7] rounded flex items-center justify-center text-white font-semibold">
                              {project.key.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <CardTitle>{project.name}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-yellow-500"
                          onClick={(e) => handleStarClick(e, project.id)}
                        >
                          <Star 
                            className={cn(
                              "h-4 w-4",
                              project.starred 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "fill-none"
                            )} 
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {project.description || "No description available."}
                      </p>
                      
                      <ProjectProgress project={project} showDetails />
                      
                      <div className="mt-4">
                        <span className="text-xs text-gray-500">
                          Created: {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
