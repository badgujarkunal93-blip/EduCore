import { createContext, useContext, useEffect, useMemo, useState } from "react";
import dataService, { dataMode } from "../services/dataService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState({
    user: null,
    profile: null,
    role: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = dataService.observeAuth((nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const actions = {
    login: (payload) => dataService.login(payload),
    register: (payload) => dataService.register(payload),
    loginWithGoogle: (payload) => dataService.loginWithGoogle(payload),
    logout: () => dataService.logout(),
    refreshProfile: async (userId) => {
      const profile = await dataService.getUserProfile(userId || session.user?.uid);
      setSession((current) => ({
        ...current,
        profile,
        role: profile?.role || current.role,
      }));
    },
  };

  const value = useMemo(
    () => ({
      ...session,
      ...actions,
      loading,
      isAuthenticated: Boolean(session.user),
      isDemoMode: dataMode === "demo",
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
