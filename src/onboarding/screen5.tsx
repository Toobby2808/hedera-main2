import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useHashConnect from "../page/useHashConnect";

import Back from "./shared/back";
import { hederalogo } from "../assets/images";

import {
  RiEyeOffFill,
  RiEyeFill,
  RiUserAddFill,
  RiMailFill,
} from "react-icons/ri";

import { useAuthContext } from "../context/AuthContext";

export default function Screen5() {
  const navigate = useNavigate();
  const {
    isConnected,
    accountId,
    isLoading: isWalletLoading,
    connect,
  } = useHashConnect();
  const { setUser } = useAuthContext();

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateForm = (): string | null => {
    if (!username.trim()) {
      return "Please enter a username";
    }

    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }

    if (!email.trim()) {
      return "Please enter your email address";
    }

    if (!validateEmail(email)) {
      return "Please enter a valid email address";
    }

    if (!password) {
      return "Please enter a password";
    }

    if (!validatePassword(password)) {
      return "Password must be at least 8 characters long";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    if (!agreedToTerms) {
      return "You must agree to the Terms of Service and Privacy Policy";
    }

    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== Starting Registration ===");

    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("Registering, please wait...");

    try {
      // Wake backend (non-blocking)
      fetch("https://team-7-api.onrender.com/", { method: "GET" }).catch(() =>
        console.warn("⚠ Warm-up request failed (ignored)")
      );

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch(
        "https://team-7-api.onrender.com/register/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
            role: "student",
          }),
          signal: controller.signal,
        }
      ).catch((err) => {
        console.error("Network or timeout error:", err);
        throw new Error(
          "Network is slow or unreachable. Please wait a few seconds and try again."
        );
      });

      clearTimeout(timeout);
      console.log("Response status:", response.status);

      // Try to parse JSON once
      let data: any = {};
      try {
        data = await response.json();
      } catch {
        console.warn("Response has no JSON body (possibly cold-start)");
      }

      if (!response.ok) {
        console.error("Registration failed:", data);
        let message =
          data.message ||
          data.error ||
          data.detail ||
          (response.status === 409
            ? "Username already exists"
            : "Registration failed. Please try again.");

        if (data.username) message = "Username already taken.";
        if (data.email) message = "Email already registered.";

        throw new Error(message);
      }

      console.log("✅ Registration successful:", data);

      // Extract user data safely
      const token = data.token || data.access_token || null;
      const userData = data.user || {
        id: data.id || Date.now(),
        username: data.username || username,
        email: data.email || email,
        profile_pic: data.profile_pic || "",
      };

      if (token) localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser({
        id: userData.id,
        name: userData.username,
        email: userData.email,
        profilePic: userData.profile_pic,
        preferences: {},
      });

      console.log("🎉 User saved successfully:", userData);

      navigate("/success", {
        state: {
          message: "Registration successful! Welcome to Hedera.",
          user: userData,
        },
      });
    } catch (err) {
      console.error("Registration error:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log("=== Registration Process Completed ===");
    }
  };

  /* const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
    setError("Google sign-in is not yet implemented");
  }; */

  //  Hedera Wallet Connection Handler

  const handleHederaSignIn = async () => {
    console.log("=== Starting Hedera Wallet Connection ===");
    setError("");

    try {
      // If wallet not yet connected, trigger it
      if (!isConnected) {
        console.log("Connecting to Hedera wallet...");
        await connect();
        return;
      }

      // If already connected, proceed immediately
      if (isConnected && accountId) {
        // Your useHashConnect should expose public key — if not, you can hardcode/test with "string"
        const publicKey =
          window?.hashconnect?.hcData?.pairingData?.accountPublicKey ||
          "string";
        await saveHederaAccountToAPI(accountId, publicKey);
      }
    } catch (err) {
      console.error("Hedera sign-in error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect Hedera wallet"
      );
    }
  };

  // Function to save Hedera account to your API

  const saveHederaAccountToAPI = async (
    hederaAccountId: string,
    publicKey: string
  ) => {
    console.log("🔄 Connecting Hedera wallet to backend...");
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        hedera_account_id: hederaAccountId,
        public_key: publicKey,
        mode: "external",
      };

      console.log("📦 Sending payload:", payload);

      const response = await fetch(
        "https://team-7-api.onrender.com/connect-hedera/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      console.log("📩 API response status:", response.status);
      const data = await response.json().catch(() => ({}));
      console.log("📩 API response body:", data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to connect Hedera wallet"
        );
      }

      // ✅ Extract user and token
      const token = data.token || data.access || null;
      const userData = data.user || {
        id: data.id || Date.now(),
        username: data.username || username,
        email: data.email || email,
      };

      if (token) localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("hederaAccountId", hederaAccountId);
      localStorage.setItem("hederaPublicKey", publicKey);
      localStorage.setItem("hederaConnected", "true");

      // ✅ Update context
      setUser({
        id: userData.id,
        name: userData.username,
        email: userData.email,
        profilePic: userData.profile_pic || "",
        preferences: {},
      });

      // ✅ Success navigation
      navigate("/success", {
        state: {
          message: "Wallet connected successfully 🎉",
          user: userData,
          token,
        },
      });
    } catch (err) {
      console.error("❌ Failed to connect Hedera wallet:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect Hedera wallet"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && accountId && !isLoading) {
      const publicKey =
        window?.hashconnect?.hcData?.pairingData?.accountPublicKey || "string";
      console.log("Wallet connected:", accountId, publicKey);
      saveHederaAccountToAPI(accountId, publicKey);
    }
  }, [isConnected, accountId]);

  const handleLoginClick = () => {
    console.log("Navigating to login screen");
    navigate("/login");
  };

  const formatAccountId = (id: string) => {
    return ` ${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  return (
    <div className="h-screen bg-linear-to-br from-emerald-50 to-teal-50 w-full px-4 py-12 flex flex-col justify-between overflow-y-auto">
      <div>
        <Back
          /* image={backarrow} */
          title="Get Started"
          text="Please kindly enter the username of your choice, a valid email address and password to access your account"
        />
      </div>

      <div className="w-full mb-4">
        <form className="w-full flex flex-col gap-4" onSubmit={handleRegister}>
          {/* Username Input */}
          <div className="relative w-full">
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Username"
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <span className="absolute right-4 text-black/64 top-1/2 -translate-y-1/2">
              <RiUserAddFill size={20} />
            </span>
          </div>

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
            <span className="absolute right-4 text-black/64 top-1/2 -translate-y-1/2">
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

          {/* Confirm Password Input */}
          <div className="relative w-full">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              placeholder="Confirm Password"
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute text-black/64 right-4 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? (
                <RiEyeFill className="w-5 h-5 cursor-pointer" />
              ) : (
                <RiEyeOffFill className="w-5 h-5 cursor-pointer" />
              )}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message for Connected Wallet */}
          {isConnected && accountId && (
            <div className="w-full p-3 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-green-600 text-sm font-medium">
                ✓ Wallet Connected: {formatAccountId(accountId)}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start mb-6 gap-2">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => {
            setAgreedToTerms(e.target.checked);
            setError("");
          }}
          className="w-4 h-4 mt-1 cursor-pointer accent-pri"
          disabled={isLoading}
        />
        <p className="text-sm text-gray-600">
          I agree with Hedera's{" "}
          <span className="text-blue-500 cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-blue-500 cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>
      </div>

      {/* Buttons */}
      <div className="">
        {/* Confirm/Register Button */}
        <button
          onClick={handleRegister}
          disabled={isLoading || isWalletLoading}
          className="bg-[#00C317] mb-2 text-xl w-full p-4 font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
        >
          {isLoading ? "Creating Account..." : "Confirm"}
        </button>

        {/* Hedera Button - NOW FUNCTIONAL */}
        <button
          onClick={handleHederaSignIn}
          disabled={isLoading || isWalletLoading}
          className="bg-white mb-2 flex items-center justify-center gap-4 text-xl w-full p-4 font-semibold text-black rounded-full border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span className="w-6 h-6">
            <img src={hederalogo} alt="Hedera logo" />
          </span>
          {isWalletLoading
            ? "Connecting..."
            : isConnected
            ? `Connected: ${formatAccountId(accountId || "")}`
            : "Continue with Hedera"}
        </button>

        {/* Google Button */}
        {/* <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || isWalletLoading}
          className="bg-white mb-2 flex items-center justify-center gap-4 text-xl w-full p-4 font-semibold text-black rounded-full border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span>
            <img src={goggleicon} alt="Google logo" />
          </span>
          Continue with Google
        </button> */}
      </div>

      {/* Login Link */}
      <div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <span
            onClick={handleLoginClick}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
