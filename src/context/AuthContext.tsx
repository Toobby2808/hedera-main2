import { createContext, useContext, useState, useEffect } from "react";

import type { ReactNode } from "react";

interface UserPreferences {
  darkMode?: boolean;
  notifications?: boolean;
  biometrics?: boolean;
  twoFA?: boolean;
  language?: string;
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

interface PaymentMethod {
  id: string;
  cardType: string; // e.g. "Visa", "MasterCard"
  last4: string;
  expiry: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  updateUserPreferences: (updatedPrefs: Partial<UserPreferences>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Apply dark mode
  useEffect(() => {
    const darkMode = user?.preferences?.darkMode;
    document.documentElement.classList.toggle("dark", !!darkMode);
  }, [user?.preferences?.darkMode]);

  // Update user fields
  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) =>
      prev ? { ...prev, ...updatedFields } : { ...updatedFields }
    );
  };

  // ✅ Update only preferences
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
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Logout clears all
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, updateUser, updateUserPreferences, logout }}
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
