import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Cycle {
  id: string;
  description: string;
}

export interface Risk {
  id: string;
  description: string;
  cycles_ref: string;
}

export interface Response {
  id: string;
  description: string;
  cycles_ref: string;
}

export interface Substantive {
  id: string;
  description: string;
  cycles_ref: string;
}

export interface CycleWithData extends Cycle {
  risks: Risk[];
  responses: Response[];
  substantives: Substantive[];
}

export const useCyclesData = () => {
  const [cycles, setCycles] = useState<CycleWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCyclesData = async () => {
      try {
        setLoading(true);
        
        // Fetch all cycles
        const cyclesSnapshot = await getDocs(collection(db, 'cycles'));
        const cyclesData: Cycle[] = cyclesSnapshot.docs.map(doc => ({
          id: doc.id,
          description: doc.data().description || ''
        }));

        // Fetch all risks, responses, and substantives
        const [risksSnapshot, responsesSnapshot, substantivesSnapshot] = await Promise.all([
          getDocs(collection(db, 'risks')),
          getDocs(collection(db, 'responses')),
          getDocs(collection(db, 'substantives'))
        ]);

        const risks: Risk[] = risksSnapshot.docs.map(doc => ({
          id: doc.id,
          description: doc.data().description || '',
          cycles_ref: doc.data().cycles_ref || ''
        }));

        const responses: Response[] = responsesSnapshot.docs.map(doc => ({
          id: doc.id,
          description: doc.data().description || '',
          cycles_ref: doc.data().cycles_ref || ''
        }));

        const substantives: Substantive[] = substantivesSnapshot.docs.map(doc => ({
          id: doc.id,
          description: doc.data().description || '',
          cycles_ref: doc.data().cycles_ref || ''
        }));

        // Combine cycles with their related data
        const cyclesWithData: CycleWithData[] = cyclesData.map(cycle => ({
          ...cycle,
          risks: risks.filter(risk => risk.cycles_ref === cycle.id),
          responses: responses.filter(response => response.cycles_ref === cycle.id),
          substantives: substantives.filter(substantive => substantive.cycles_ref === cycle.id)
        }));

        setCycles(cyclesWithData);
        setError(null);
      } catch (err) {
        console.error('Error fetching cycles data:', err);
        setError('Failed to fetch cycles data');
      } finally {
        setLoading(false);
      }
    };

    fetchCyclesData();
  }, []);

  return { cycles, loading, error };
};