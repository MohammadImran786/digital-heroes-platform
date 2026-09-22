import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getMemberDashboard } from "../services/memberService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const data = await getMemberDashboard();
          setProfile(data.profile);
          setSubscription(data.subscription);
        } catch (error) {
          console.error("Member data loading error:", error.message);
          setSubscription(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const data = await getMemberDashboard();
          setProfile(data.profile);
          setSubscription(data.subscription);
        } catch (error) {
          console.error("Member data loading error:", error.message);
          setProfile(null);
          setSubscription(null);
        }
      } else {
        setProfile(null);
        setSubscription(null);
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    subscription,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}