import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error.message);
      setProfile(null);
      return;
    }

    setProfile(data);
  };

  const getSubscription = async (currentUser) => {
    if (!currentUser) {
      return null;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading subscription:", error.message);
      return null;
    }

    return data;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser);

        const userSubscription = await getSubscription(currentUser);
        setSubscription(userSubscription);
      }

      setLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser);

        const userSubscription = await getSubscription(currentUser);
        setSubscription(userSubscription);
      } else {
        setProfile(null);
        setSubscription(null);
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  const signup = async ({ fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setUser(null);
    setProfile(null);
    setSubscription(null);
  };

  const value = {
    user,
    profile,
    subscription,
    loading,
    signup,
    login,
    logout,
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