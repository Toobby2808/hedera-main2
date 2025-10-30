import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useHashConnect from '../page/useHashConnect';

import { backarrow } from "../assets/images";
import Back from "./shared/back";
import { goggleicon } from "../assets/images";
import { hederalogo } from "../assets/images";
import { emailicon } from "../assets/images";
import { usericon } from "../assets/images";
import { passwordicon } from "../assets/images";

export default function Screen5() {
    const navigate = useNavigate();
    const { isConnected, accountId, isLoading: isWalletLoading, connect } = useHashConnect();

    // Form state
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);

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

    const handleRegister = async () => {
        console.log("=== Starting Registration ===");

        setError("");

        const validationError = validateForm();
        if (validationError) {
            console.log("Validation failed:", validationError);
            setError(validationError);
            return;
        }

        console.log("Form validation passed");
        setIsLoading(true);

        try {
            const response = await fetch("https://team-7-api.onrender.com/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email.trim().toLowerCase(),
                    password: password,
                    role: "student",
                }),
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                console.error("Registration failed with status:", response.status);

                let errorMessage = "Registration failed. Please try again.";

                try {
                    const errorData = await response.json();
                    console.error("Error response:", errorData);

                    errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;

                    if (errorData.username) {
                        errorMessage = "Username already taken. Please choose another.";
                    } else if (errorData.email) {
                        errorMessage = "Email already registered. Please login instead.";
                    }
                } catch (parseError) {
                    console.error("Could not parse error response");
                }

                if (response.status === 400) {
                    throw new Error(errorMessage || "Invalid registration data. Please check your information.");
                } else if (response.status === 409) {
                    throw new Error("Account already exists. Please login instead.");
                } else if (response.status === 422) {
                    throw new Error("Invalid data format. Please check your entries.");
                } else if (response.status >= 500) {
                    throw new Error("Server error. Please try again later.");
                } else {
                    throw new Error(errorMessage);
                }
            }

            const data = await response.json();
            console.log("Registration successful! Response:", data);

            if (data.username) {
                localStorage.setItem("username", data.username);
                console.log("Stored username:", data.username);
            }

            if (data.email) {
                localStorage.setItem("userEmail", data.email);
                console.log("Stored email:", data.email);
            }

            if (data.role) {
                localStorage.setItem("userRole", data.role);
                console.log("Stored role:", data.role);
            }

            localStorage.setItem("user", JSON.stringify(data));

            console.log("Navigating to welcome screen...");

            navigate("/welcome", {
                state: {
                    message: "Registration successful! Welcome to Hedera.",
                    username: data.username,
                }
            });

        } catch (err) {
            console.error("Registration error:", err);

            if (err instanceof TypeError && err.message.includes("fetch")) {
                setError("Network error. Please check your internet connection.");
            } else {
                setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
            console.log("=== Registration Process Completed ===");
        }
    };

    const handleGoogleSignIn = () => {
        console.log("Google sign-in clicked");
        setError("Google sign-in is not yet implemented");
    };

    // NEW: Hedera Wallet Connection Handler
    const handleHederaSignIn = async () => {
        console.log("=== Starting Hedera Wallet Sign-In ===");
        setError("");

        try {
            // Step 1: Connect wallet
            if (!isConnected) {
                console.log("Connecting to Hedera wallet...");
                await connect();
                // Wait for connection to complete and accountId to be available
                // The connection state will update and we'll handle it in the effect
                return;
            }

            // Step 2: If already connected, proceed with API call
            if (isConnected && accountId) {
                await saveHederaAccountToAPI(accountId);
            }

        } catch (err) {
            console.error("Hedera sign-in error:", err);
            setError(err instanceof Error ? err.message : "Failed to connect Hedera wallet");
        }
    };

    // NEW: Function to save Hedera account to your API
    const saveHederaAccountToAPI = async (hederaAccountId: string) => {
        console.log("Saving Hedera account to API...");
        setIsLoading(true);

        try {
            const response = await fetch("https://team-7-api.onrender.com/connect-hedera/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    hedera_account_id: hederaAccountId,
                    public_key: "string", // Replace with actual public key if available
                }),
            });

            console.log("Hedera API response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Hedera API error:", errorData);
                throw new Error(errorData.message || "Failed to save Hedera account");
            }

            const data = await response.json();
            console.log("Hedera account saved successfully:", data);

            // Store Hedera account info
            localStorage.setItem("hederaAccountId", hederaAccountId);
            localStorage.setItem("hederaConnected", "true");

            // Navigate to screen7
            navigate("/success", {
                state: {
                    message: "Hedera wallet connected successfully!",
                    hederaAccountId: hederaAccountId,
                }
            });

        } catch (err) {
            console.error("Failed to save Hedera account:", err);
            setError(err instanceof Error ? err.message : "Failed to save Hedera account");
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Effect to handle connection completion
    useEffect(() => {
        if (isConnected && accountId && !isLoading) {
            console.log("Wallet connected with account:", accountId);
            // Automatically save to API once connected
            saveHederaAccountToAPI(accountId);
        }
    }, [isConnected, accountId]);

    const handleLoginClick = () => {
        console.log("Navigating to login screen");
        navigate("/login");
    };

    const formatAccountId = (id: string) => {
        return `${id.slice(0, 6)}...${id.slice(-4)}`;
    };

    return (
        <div className="h-screen bg-gradient-to-br from-emerald-50 to-teal-50 w-full px-4 py-12 flex flex-col justify-between overflow-y-auto">
            <div>
                <Back
                    image={backarrow}
                    title="Get Started"
                    text="Please kindly enter the username of your choice, a valid email address and password to access your account"
                />
            </div>

            <div className="w-full mb-4">
                <form
                    className="w-full flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleRegister();
                    }}
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
                        <span className="absolute right-4 top-1/2 -translate-y-1/2">
                            <img src={usericon} alt="user icon" className="w-5 h-5" />
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
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2">
                            <img src={passwordicon} alt="password icon" className="w-5 h-5" />
                        </span>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative w-full">
                        <input
                            type="password"
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
                        <span className="absolute right-4 top-1/2 -translate-y-1/2">
                            <img src={passwordicon} alt="password icon" className="w-5 h-5" />
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
                    className="w-4 h-4 mt-1 cursor-pointer accent-green-500"
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
                    {isWalletLoading ? "Connecting..." : isConnected ? `Connected: ${formatAccountId(accountId || '')}` : "Continue with Hedera"}
                </button>

                {/* Google Button */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isWalletLoading}
                    className="bg-white mb-2 flex items-center justify-center gap-4 text-xl w-full p-4 font-semibold text-black rounded-full border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <span>
                        <img src={goggleicon} alt="Google logo" />
                    </span>
                    Continue with Google
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