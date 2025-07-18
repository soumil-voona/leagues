import { useState, useEffect, createContext, useContext } from "react";
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            // Fetch additional user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUser({
                ...firebaseUser,
                ...userDoc.data()
              });
            } else {
              setUser(firebaseUser);
            }
          } catch (firestoreError) {
            // If Firestore is offline, still set the basic user data
            console.warn('Firestore fetch failed:', firestoreError);
            setUser(firebaseUser);
          }
        } else {
          setUser(null);
        }
        setError(null);
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [auth, db]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
    }
  };

  const value = {
    user,
    loading,
    error,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}