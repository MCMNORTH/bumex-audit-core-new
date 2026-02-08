
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store";
import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CreateProject = () => {
  const { addProject, users } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [lead, setLead] = useState("");
  const [owner, setOwner] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectImage, setProjectImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        
        setAvailableUsers(usersData);
        if (usersData.length > 0) {
          setLead(usersData[0].id);
          setOwner(usersData[0].id);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);

  // Handle image upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setProjectImage(file);
  };

  const uploadImage = async (projectId: string): Promise<string | null> => {
    if (!projectImage) return null;
    
    try {
      setIsUploading(true);
      const storage = getStorage();
      const imageRef = ref(storage, `project-images/${projectId}`);
      await uploadBytes(imageRef, projectImage);
      const imageUrl = await getDownloadURL(imageRef);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload project image",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !key) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const projectId = `project-${Date.now()}`;
      
      // Upload image if provided
      let imageUrl = null;
      if (projectImage) {
        imageUrl = await uploadImage(projectId);
      }
      
      const newProject = {
        id: projectId,
        name,
        key: key.toUpperCase(),
        description,
        lead,
        owner,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await addProject(newProject);
      
      toast({
        title: "Project created",
        description: `${name} has been created successfully.`,
      });
      
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get user display name
  const getUserDisplayName = (user: User): string => {
    if (user.fullName) return user.fullName;
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
          <Label htmlFor="projectImage">Project Image (Optional)</Label>
          <Input
            id="projectImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="cursor-pointer"
          />
          {previewImage && (
            <div className="mt-2">
              <img 
                src={previewImage} 
                alt="Project preview" 
                className="max-h-40 rounded-md border border-gray-200"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="owner">Project Owner</Label>
          <select
            id="owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 bg-background"
            disabled={loading}
          >
            {loading ? (
              <option>Loading users...</option>
            ) : availableUsers.length > 0 ? (
              availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user)}
                </option>
              ))
            ) : (
              <option value="">No users available</option>
            )}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lead">Project Lead</Label>
          <select
            id="lead"
            value={lead}
            onChange={(e) => setLead(e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 bg-background"
            disabled={loading}
          >
            {loading ? (
              <option>Loading users...</option>
            ) : availableUsers.length > 0 ? (
              availableUsers.map((user) => (
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
            disabled={loading || isUploading}
          >
            {loading || isUploading ? "Creating Project..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
