import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Risk {
  firebaseId: string;
  id: string;
  description: string;
  cycles_ref: string;
}

interface Response {
  firebaseId: string;
  id: string;
  description: string;
  cycles_ref: string;
}

interface Substantive {
  firebaseId: string;
  id: string;
  description: string;
  cycles_ref: string;
}

interface Cycle {
  firebaseId: string;
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
        firebaseId: doc.id,
        id: doc.data().id || '',
        description: doc.data().description || '',
      }));

      // Fetch all risks, responses, and substantives
      const [risksSnapshot, responsesSnapshot, substantivesSnapshot] = await Promise.all([
        getDocs(collection(db, 'risks')),
        getDocs(collection(db, 'responses')),
        getDocs(collection(db, 'substantives')),
      ]);

      const risks = risksSnapshot.docs.map(doc => ({
        firebaseId: doc.id,
        id: doc.data().id || '',
        description: doc.data().description || '',
        cycles_ref: doc.data().cycles_ref?.id || doc.data().cycles_ref || '',
      }));

      const responses = responsesSnapshot.docs.map(doc => ({
        firebaseId: doc.id,
        id: doc.data().id || '',
        description: doc.data().description || '',
        cycles_ref: doc.data().cycles_ref?.id || doc.data().cycles_ref || '',
      }));

      const substantives = substantivesSnapshot.docs.map(doc => ({
        firebaseId: doc.id,
        id: doc.data().id || '',
        description: doc.data().description || '',
        cycles_ref: doc.data().cycles_ref?.id || doc.data().cycles_ref || '',
      }));

      // Combine cycles with their related data using Firebase document ID
      const enrichedCycles: Cycle[] = cyclesData.map(cycle => ({
        ...cycle,
        risks: risks.filter(risk => risk.cycles_ref === cycle.firebaseId),
        responses: responses.filter(response => response.cycles_ref === cycle.firebaseId),
        substantives: substantives.filter(substantive => substantive.cycles_ref === cycle.firebaseId),
      }));

      setCycles(enrichedCycles);
    } catch (err) {
      console.error('Error fetching cycles data:', err);
      setError('Failed to fetch cycles data');
    } finally {
      setLoading(false);
    }
  };

  const updateCycle = async (firebaseId: string, field: 'id' | 'description', value: string) => {
    await updateDoc(doc(db, 'cycles', firebaseId), { [field]: value });
    await fetchCyclesData(); // Refresh data
  };

  const updateRisk = async (firebaseId: string, field: 'id' | 'description', value: string) => {
    await updateDoc(doc(db, 'risks', firebaseId), { [field]: value });
    await fetchCyclesData(); // Refresh data
  };

  const updateResponse = async (firebaseId: string, field: 'id' | 'description', value: string) => {
    await updateDoc(doc(db, 'responses', firebaseId), { [field]: value });
    await fetchCyclesData(); // Refresh data
  };

  const updateSubstantive = async (firebaseId: string, field: 'id' | 'description', value: string) => {
    await updateDoc(doc(db, 'substantives', firebaseId), { [field]: value });
    await fetchCyclesData(); // Refresh data
  };

  return {
    cycles,
    loading,
    error,
    refetch: fetchCyclesData,
    updateCycle,
    updateRisk,
    updateResponse,
    updateSubstantive,
  };
};