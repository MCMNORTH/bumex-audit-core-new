
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";

const CreateProject = () => {
  const { addProject } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [lead, setLead] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        
        setUsers(usersData);
        if (usersData.length > 0) {
          setLead(usersData[0].id);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !key) {
      toast({
        title: "Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    const newProject = {
      id: `project-${Date.now()}`,
      name,
      key: key.toUpperCase(),
      description,
      lead,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addProject(newProject);
    
    toast({
      title: "Project created",
      description: `${name} has been created successfully.`
    });
    
    navigate(`/projects/${newProject.id}`);
  };

  // Helper function to get user display name
  const getUserDisplayName = (user: User): string => {
    if (user.name) return user.name;
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return "Unknown User";
  };
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="key">Project Key *</Label>
          <Input
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
            placeholder="PROJ"
            maxLength={5}
            required
            className="uppercase"
          />
          <p className="text-xs text-gray-500">
            A short identifier for your project (max 5 uppercase letters)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description"
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lead">Project Lead</Label>
          <select
            id="lead"
            value={lead}
            onChange={(e) => setLead(e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2"
            disabled={loading}
          >
            {loading ? (
              <option>Loading users...</option>
            ) : users.length > 0 ? (
              users.map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user)}
                </option>
              ))
            ) : (
              <option value="">No users available</option>
            )}
          </select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-jira-blue hover:bg-jira-blue-dark"
          >
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
