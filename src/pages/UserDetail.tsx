
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { firestore } from "@/lib/firebase";
import { User, Project } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Building, Calendar } from "lucide-react";
import { format } from "date-fns";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const UserDetail = () => {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        // Fetch user data
        const userDoc = await firestore.getDoc(firestore.doc(firestore.usersCollection, userId));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
          
          // Fetch user's projects
          const projectsQuery = firestore.query(
            firestore.projectsCollection,
            firestore.where("owner", "==", userId)
          );
          const projectsSnapshot = await firestore.getDocs(projectsQuery);
          const userProjects = projectsSnapshot.docs
            .map(doc => doc.data() as Project)
            .filter(project => project && !project.deleted); // Fix the error by filtering only if project exists
          
          setProjects(userProjects);
        } else {
          console.error("User not found");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg mb-4">User not found</p>
        <Button onClick={() => navigate("/users")}>Back to Users</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => navigate("/users")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
      </Button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 p-6 flex items-center border-b">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mr-6 flex-shrink-0">
            {user.avatarUrl ? (
              <AspectRatio ratio={1/1}>
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-400">
                {(user.fullName || user.name || user.email || "").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {user.fullName || user.name || user.email?.split('@')[0]}
            </h1>
            <p className="text-gray-500">Client</p>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <span>{user.email}</span>
            </div>
            {user.contactNumber && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span>{user.contactNumber}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-3" />
                <span>{user.company}</span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <span>Joined on {format(new Date(user.createdAt), "MMMM dd, yyyy")}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t">
          <h2 className="text-lg font-semibold mb-4">Projects ({projects.length})</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded">
              <p className="text-gray-500">This client does not have any projects yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className="border rounded-md p-4 hover:border-primary cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-md bg-[#459ed7] flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {project.key.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 className="font-medium">{project.name}</h3>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
