
import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Project, User as UserType } from "@/types";
import { toast } from "@/components/ui/use-toast";

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { projects, fetchProjects, loading } = useAppStore();
  const [client, setClient] = useState<UserType | null>(null);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) {
        console.error("No client ID provided, clientId is:", clientId);
        setError("No client ID provided");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching client with ID:", clientId);
        const clientDoc = await getDoc(doc(db, "users", clientId));
        if (clientDoc.exists()) {
          const userData = clientDoc.data() as UserType;
          console.log("Fetched user data:", userData);
          
          // Verify this user is actually a client
          if (userData.userType !== "client") {
            console.error("User is not a client:", userData);
            setError("User is not a client");
            setIsLoading(false);
            return;
          }
          
          setClient({ ...userData, id: clientId });
          toast({
            title: "Client loaded",
            description: `Successfully loaded client: ${userData.fullName || userData.name}`,
          });
        } else {
          console.error("Client document does not exist for ID:", clientId);
          setError("Client not found");
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        setError("Error loading client data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
    fetchProjects();
  }, [clientId, fetchProjects]);

  useEffect(() => {
    if (projects.length && client && clientId) {
      // Find projects where this client is the owner
      const filteredProjects = projects.filter(project => project.owner === clientId);
      console.log("Filtered projects for client:", clientId, filteredProjects);
      setClientProjects(filteredProjects);
    }
  }, [projects, client, clientId]);

  if (error === "No client ID provided") {
    return <Navigate to="/clients" replace />;
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <p>Loading client information...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Client Not Found</h2>
          <p className="text-gray-500">{error || "The client you're looking for doesn't exist or has been removed."}</p>
          <Button asChild className="mt-4">
            <Link to="/clients">Back to Clients</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {client.avatarUrl ? (
            <img 
              src={client.avatarUrl} 
              alt={client.fullName || client.name} 
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{client.fullName || client.name}</h1>
            <p className="text-gray-600">{client.email}</p>
            {client.contactNumber && (
              <p className="text-sm text-gray-500">Contact: {client.contactNumber}</p>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to="/clients">Back to Clients</Link>
        </Button>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Client Projects</h2>
      
      {clientProjects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No projects found for this client</p>
              <Button asChild className="mt-4">
                <Link to="/create-project">Create New Project</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientProjects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="block">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.key}</CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {project.description || "No description available"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
