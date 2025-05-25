
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import ProjectProgress from "@/components/ProjectProgress";

const Dashboard = () => {
  const {
    projects,
    issues,
    epics,
    fetchProjects,
    fetchIssues,
    fetchEpics
  } = useAppStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch projects first
        await fetchProjects();

        // Get all project IDs
        const projectIds = projects.map(project => project.id);

        // Fetch all issues and epics for each project in parallel
        if (projectIds.length > 0) {
          const promises = [];
          for (const projectId of projectIds) {
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
    loadData();
  }, []); // Only run this effect once on component mount

  const totalIssues = issues.length;
  const completedIssues = issues.filter(issue => issue.status === 'done').length;

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
            {projects.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-md border">
                <p className="text-gray-500 mb-2">No projects found</p>
                <Button onClick={() => navigate('/create-project')} variant="outline">
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
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
