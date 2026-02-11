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
  const [mergedUsers, setMergedUsers] = useState<User[]>([]);

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
  
  // Merge reference users with project-specific users so non-admins can still see team names
  useEffect(() => {
    const updateUsers = async () => {
      try {
        const baseUsers = users || [];
        const haveIds = new Set(baseUsers.map(u => u.id));
        const neededIds = new Set<string>();
        
        if (project) {
          if (project.lead_developer_id) neededIds.add(project.lead_developer_id);
          const ta = project.team_assignments || {} as Project['team_assignments'];
          if (ta?.lead_partner_id) neededIds.add(ta.lead_partner_id);
          (ta?.partner_ids || []).forEach((id: string) => neededIds.add(id));
          (ta?.manager_ids || []).forEach((id: string) => neededIds.add(id));
          (ta?.in_charge_ids || []).forEach((id: string) => neededIds.add(id));
          (ta?.staff_ids || []).forEach((id: string) => neededIds.add(id));
        }
        
        const missingIds = Array.from(neededIds).filter(id => !haveIds.has(id));
        let fetched: User[] = [];
        if (missingIds.length > 0) {
          const snaps = await Promise.all(missingIds.map(async (uid) => {
            const snap = await getDoc(doc(db, 'users', uid));
            return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
          }));
          fetched = (snaps.filter(Boolean) as User[]);
        }
        const map = new Map<string, User>();
        [...baseUsers, ...fetched].forEach(u => map.set(u.id, u));
        setMergedUsers(Array.from(map.values()));
      } catch (e) {
        console.error('Error preparing project users:', e);
        setMergedUsers(users || []);
      }
    };
    updateUsers();
  }, [project, users]);

  return {
    id,
    project,
    clients,
    users: mergedUsers,
    loading: loading || refLoading,
  };
};
