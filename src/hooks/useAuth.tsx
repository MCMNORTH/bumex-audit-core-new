
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SECURITY: Reduced logging for production security
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
            // SECURITY: Only set user if account is approved and not blocked
            if (userData.approved !== false && !userData.blocked) {
              setUser(userData);
              
              // Log successful login
              await addDoc(collection(db, 'logs'), {
                user_id: userData.id,
                action: 'login',
                target_id: userData.id,
                timestamp: new Date(),
                details: 'User logged in'
              });
            } else {
              setUser(null);
              // Account pending approval or blocked - should show appropriate message
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth error'); // SECURITY: Generic error message
          setUser(null);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // SECURITY: Reduced logging for sensitive operations
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // SECURITY: Generic error logging
      console.error('Authentication failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Log logout before signing out
      if (user) {
        await addDoc(collection(db, 'logs'), {
          user_id: user.id,
          action: 'logout',
          target_id: user.id,
          timestamp: new Date(),
          details: 'User logged out'
        });
      }
      
      await signOut(auth);
    } catch (error) {
      // SECURITY: Generic error logging
      console.error('Logout failed');
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
