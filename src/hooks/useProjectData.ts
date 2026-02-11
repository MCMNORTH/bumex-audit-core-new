
import { useEffect } from 'react';
import { useProjectFetch } from './useProjectFetch';
import { useProjectForm } from './useProjectForm';

export const useProjectData = () => {
  const { id, project, clients, users, loading } = useProjectFetch();
  const {
    formData,
    saving,
    handleSave,
    handleAssignmentChange,
    handleFormDataChange,
    handleReview,
    handleUnreview,
    handleSignOff,
    handleUnsign,
    initializeFormData,
    setFormData
  } = useProjectForm(project, id);

  // Initialize form data when project is loaded
  useEffect(() => {
    if (project) {
      initializeFormData(project);
    }
  }, [project]);

  return {
    id,
    project,
    clients,
    users,
    loading,
    saving,
    formData,
    handleSave,
    handleAssignmentChange,
    handleFormDataChange,
    handleReview,
    handleUnreview,
    handleSignOff,
    handleUnsign,
    setFormData
  };
};
