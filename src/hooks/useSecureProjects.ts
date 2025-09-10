import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, Client } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { isPrivilegedUser } from '@/utils/permissions';

export const useSecureProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let projectsQuery;
      
      if (isPrivilegedUser(user)) {
        // Privileged users can see all projects
        projectsQuery = query(collection(db, 'projects'));
      } else {
        // Regular users can only see projects they're members of
        projectsQuery = query(
          collection(db, 'projects'),
          where('member_ids', 'array-contains', user.id)
        );
      }

      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate() || new Date(),
          period_start: data.period_start?.toDate() || new Date(),
          period_end: data.period_end?.toDate() || new Date(),
        } as Project;
      });

      // Fetch client information for projects (if user has access)
      const enrichedProjects = await Promise.all(
        projectsData.map(async (project) => {
          if (project.client_id && isPrivilegedUser(user)) {
            try {
              const clientDoc = await getDoc(doc(db, 'clients', project.client_id));
              if (clientDoc.exists()) {
                return {
                  ...project,
                  client_name: clientDoc.data().name,
                  client: clientDoc.data() as Client,
                };
              }
            } catch (error) {
              console.error('Error fetching client:', error);
            }
          }
          return {
            ...project,
            client_name: (project as any).client_name || 'Unknown Client',
          };
        })
      );

      setProjects(enrichedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProjects = () => {
    fetchProjects();
  };

  return {
    projects,
    loading,
    refreshProjects,
  };
};