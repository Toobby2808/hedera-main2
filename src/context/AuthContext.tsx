import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface UserPreferences {
  darkMode?: boolean;
  notifications?: boolean;
  biometrics?: boolean;
  twoFA?: boolean;
  language?: string;
}

interface PaymentMethod {
  id: string;
  cardType: string;
  last4: string;
  expiry: string;
}

interface User {
  id?: string;
  name?: string;
  email?: string;
  profilePic?: string;
  preferences?: UserPreferences;
  paymentMethods?: PaymentMethod[];
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  updateUserPreferences: (updatedPrefs: Partial<UserPreferences>) => void;
  logout: () => void;
  fetchProfile: (authToken?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // ✅ Always use same key name for localStorage
  const TOKEN_KEY = "authToken";
  const USER_KEY = "user";

  // ✅ Fetch latest user profile from backend
  const fetchProfile = async (authToken?: string) => {
    const effectiveToken = authToken || token;
    if (!effectiveToken) return;

    try {
      const response = await fetch("https://team-7-api.onrender.com/profile/", {
        headers: { Authorization: `Bearer ${effectiveToken}` },
      });

      if (!response.ok) {
        console.warn("⚠ Failed to fetch profile:", response.status);
        return;
      }

      const profileData = await response.json();
      console.log("✅ Profile fetched:", profileData);

      setUser(profileData);
      localStorage.setItem(USER_KEY, JSON.stringify(profileData));
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    }
  };

  // ✅ Load saved user & token on startup
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user:", err);
        localStorage.removeItem(USER_KEY);
      }
    }

    if (storedToken) {
      setToken(storedToken);
      // 🔄 Fetch updated user info from backend when app boots
      fetchProfile(storedToken);
    }
  }, []);

  // ✅ Sync user and token with localStorage
  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  // ✅ Auto-apply dark mode preference
  useEffect(() => {
    const darkMode = user?.preferences?.darkMode;
    document.documentElement.classList.toggle("dark", !!darkMode);
  }, [user?.preferences?.darkMode]);

  // ✅ Update user info globally
  const updateUser = (newUserData: Partial<User>) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ Update preferences only
  const updateUserPreferences = (updatedPrefs: Partial<UserPreferences>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...updatedPrefs,
        },
      };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // ✅ Logout clears everything cleanly
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        updateUser,
        updateUserPreferences,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
