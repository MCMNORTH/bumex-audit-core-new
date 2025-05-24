import { cn } from "@/lib/utils";
import { Project } from "@/types";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { PlusCircle, User, LayoutDashboard, Users, FileText, ClipboardList, Quote } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutButton } from "./LogoutButton";
import { useSidebar } from "@/components/ui/sidebar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useState } from "react";
import { firestore } from "@/lib/firebase";
export const Sidebar = () => {
  const {
    selectedProject,
    setSelectedProject,
    getStarredProjects
  } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser
  } = useAuth();
  const {
    state,
    toggleSidebar
  } = useSidebar();
  const isOpen = state !== "collapsed";
  const [userName, setUserName] = useState("");

  // Fetch user data from Firestore when currentUser changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userData = await firestore.getUser(currentUser.uid);
          if (userData && userData.name) {
            setUserName(userData.name);
          } else {
            // Fallback to email or default display name if name is not available
            setUserName(currentUser?.displayName || currentUser?.email?.split('@')[0] || "User");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName(currentUser?.displayName || currentUser?.email?.split('@')[0] || "User");
        }
      }
    };
    fetchUserData();
  }, [currentUser]);
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    navigate(`/projects/${project.id}`);
  };

  // Use the fetched userName or fall back to email
  const displayName = userName || currentUser?.email?.split('@')[0] || "User";
  const starredProjects = getStarredProjects();

  // Check current route for highlighting active links
  const isRouteActive = (path: string) => {
    return location.pathname === path;
  };
  return <div className={cn("h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300", isOpen ? "w-60" : "w-16")}>
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {isOpen ? <img src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/2dgtj37xrkp6/Logo_wide_transparent.png" alt="OVERCODE" className="h-7" /> : <button onClick={toggleSidebar} className="text-sidebar-foreground p-1 rounded hover:bg-sidebar-accent">
            ▶
          </button>}
        {isOpen && <button onClick={toggleSidebar} className="text-sidebar-foreground p-1 rounded hover:bg-sidebar-accent">
            ◀
          </button>}
      </div>

      
      <div className="p-2">
        <Button onClick={() => navigate('/')} className={cn("w-full justify-start gap-2 mb-2", isRouteActive('/') ? "bg-jira-blue hover:bg-jira-blue-dark" : "bg-transparent hover:bg-sidebar-accent text-sidebar-foreground")}>
          <LayoutDashboard className="h-4 w-4" />
          {isOpen && <span>Dashboard</span>}
        </Button>
        
      </div>

      {/* Quotes Section */}
      <div className="p-2">
        <div className={cn("mb-2 text-xs uppercase font-semibold text-gray-400", !isOpen && "hidden")}>
          Quotes
        </div>
        <div className="mb-4 space-y-2">
          <Button onClick={() => navigate('/quotes')} className={cn("w-full justify-start gap-2", isRouteActive('/quotes') ? "bg-jira-blue hover:bg-jira-blue-dark" : "bg-transparent hover:bg-sidebar-accent text-sidebar-foreground")}>
            <Quote className="h-4 w-4" />
            {isOpen && <span>View Quotes</span>}
          </Button>
          
        </div>
      </div>

      {/* Invoices Section */}
      <div className="p-2">
        <div className={cn("mb-2 text-xs uppercase font-semibold text-gray-400", !isOpen && "hidden")}>
          Invoices
        </div>
        <div className="mb-4 space-y-2">
          
          <Button onClick={() => navigate('/my-invoices')} className={cn("w-full justify-start gap-2", isRouteActive('/my-invoices') ? "bg-jira-blue hover:bg-jira-blue-dark" : "bg-transparent hover:bg-sidebar-accent text-sidebar-foreground")}>
            <ClipboardList className="h-4 w-4" />
            {isOpen && <span>My Invoices</span>}
          </Button>
        </div>
      </div>

      {/* Users Section */}
      

      
      <div className="p-2 overflow-y-auto flex-1">
        <div className={cn("mb-2 text-xs uppercase font-semibold text-gray-400", !isOpen && "hidden")}>
          Starred Projects
        </div>
        <ul className="space-y-1">
          {starredProjects.length > 0 ? starredProjects.map(project => <li key={project.id}>
                <button onClick={() => handleProjectSelect(project)} className={cn("w-full text-left p-2 rounded-md flex items-center gap-2", "hover:bg-sidebar-accent transition-colors", selectedProject?.id === project.id ? "bg-sidebar-accent" : "bg-transparent")}>
                  {project.imageUrl ? <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0">
                      <AspectRatio ratio={1 / 1}>
                        <img src={project.imageUrl} alt={project.name} className="object-cover w-full h-full" />
                      </AspectRatio>
                    </div> : <div className="w-6 h-6 bg-jira-blue-dark rounded-md flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                      {project.key.substring(0, 2).toUpperCase()}
                    </div>}
                  {isOpen && <span>{project.name}</span>}
                </button>
              </li>) : isOpen && <li className="text-sm text-gray-500 p-2">No starred projects</li>}
        </ul>
      </div>
      
      <div className="mt-auto border-t border-sidebar-border">
        <div className="p-2">
          <Button onClick={() => navigate('/profile')} variant="ghost" size="sm" className={cn("w-full justify-start text-muted-foreground hover:text-foreground mb-2", isRouteActive('/profile') ? "bg-sidebar-accent text-sidebar-foreground" : "")}>
            <User className="mr-2 h-4 w-4" />
            {isOpen && <span className="truncate max-w-[180px]" title={displayName}>
                {displayName}
              </span>}
          </Button>
          <LogoutButton />
        </div>
      </div>
    </div>;
};