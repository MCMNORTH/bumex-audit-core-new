
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { User, Project } from "@/types";
import { db, firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        // Get user document
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
          
          // Get all projects where this user is the owner
          const projectsData = await firestore.getAllProjects() as Project[];
          const userProjects = projectsData.filter(project => 
            project.owner === userId && !project.deleted
          );
          setProjects(userProjects);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-6">
        <p>User not found</p>
        <Button onClick={() => navigate('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600 mr-4">
            {user.name && user.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-gray-500">Contact</p>
            <p>{user.contactNumber || "No contact number"}</p>
          </div>
          <div>
            <p className="text-gray-500">Company</p>
            <p>{user.company || "No company"}</p>
          </div>
          <div>
            <p className="text-gray-500">Full Name</p>
            <p>{user.fullName || "No full name"}</p>
          </div>
          <div>
            <p className="text-gray-500">User Type</p>
            <p className="capitalize">{user.userType || "No user type"}</p>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      
      {projects.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No projects found for this user</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`/projects/${project.id}`)}>
              <CardHeader className="pb-2">
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.key}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {project.description || "No description"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDetail;
