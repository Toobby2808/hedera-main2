import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useHashConnect from "../page/useHashConnect";

import Back from "./shared/back";
// import { goggleicon } from "../assets/images";
import { hederalogo } from "../assets/images";

import { RiEyeOffFill, RiEyeFill, RiMailFill } from "react-icons/ri";

import { useAuthContext } from "../context/AuthContext";

export default function Screen6() {
  const navigate = useNavigate();

  const {
    isConnected,
    accountId,
    isLoading: isWalletLoading,
    connect,
    hashConnectData,
  } = useHashConnect();

  const { setUser, setToken, logout } = useAuthContext();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): string | null => {
    if (!email.trim()) {
      return "Please enter your email address";
    }

    if (!validateEmail(email)) {
      return "Please enter a valid email address";
    }

    if (!password) {
      return "Please enter your password";
    }

    return null;
  };

  // LOGIN FUNCTION

  const handleLogin = async () => {
    logout();
    console.log("=== Starting Login ===");

    setError("");
    setSuccess("");

    // clear any old tokens to avoid expired token conflict
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    const validationError = validateForm();
    if (validationError) {
      console.log("Validation failed:", validationError);
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        email: email.trim().toLowerCase(),
        password: password,
      };

      const response = await fetch("https://team-7-api.onrender.com/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let message =
          errorData.detail ||
          errorData.error ||
          "Login failed. Please check your credentials.";
        throw new Error(message);
      }

      const data = await response.json();
      console.log("✅ Login successful:", data);

      // ✅ Safely extract token (backend must return this key)
      const token =
        data.access ||
        data.token ||
        data.access_token ||
        data.authToken ||
        (data.user && data.user.token);

      if (!token) throw new Error("Token not returned from server");

      // ✅ Save token immediately (Context + LocalStorage)
      setToken(token);
      localStorage.setItem("authToken", token);

      // ✅ Fetch fresh profile data
      const profileResponse = await fetch(
        "https://team-7-api.onrender.com/profile/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch user profile after login.");
      }

      const profileData = await profileResponse.json();
      console.log("✅ Fresh profile fetched:", profileData);

      // ✅ Normalize data before saving (to match your dashboard UI)
      const normalizedUser = {
        username: profileData.username || profileData.user?.username || "",
        email: profileData.email || profileData.user?.email || "",
        first_name:
          profileData.first_name || profileData.user?.first_name || "",
        last_name: profileData.last_name || profileData.user?.last_name || "",
        wallet_id: profileData.wallet_id || "",
        ...profileData,
      };

      // ✅ Save properly
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      setSuccess("Login successful! Redirecting...");

      // ✅ Redirect cleanly after short delay
      setTimeout(() => {
        navigate("/dashboard");
        setEmail("");
        setPassword("");
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  /* const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
    setError("Google sign-in is not yet implemented");
  };
 */
  /*  const handleHederaSignIn = async () => {
    console.log("=== Starting Hedera Wallet Sign-In (Login) ===");
    setError("");
    setSuccess("");

    try {
      // 1️⃣ If not connected yet, trigger wallet connection
      if (!isConnected) {
        console.log("Connecting to Hedera wallet...");
        await connect();
        return;
      }

      // 2️⃣ Already connected → Authenticate with API
      if (isConnected && accountId) {
        console.log("Wallet already connected:", accountId);
        await loginWithHederaAccount(accountId);
      }
    } catch (err) {
      console.error("Hedera login error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect Hedera wallet"
      );
    }
  };

  const loginWithHederaAccount = async (hederaAccountId: string) => {
    console.log("Logging in with Hedera account:", hederaAccountId);
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://team-7-api.onrender.com/login-hedera/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hedera_account_id: hederaAccountId }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error("Hedera login failed:", data);
        throw new Error(data.message || "Failed to log in with Hedera wallet");
      }

      const data = await response.json();
      console.log("✅ Hedera login success:", data);

      const token = data.token || data.access_token || null;
      const userData = data.user || {};

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setSuccess("Login successful! Redirecting...");
      }

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Login with Hedera error:", err);
      setError(err instanceof Error ? err.message : "Login with Hedera failed");
    } finally {
      setIsLoading(false);
    }
  }; */

  /* const handleHederaSignIn = async () => {
    console.log("=== Starting Hedera Wallet Sign-In (Login) ===");
    setError("");
    setSuccess("");

    try {
      // 1️⃣ If not connected yet, trigger wallet connection
      if (!isConnected) {
        console.log("Connecting to Hedera wallet...");
        await connect();
        return;
      }

      // 2️⃣ Already connected → Authenticate with API
      if (isConnected && accountId && hashConnectData) {
        console.log("Wallet already connected:", accountId);
        const pubKey = hashConnectData.pairingData?.[0]?.metadata?.publicKey;

        if (!pubKey)
          throw new Error("Public key not found. Please reconnect wallet.");

        await loginWithHederaAccount(accountId, pubKey);
      }
    } catch (err) {
      console.error("Hedera login error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect Hedera wallet"
      );
    }
  }; */

  /* const loginWithHederaAccount = async (
    hederaAccountId: string,
    publicKey: string
  ) => {
    console.log("Logging in with Hedera account:", hederaAccountId, publicKey);
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://team-7-api.onrender.com/connect-hedera/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hedera_account_id: hederaAccountId,
            public_key: publicKey,
          }),
        }
      );

      // ✅ Handle non-JSON responses gracefully
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned non-JSON:", text);
        throw new Error("Unexpected server response (not JSON)");
      }

      if (!response.ok) {
        console.error("Hedera login failed:", data);
        throw new Error(data.message || "Failed to log in with Hedera wallet");
      }

      console.log("✅ Hedera login success:", data);

      const token = data.token || data.access_token || null;
      const userData = data.user || {};

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (err) {
      console.error("Login with Hedera error:", err);
      setError(err instanceof Error ? err.message : "Login with Hedera failed");
    } finally {
      setIsLoading(false);
    }
  }; */

  /*  useEffect(() => {
    if (isConnected && accountId && hashConnectData && !isLoading) {
      console.log("🔗 Hedera wallet detected, proceeding to login:", accountId);

      // Try to extract the public key safely
      const pubKey =
        hashConnectData?.metadata?.publicKey ||
        hashConnectData?.accountInfo?.publicKey ||
        hashConnectData?.accountIds?.[0]?.toString() ||
        null;

      if (!pubKey) {
        console.error(
          "⚠ Public key not found in hashConnectData:",
          hashConnectData
        );
        setError("Public key not found. Please reconnect wallet.");
        return;
      }

      // Login with both accountId and publicKey
      loginWithHederaAccount(accountId, pubKey);
    }
  }, [isConnected, accountId, hashConnectData, isLoading]); */

  const handleHederaSignIn = async () => {
    console.log("=== Starting Hedera Wallet Sign-In (Login) ===");
    setError("");
    setSuccess("");

    try {
      // 1️⃣ Connect wallet if not yet connected
      if (!isConnected) {
        console.log("Connecting to Hedera wallet...");
        await connect();
        return;
      }

      // 2️⃣ Already connected → attempt login
      if (isConnected && accountId && hashConnectData) {
        console.log("Wallet connected:", accountId);

        const pairingData = hashConnectData.pairingData?.[0];
        const pubKey =
          pairingData?.metadata?.publicKey ||
          pairingData?.accountIds?.[0] ||
          null;

        if (!pubKey) {
          throw new Error(
            "Public key not found. Please reconnect your wallet."
          );
        }

        await loginWithHederaAccount(accountId, pubKey);
      }
    } catch (err) {
      console.error("Hedera login error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect Hedera wallet"
      );
    }
  };

  const loginWithHederaAccount = async (
    hederaAccountId: string,
    publicKey: string
  ) => {
    console.log("Logging in with Hedera account:", hederaAccountId, publicKey);
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://team-7-api.onrender.com/connect-hedera/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hedera_account_id: hederaAccountId,
            public_key: publicKey,
          }),
        }
      );

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned non-JSON:", text);
        throw new Error("Unexpected response from server (not JSON)");
      }

      if (!response.ok) {
        console.error("Hedera login failed:", data);
        throw new Error(data.message || "Failed to log in with Hedera wallet");
      }

      console.log("✅ Hedera login success:", data);

      const token = data.token || data.access_token || data.access || null;
      const userData = data.user || {};

      if (!token) {
        throw new Error("No token received from backend after login.");
      }

      // ✅ Save token + user data
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setToken(token);

      setSuccess("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error("Login with Hedera error:", err);
      setError(err instanceof Error ? err.message : "Login with Hedera failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 🧩 No auto-login on connect — only log the event
  useEffect(() => {
    if (isConnected && accountId) {
      console.log("🔗 Hedera wallet connected:", accountId);
    }
  }, [isConnected, accountId]);

  const handleRegisterClick = () => {
    console.log("Register clicked");
    // Navigate to registration screen
    window.location.href = "/signup";
  };

  return (
    <div className="h-screen bg-linear-to-br from-emerald-50 to-teal-50 w-full px-4 py-12 flex flex-col justify-between">
      <div>
        <Back
          /* image={backarrow} */
          title="Welcome Back"
          text="Glad to have you back! Please enter your email and password to continue"
        />
      </div>

      <div className="w-full mb-4">
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          {/* Email Input */}
          <div className="relative w-full">
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Email"
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <span className="absolute text-black/64 right-4 top-1/2 -translate-y-1/2">
              <RiMailFill size={20} />
            </span>
          </div>

          {/* Password Input */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Password"
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 text-black/64 -translate-y-1/2"
            >
              {showPassword ? (
                <RiEyeFill className="w-5 h-5 cursor-pointer" />
              ) : (
                <RiEyeOffFill className="w-5 h-5 cursor-pointer" />
              )}
            </span>
          </div>

          {/* Forgot Password Link */}
          <div className="w-full text-right">
            <span className="text-sm text-blue-500 cursor-pointer hover:underline">
              Forgot Password?
            </span>
          </div>

          {/* Success Message */}
          {success && (
            <div className="w-full p-3 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-green-600 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Buttons */}
      <div className="">
        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="bg-[#00C317] mb-2 text-xl w-full p-4 font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Hedera Button */}
        <button
          onClick={handleHederaSignIn}
          disabled={isLoading || isWalletLoading}
          className="bg-white mb-2 flex items-center justify-center gap-4 text-xl w-full p-4 font-semibold text-black rounded-full border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span className="w-6 h-6">
            <img src={hederalogo} alt="Hedera logo" />
          </span>
          {isWalletLoading
            ? "Connecting ..."
            : isConnected
            ? `Connected: ${accountId?.slice(0, 6)}...${accountId?.slice(-4)}`
            : "Continue with Hedera"}
        </button>

        {/* Google Button */}
        {/* <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="bg-white mb-2 flex items-center justify-center gap-4 text-xl w-full p-4 font-semibold text-black rounded-full border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span>
            <img src={goggleicon} alt="Google logo" />
          </span>
          Continue with Google
        </button> */}
      </div>

      {/* Register Link */}
      <div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <span
            onClick={handleRegisterClick}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
