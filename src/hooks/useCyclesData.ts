import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Cycle {
  id: string;
  description: string;
}

export interface Risk {
  id: string;
  cycles_ref: string;
  description: string;
}

export interface Response {
  id: string;
  cycles_ref: string;
  description: string;
}

export interface Substantive {
  id: string;
  cycles_ref: string;
  description: string;
}

export interface CycleWithDetails extends Cycle {
  risks: Risk[];
  responses: Response[];
  substantives: Substantive[];
}

export const useCyclesData = () => {
  const [cycles, setCycles] = useState<CycleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCyclesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all cycles
      const cyclesSnapshot = await getDocs(collection(db, 'cycles'));
      const cyclesData = cyclesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cycle[];

      // Fetch all risks, responses, and substantives
      const [risksSnapshot, responsesSnapshot, substantivesSnapshot] = await Promise.all([
        getDocs(collection(db, 'risks')),
        getDocs(collection(db, 'responses')),
        getDocs(collection(db, 'substantives'))
      ]);

      const risksData = risksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Risk[];

      const responsesData = responsesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Response[];

      const substantivesData = substantivesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Substantive[];

      // Combine cycles with their related data
      const cyclesWithDetails: CycleWithDetails[] = cyclesData.map(cycle => ({
        ...cycle,
        risks: risksData.filter(risk => risk.cycles_ref === cycle.id),
        responses: responsesData.filter(response => response.cycles_ref === cycle.id),
        substantives: substantivesData.filter(substantive => substantive.cycles_ref === cycle.id)
      }));

      setCycles(cyclesWithDetails);
    } catch (err) {
      console.error('Error fetching cycles data:', err);
      setError('Failed to fetch cycles data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCyclesData();
  }, []);

  return {
    cycles,
    loading,
    error,
    refetch: fetchCyclesData
  };
};