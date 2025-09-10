
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Client, User } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { canManageUsers, canManageClients } from "@/utils/permissions";

type ReferenceDataContextType = {
  clients: Client[];
  users: User[];
  loading: boolean;
  reload: () => Promise<void>;
};

const ReferenceDataContext = createContext<ReferenceDataContextType>({
  clients: [],
  users: [],
  loading: true,
  reload: async () => {},
});

export const ReferenceDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const promises = [];
      
      // Only fetch clients if user can manage them
      if (canManageClients(user)) {
        promises.push(getDocs(query(collection(db, "clients"))));
      } else {
        promises.push(Promise.resolve({ docs: [] }));
      }
      
      // Only fetch users if user can manage them
      if (canManageUsers(user)) {
        promises.push(getDocs(query(collection(db, "users"))));
      } else {
        promises.push(Promise.resolve({ docs: [] }));
      }

      const [clientsSnapshot, usersSnapshot] = await Promise.all(promises);
      
      setClients(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Client));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User));
    } catch (err) {
      console.error('Error fetching reference data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <ReferenceDataContext.Provider value={{ clients, users, loading, reload: fetchData }}>
      {children}
    </ReferenceDataContext.Provider>
  );
};

export const useReferenceData = () => useContext(ReferenceDataContext);

