import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      return null;
    }
  };

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!active) return;
      setSession(currentSession);

      if (currentSession?.user) {
        setLoading(true);
        const profile = await fetchProfile(currentSession.user.id);

        // Ban check: if the profile is flagged as banned, sign out immediately.
        // This fires on every auth state change (sign-in, tab focus, token refresh)
        // so banned users cannot access the app even with a valid JWT.
        if (profile?.is_banned) {
          await supabase.auth.signOut();
          if (active) {
            setUser(null);
            setSession(null);
            setLoading(false);
          }
          toast.error(
            "Your account has been suspended. Please contact support.",
            { theme: "dark", autoClose: 8000 }
          );
          return;
        }

        if (active) {
          setUser(profile);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (username, email, password) => {
    // Check username uniqueness client-side (pre-validation check)
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (profileCheckError) {
      throw new Error(profileCheckError.message);
    }
    if (existingProfile) {
      throw new Error("Username already taken");
    }

    // Call supabase auth signUp, passing username in user metadata
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (signUpError) {
      throw signUpError;
    }

    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Check ban status immediately — before the caller shows any success UI.
    // If banned, sign out and throw so SignIn.jsx treats it as a failed login.
    const profile = await fetchProfile(data.user.id);
    if (profile?.is_banned) {
      await supabase.auth.signOut();
      throw new Error('Your account has been suspended. Please contact support.');
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
