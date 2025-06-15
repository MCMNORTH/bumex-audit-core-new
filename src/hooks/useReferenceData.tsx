
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Client, User } from "@/types";

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
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(query(collection(db, "clients"))),
        getDocs(query(collection(db, "users"))),
      ]);
      setClients(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Client));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User));
    } catch (err) {
      // Optionally handle error, e.g. toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ReferenceDataContext.Provider value={{ clients, users, loading, reload: fetchData }}>
      {children}
    </ReferenceDataContext.Provider>
  );
};

export const useReferenceData = () => useContext(ReferenceDataContext);

