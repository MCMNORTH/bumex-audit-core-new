import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/Layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import MyProjects from "./pages/MyProjects";
import ProjectEdit from "./pages/ProjectEdit";
import Users from "./pages/Users";
import Logs from "./pages/Logs";
import Cycles from "./pages/Cycles";
import AppControlPage from "./pages/AppControl";
import NotFound from "./pages/NotFound";
import { ReferenceDataProvider } from "./hooks/useReferenceData";
import { TranslationProvider } from "./contexts/TranslationContext";
// Initialize Firebase with App Check after React is ready
import "./lib/firebase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TranslationProvider>
        <AuthProvider>
          <ReferenceDataProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute requiredRoles={['dev', 'admin', 'semi-admin']}>
                    <Clients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-projects"
                element={
                  <ProtectedRoute>
                    <MyProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute requiredRoles={['dev', 'admin', 'semi-admin']}>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRoles={['dev', 'admin']}>
                    <MainLayout>
                      <Users />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/logs"
                element={
                  <ProtectedRoute requiredRoles={['dev', 'admin']}>
                    <Logs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cycles"
                element={
                  <ProtectedRoute requiredRoles={['dev', 'admin', 'semi-admin']}>
                    <Cycles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app-control"
                element={
                  <ProtectedRoute requiredRoles={['dev']}>
                    <AppControlPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ReferenceDataProvider>
      </AuthProvider>
    </TranslationProvider>
  </TooltipProvider>
</QueryClientProvider>
);

export default App;
