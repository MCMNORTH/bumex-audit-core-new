
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import ProjectBoard from "./pages/ProjectBoard"; 
import ProjectIssues from "./pages/ProjectIssues";
import CreateIssue from "./pages/CreateIssue";
import IssueDetail from "./pages/IssueDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/projects/:projectId" element={<ProjectBoard />} />
            <Route path="/projects/:projectId/board" element={<ProjectBoard />} />
            <Route path="/projects/:projectId/issues" element={<ProjectIssues />} />
            <Route path="/projects/:projectId/create-issue" element={<CreateIssue />} />
            <Route path="/issues/:issueId" element={<IssueDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
