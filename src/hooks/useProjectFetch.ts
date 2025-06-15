import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, getDocs, collection, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, Client, User } from '@/types';
import { useReferenceData } from "./useReferenceData";

export const useProjectFetch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use context instead of local fetch
  const { clients, users, loading: refLoading } = useReferenceData();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && !refLoading) {
      fetchProjectData();
    }
    // eslint-disable-next-line
  }, [id, refLoading]);

  const fetchProjectData = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', id!));
      if (!projectDoc.exists()) {
        toast({
          title: 'Error',
          description: 'Project not found',
          variant: 'destructive',
        });
        navigate('/projects');
        return;
      }
      const projectData = {
        id: projectDoc.id,
        ...projectDoc.data(),
        created_at: projectDoc.data().created_at?.toDate() || new Date(),
        period_start: projectDoc.data().period_start?.toDate() || new Date(),
        period_end: projectDoc.data().period_end?.toDate() || new Date(),
      } as Project;

      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    id,
    project,
    clients,
    users,
    loading: loading || refLoading,
  };
};
