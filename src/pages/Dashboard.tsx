
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Dashboard = () => {
  const { projects, issues, epics } = useAppStore();
  const navigate = useNavigate();

  const totalIssues = issues.length;
  const completedIssues = issues.filter(issue => issue.status === 'done').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          onClick={() => navigate('/create-project')}
          className="bg-jira-blue hover:bg-jira-blue-dark flex gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{projects.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Epics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{epics.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Issues Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedIssues} / {totalIssues}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-jira-blue-dark rounded flex items-center justify-center text-white font-semibold">
                    {project.key.substring(0, 2).toUpperCase()}
                  </div>
                  <CardTitle>{project.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {project.description || "No description available."}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="link" className="text-jira-blue p-0 h-auto">
                    View Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
