import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiService } from "../services/api";

// Demo mode - set to true to test without backend
const DEMO_MODE = true;

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
  id?: string | number;
  name?: string;
  username?: string;
  email?: string;
  profilePic?: string;
  role?: "student" | "driver";
  preferences?: UserPreferences;
  paymentMethods?: PaymentMethod[];
  [key: string]: any;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  updateUserPreferences: (updatedPrefs: Partial<UserPreferences>) => void;
  logout: () => void;
  fetchProfile: (authToken?: string) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const TOKEN_KEY = "authToken";
  const USER_KEY = "user";

  // Fetch profile from backend using token
  const fetchProfile = async (authToken?: string) => {
    const effectiveToken = authToken || token;
    if (!effectiveToken) return;

    if (DEMO_MODE) {
      // In demo mode, use apiService which has demo data
      const response = await apiService.getProfile();
      if (response.data) {
        const profileData = {
          id: response.data.id,
          username: response.data.username,
          name: response.data.display_name || response.data.username,
          email: response.data.email,
          role: response.data.role,
          profilePic: response.data.profile_image,
        };
        setUser(profileData);
        localStorage.setItem(USER_KEY, JSON.stringify(profileData));
      }
      return;
    }

    try {
      const response = await fetch("https://team-7-api.onrender.com/profile/", {
        headers: { Authorization: `Bearer ${effectiveToken}` },
      });

      if (!response.ok) {
        console.warn("Failed to fetch profile:", response.status);
        if (response.status === 401) logout();
        return;
      }

      const profileData = await response.json();
      console.log("Profile fetched:", profileData);

      // Replace current user with fresh server data
      setUser(profileData);
      localStorage.setItem(USER_KEY, JSON.stringify(profileData));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Restore session from localStorage and re-fetch latest profile
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      const storedUserData = localStorage.getItem("user_data");

      // Try to restore user from either storage key
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      } else if (storedUserData) {
        // Fallback to user_data if user key doesn't exist
        try {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch {
          localStorage.removeItem("user_data");
        }
      }

      if (storedToken) {
        setToken(storedToken);

        if (DEMO_MODE) {
          // In demo mode, just use stored data
          setIsLoading(false);
          return;
        }

        try {
          const res = await fetch("https://team-7-api.onrender.com/profile/", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.status === 401) {
            console.log("Token expired, clearing session");
            logout();
          } else if (res.ok) {
            const profileData = await res.json();
            setUser(profileData);
            localStorage.setItem(USER_KEY, JSON.stringify(profileData));
            // Also sync to user_data for apiService
            localStorage.setItem("user_data", JSON.stringify(profileData));
          }
        } catch (error) {
          console.error("Profile fetch failed:", error);
          // Don't logout on network errors, just use cached user
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Sync user to localStorage (both keys for compatibility)
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem("user_data", JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem("user_data");
    }
  }, [user]);

  // Sync token to localStorage (both keys for compatibility)
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  // Auto-toggle dark mode
  useEffect(() => {
    const darkMode = user?.preferences?.darkMode;
    document.documentElement.classList.toggle("dark", !!darkMode);
  }, [user?.preferences?.darkMode]);

  // Update user locally & sync with backend after edits
  const updateUser = (newUserData: Partial<User>) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
    // Re-fetch from backend to ensure persistence
    if (token) fetchProfile(token);
  };

  // Update preferences
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

  // Logout clears everything
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  // Login function - calls backend API or demo mode
  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    if (DEMO_MODE) {
      // Use apiService demo mode for login
      const response = await apiService.login(credentials);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        const authToken = response.data.access;
        setToken(authToken);

        // Set user from login response
        const userData = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          role: response.data.user.role,
        };
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));

        return { success: true };
      }

      return { success: false, error: "Login failed" };
    }

    try {
      const response = await fetch("https://team-7-api.onrender.com/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            errorData.detail ||
            errorData.message ||
            "Invalid email or password",
        };
      }

      const data = await response.json();
      const authToken = data.access_token || data.token || data.access;

      if (authToken) {
        setToken(authToken);
        await fetchProfile(authToken);
        return { success: true };
      }

      return { success: false, error: "No token received from server" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        setToken,
        updateUser,
        updateUserPreferences,
        logout,
        fetchProfile,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Alias for compatibility
export const useAuthContext = useAuth;
