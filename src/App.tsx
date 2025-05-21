
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import ProjectBoard from "./pages/ProjectBoard"; 
import ProjectIssues from "./pages/ProjectIssues";
import ProjectSprints from "./pages/ProjectSprints";
import ProjectTimeline from "./pages/ProjectTimeline";
import CreateIssue from "./pages/CreateIssue";
import EditIssue from "./pages/EditIssue";
import IssueDetail from "./pages/IssueDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Navigate to="/login" replace />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/projects/:projectId" element={<ProjectBoard />} />
        <Route path="/projects/:projectId/board" element={<ProjectBoard />} />
        <Route path="/projects/:projectId/issues" element={<ProjectIssues />} />
        <Route path="/projects/:projectId/timeline" element={<ProjectTimeline />} />
        <Route path="/projects/:projectId/sprints" element={<ProjectSprints />} />
        <Route path="/projects/:projectId/create-issue" element={<CreateIssue />} />
        <Route path="/projects/:projectId/edit" element={<EditProject />} />
        <Route path="/issues/:issueId" element={<IssueDetail />} />
        <Route path="/issues/:issueId/edit" element={<EditIssue />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
