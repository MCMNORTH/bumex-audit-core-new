
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

const EditProject = () => {
  const { projectId = "" } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projects, updateProject } = useAppStore();
  
  const project = projects.find(p => p.id === projectId);
  
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [lead, setLead] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!project) {
      toast({
        title: "Error",
        description: "Project not found",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setName(project.name);
    setKey(project.key);
    setDescription(project.description || "");
    setLead(project.lead);

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [project, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !key) {
      toast({
        title: "Error",
        description: "Please provide a name and key for the project.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!project) return;

      await updateProject({
        ...project,
        name,
        key,
        description,
        lead,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Project updated",
        description: `"${name}" has been updated successfully.`,
      });

      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    try {
      await updateProject({
        ...project,
        deleted: true,
        updatedAt: new Date().toISOString(),
      });
      
      toast({
        title: "Project deleted",
        description: `"${project.name}" has been deleted.`,
      });
      
      navigate('/');
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = (user: User): string => {
    if (user.name) return user.name;
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return "Unknown User";
  };

  if (!project) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>

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
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            placeholder="Enter project key (e.g., PRJ)"
            maxLength={10}
            required
            className="uppercase"
          />
          <p className="text-xs text-gray-500">
            The project key is used as a prefix for issue keys (e.g., PRJ-123).
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
            className="w-full border border-gray-300 rounded-md p-2 bg-background"
            disabled={loading}
          >
            {loading ? (
              <option>Loading users...</option>
            ) : (
              users.map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user)}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="destructive">
                Delete Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Delete Project
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{project.name}"? This action can't be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteProject}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-jira-blue hover:bg-jira-blue-dark">
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
