import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Risk {
  id: string;
  description: string;
  cycles_ref: string;
}

interface Response {
  id: string;
  description: string;
  cycles_ref: string;
}

interface Substantive {
  id: string;
  description: string;
  cycles_ref: string;
}

interface Cycle {
  id: string;
  description: string;
  risks: Risk[];
  responses: Response[];
  substantives: Substantive[];
}

export const useCyclesData = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCyclesData();
  }, []);

  const fetchCyclesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all cycles
      const cyclesSnapshot = await getDocs(collection(db, 'cycles'));
      const cyclesData = cyclesSnapshot.docs.map(doc => ({
        id: doc.id,
        description: doc.data().description || '',
      }));

      // Fetch all risks, responses, and substantives
      const [risksSnapshot, responsesSnapshot, substantivesSnapshot] = await Promise.all([
        getDocs(collection(db, 'risks')),
        getDocs(collection(db, 'responses')),
        getDocs(collection(db, 'substantives')),
      ]);

      const risks = risksSnapshot.docs.map(doc => ({
        id: doc.id,
        description: doc.data().description || '',
        cycles_ref: doc.data().cycles_ref?.id || doc.data().cycles_ref || '',
      }));

      const responses = responsesSnapshot.docs.map(doc => ({
        id: doc.id,
        description: doc.data().description || '',
        cycles_ref: doc.data().cycles_ref?.id || doc.data().cycles_ref || '',
      }));

      const substantives = substantivesSnapshot.docs.map(doc => ({
        id: doc.id,
        description: doc.data().description || '',
        cycles_ref: doc.data().cycles_ref?.id || doc.data().cycles_ref || '',
      }));

      // Combine cycles with their related data
      const enrichedCycles: Cycle[] = cyclesData.map(cycle => ({
        ...cycle,
        risks: risks.filter(risk => risk.cycles_ref === cycle.id),
        responses: responses.filter(response => response.cycles_ref === cycle.id),
        substantives: substantives.filter(substantive => substantive.cycles_ref === cycle.id),
      }));

      setCycles(enrichedCycles);
    } catch (err) {
      console.error('Error fetching cycles data:', err);
      setError('Failed to fetch cycles data');
    } finally {
      setLoading(false);
    }
  };

  return {
    cycles,
    loading,
    error,
    refetch: fetchCyclesData,
  };
};