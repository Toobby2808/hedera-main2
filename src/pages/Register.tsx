import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { ArrowLeft, GraduationCap, Car, Loader2 } from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";
import useHashConnect from "../page/useHashConnect";
import { apiService } from "../services/api";

type UserRole = "student" | "driver";

import Back from "../onboarding/shared/back";
import { hederalogo } from "../assets/images";

import {
  RiEyeOffFill,
  RiEyeFill,
  RiUserAddFill,
  RiMailFill,
} from "react-icons/ri";

export default function Register() {
  const navigate = useNavigate();
  const {
    isConnected,
    accountId,
    isLoading: isWalletLoading,
    connect,
  } = useHashConnect();
  const { setUser, setToken } = useAuthContext();

  // Form step: 'credentials' or 'role'
  const [step, setStep] = useState<"credentials" | "role">("credentials");

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Registration Handler
  /*  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms of service");
      return;
    }

    setIsLoading(true);

    try {
      // Register user without role (role will be slected on next page)
      const response = await fetch(
        "https://team-7-api.onrender.com/register/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, role: "student" }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Registration failed");
      }

      // Auto-login after registration
      const loginResponse = await fetch(
        "https://team-7-api.onrender.com/login/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        // Registration successful but login failed - redirect to login page
        navigate("/login");
        return;
      }

      // Set auth state
      setToken(loginData.access);
      setUser({
        id: loginData.user?.id || data.id,
        username: loginData.user?.username || username,
        email: loginData.user?.email || email,
        profilePic: loginData.user?.profile_pic || "",
        preferences: {},

        // No role yet - will be selected on next page
      });

      // Navigate to role selection page
      navigate("/select-role");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
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

      window.dispatchEvent(new Event("user-updated"));

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

  const handleLoginClick = () => {
    console.log("Navigating to login screen");
    navigate("/login");
  };

  const formatAccountId = (id: string) => {
    return ` ${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms of service");
      return;
    }

    // Move to role selection step
    setStep("role");
  };

  const handleRoleSubmit = async () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Use apiService for registration (includes role)
      const response = await apiService.register({
        username,
        email,
        password,
        role: selectedRole,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Auto-login after registration
      const loginResponse = await apiService.login({ email, password });

      if (loginResponse.error) {
        // Registration successful but login failed - redirect to login page
        navigate("/login");
        return;
      }

      if (loginResponse.data) {
        // Set auth state from login response
        setToken(loginResponse.data.access);

        const userData = {
          id: loginResponse.data.user.id,
          username: loginResponse.data.user.username,
          email: loginResponse.data.user.email,
          role: loginResponse.data.user.role,
        };

        setUser(userData);

        // Also store in user_data for apiService compatibility
        localStorage.setItem("user_data", JSON.stringify(userData));

        // Navigate based on role
        if (selectedRole === "driver") {
          navigate("/vehicle-registration");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep("credentials");
    setError("");
  };

  // Render role selection step
  if (step === "role") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="gradient-header px-5 py-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-primary-foreground">
            Choose Your Role
          </h1>
          <p className="text-primary-foreground/80 mt-2">
            How will you use SMS?
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex-1 px-5 py-6 flex flex-col">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Student Option */}
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                selectedRole === "student"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-white hover:border-primary/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-18 h-18 rounded-xl flex items-center justify-center ${
                    selectedRole === "student"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <GraduationCap className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold mb-1 ${
                      selectedRole === "student"
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    Student
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find drivers, book campus rides, earn rewards, and get to
                    your destination safely.
                  </p>
                </div>
              </div>
            </button>

            {/* Driver Option */}
            <button
              type="button"
              onClick={() => setSelectedRole("driver")}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                selectedRole === "driver"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-white hover:border-primary/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-18 h-18 rounded-xl flex items-center justify-center ${
                    selectedRole === "driver"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Car className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold mb-1 ${
                      selectedRole === "driver"
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    Driver
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Register your vehicle, accept ride requests, and earn money
                    by helping fellow students.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Submit Button */}
          <div className="mt-auto pt-6">
            <PrimaryButton
              onClick={handleRoleSubmit}
              disabled={!selectedRole || isLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-w-md mx-auto bg-linear-to-br from-emerald-50 to-teal-50 w-full px-4 py-12 flex flex-col justify-between overflow-y-auto">
      <div>
        <Back
          /* image={backarrow} */
          title="Get Started"
          text="Please kindly enter the username of your choice, a valid email address and password to access your account"
        />
      </div>

      <div className="w-full mb-4">
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={handleCredentialsSubmit}
        >
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
          onClick={handleCredentialsSubmit}
          disabled={isLoading || isWalletLoading}
          className="bg-[#00C317] mb-2 text-xl w-full p-4 font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
        >
          {isLoading ? "Processing..." : "Continue"}
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
