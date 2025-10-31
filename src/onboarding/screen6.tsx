import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backarrow } from "../assets/images";
import Back from "./shared/back";
import { goggleicon } from "../assets/images";
import { hederalogo } from "../assets/images";
import { emailicon } from "../assets/images";
import { passwordicon } from "../assets/images";

import { useAuthContext } from "../context/AuthContext";

export default function Screen6() {
  const navigate = useNavigate();

  const { setUser, setToken } = useAuthContext();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    console.log("=== Starting Login ===");

    setError("");
    setSuccess("");

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
      console.log("Login successful:", data);

      // ✅ Extract token safely
      const token =
        data.access ||
        data.token ||
        data.access_token ||
        data.authToken ||
        (data.user && data.user.token);

      if (!token) throw new Error("No token returned from backend.");

      // ✅ Save token to localStorage + context
      localStorage.setItem("authToken", token);
      setToken(token);

      // ✅ Fetch latest backend profile immediately
      const profileResponse = await fetch(
        "https://team-7-api.onrender.com/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch user profile after login.");
      }

      const profileData = await profileResponse.json();
      console.log("Fetched profile data:", profileData);

      // ✅ Save latest user info in context and localStorage
      setUser(profileData);
      localStorage.setItem("user", JSON.stringify(profileData));

      setSuccess("Login successful! Redirecting...");

      // ✅ Redirect after delay
      setTimeout(() => {
        navigate("/dashboard");
        setEmail("");
        setPassword("");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
    setError("Google sign-in is not yet implemented");
  };

  const handleHederaSignIn = () => {
    console.log("Hedera sign-in clicked");
    setError("Hedera sign-in is not yet implemented");
  };

  const handleRegisterClick = () => {
    console.log("Register clicked");
    // Navigate to registration screen
    window.location.href = "/signup";
  };

  return (
    <div className="h-screen bg-linear-to-br from-emerald-50 to-teal-50 w-full px-4 py-12 flex flex-col justify-between">
      <div>
        <Back
          image={backarrow}
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <img src={emailicon} alt="email icon" className="w-5 h-5" />
            </span>
          </div>

          {/* Password Input */}
          <div className="relative w-full">
            <input
              type="password"
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <img src={passwordicon} alt="password icon" className="w-5 h-5" />
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
          disabled={isLoading}
          className="bg-white mb-2 flex items-center justify-center gap-4 text-xl w-full p-4 font-semibold text-black rounded-full border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span className="w-6 h-6">
            <img src={hederalogo} alt="Hedera logo" />
          </span>
          Continue with Hedera
        </button>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="bg-white mb-2 flex items-center justify-center gap-4 text-xl w-full p-4 font-semibold text-black rounded-full border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span>
            <img src={goggleicon} alt="Google logo" />
          </span>
          Continue with Google
        </button>
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
