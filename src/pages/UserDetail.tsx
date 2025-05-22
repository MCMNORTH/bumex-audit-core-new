
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User as UserType, Project } from "@/types";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building, ArrowLeft, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Fetch user details
        const userDoc = doc(db, "users", userId);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
          const userData = { id: userSnap.id, ...userSnap.data() } as UserType;
          setUser(userData);
          
          // Fetch projects where this user is the owner
          const projectsCollection = collection(db, "projects");
          const q = query(projectsCollection, where("owner", "==", userId));
          const projectsSnap = await getDocs(q);
          
          const projectsData = projectsSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(project => !project.deleted) as Project[];
          
          setProjects(projectsData);
        } else {
          toast({
            variant: "destructive",
            title: "User not found",
            description: "The requested user could not be found.",
          });
          navigate('/users');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProjects();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/users')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Information Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="mb-2">Client Information</CardTitle>
            <div className="flex items-center gap-3 mb-4">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.fullName || user.name || user.email} 
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-500" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p>{user.fullName || user.name || "N/A"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{user.email}</p>
              </div>
              
              {user.contactNumber && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
                  <p>{user.contactNumber}</p>
                </div>
              )}
              
              {user.company && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{user.company}</span>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
                <p>Client</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Projects Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Client Projects</CardTitle>
            <CardDescription>
              Projects owned by {user.fullName || user.name || user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map(project => (
                  <Card 
                    key={project.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {project.imageUrl ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={project.imageUrl} 
                              alt={project.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-primary/20 rounded-md flex items-center justify-center flex-shrink-0">
                            <Folder className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {project.key}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No projects found for this client.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
