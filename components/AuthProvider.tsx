"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import type { UserProfile } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isModerator: boolean;
  loading: boolean;
  authError: string;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isModerator: false,
  loading: true,
  authError: "",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isActive) {
        return;
      }

      setLoading(true);
      setUser(firebaseUser);
      setProfile(null);
      setAuthError("");

      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(firebaseUser.uid);

        if (!isActive) {
          return;
        }

        setProfile(userProfile);
      } catch (profileError) {
        if (!isActive) {
          return;
        }

        setAuthError(getErrorMessage(profileError));
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const isModerator = profile?.role === "moderator";

  return (
    <AuthContext.Provider
      value={{ user, profile, isModerator, loading, authError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
