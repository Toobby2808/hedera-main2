import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { GraduationCap, Car, Loader2, ArrowRight } from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";

type UserRole = "student" | "driver";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthContext();
  const { addNotification } = useNotifications();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);

    try {
      // Update user with selected role
      updateUser({ role: selectedRole });

      // Welcome notification based on role
      addNotification({
        title: "Welcome to SMS! 🎉",
        message:
          selectedRole === "driver"
            ? `Hey ${
                user?.username || user?.name || "there"
              }! You're all set to start offering rides. Complete your vehicle registration to begin earning.`
            : `Hey ${
                user?.username || user?.name || "there"
              }! Your campus journey starts now. Book rides, earn rewards, and explore campus life.`,
        type: "success",
      });

      // Navigate to appropriate dashboard
      if (selectedRole === "driver") {
        navigate("/vehicle-registration");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-header px-5 py-8 text-center">
        <h1 className="text-3xl font-bold text-primary-foreground">
          Almost There!
        </h1>
        <p className="text-primary-foreground/80 mt-2">
          Choose how you want to use SMS
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-8 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            I want to...
          </h2>
          <p className="text-muted-foreground">
            Select your role to personalize your experience
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-4 flex-1">
          <button
            type="button"
            onClick={() => setSelectedRole("student")}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === "student"
                ? "border-pri bg-pri/10"
                : "border-border bg-white hover:border-pri/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  selectedRole === "student"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3
                  className={`text-lg font-bold mb-1 ${
                    selectedRole === "student"
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  Book Rides
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find drivers, book campus rides, read and sell books, earn
                  rewards, and get to your destination safely.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Quick Booking
                  </span>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Earn Tokens
                  </span>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Track Rides
                  </span>
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("driver")}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === "driver"
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  selectedRole === "driver"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Car className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3
                  className={`text-lg font-bold mb-1 ${
                    selectedRole === "driver"
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  Offer Rides
                </h3>
                <p className="text-sm text-muted-foreground">
                  Register your vehicle, accept ride requests, and earn money by
                  helping fellow students.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Earn Income
                  </span>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Flexible Hours
                  </span>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Be Your Boss
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <div className="pt-6">
          <PrimaryButton
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
