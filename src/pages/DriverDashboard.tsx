import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  apiService,
  type RideListItem,
  type VehicleInfo,
} from "../services/api";
import { BellIcon, FilterIcon } from "../components/icons/Icons";
import { useNavigate } from "react-router-dom";
import {
  Car,
  MapPin,
  Clock,
  CheckCircle,
  Plus,
  Settings,
  Power,
  DollarSign,
  Star,
  TrendingUp,
  History,
} from "lucide-react";
import UserAvatar from "../components/common/UserAvatar";
import BottomNav from "../components/common/BottomNav";
import NotificationPanel from "../components/common/NotificationPanel";

const DriverDashboard = () => {
  const { user, logout } = useAuthContext();
  const { unreadCount, addNotification } = useNotifications();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);
  const [rides, setRides] = useState<RideListItem[]>([]);
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [activeTab, setActiveTab] = useState<
    "pending" | "active" | "completed"
  >("pending");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadRides();
    loadVehicle();
  }, []);

  const loadRides = async () => {
    const response = await apiService.getRideList();
    if (response.data) {
      setRides(response.data);
    }
  };

  const loadVehicle = async () => {
    const response = await apiService.getVehicleInfo();
    if (response.data) {
      setVehicle(response.data);
    }
  };

  const handleToggleAvailability = () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    addNotification({
      title: newStatus ? "You are now Online" : "You are now Offline",
      message: newStatus
        ? "You can now receive ride requests."
        : "You will not receive any ride requests.",
      type: "info",
    });
  };

  const handleAcceptRide = (rideId: number) => {
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId ? { ...r, status: "in_progress" as const } : r
      )
    );
    addNotification({
      title: "Ride Accepted",
      message: "You have accepted a new ride. Navigate to the pickup location.",
      type: "success",
    });
  };

  const handleDeclineRide = (rideId: number) => {
    setRides((prev) => prev.filter((r) => r.id !== rideId));
    addNotification({
      title: "Ride Declined",
      message: "The ride request has been declined.",
      type: "info",
    });
  };

  const handleCompleteRide = async (rideId: number) => {
    await apiService.completeRide(rideId);
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: "completed" as const,
              completed_at: new Date().toISOString(),
            }
          : r
      )
    );
    addNotification({
      title: "Ride Completed! 🎉",
      message: "Great job! The ride has been marked as completed.",
      type: "success",
    });
  };

  const pendingRides = rides.filter((r) => r.status === "pending");
  const activeRides = rides.filter((r) => r.status === "in_progress");
  const completedRides = rides.filter((r) => r.status === "completed");

  const displayRides =
    activeTab === "pending"
      ? pendingRides
      : activeTab === "active"
      ? activeRides
      : completedRides;

  // Demo earnings
  const todayEarnings = completedRides.length * 150;
  const weeklyEarnings = todayEarnings * 5;
  const rating = 4.8;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-header px-5 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/profile")}>
              <UserAvatar name={user?.username} size="md" />
            </button>
            <div>
              <h2 className="font-bold text-foreground">
                {user?.username || "Driver"}
              </h2>
              <p className="text-sm text-muted-foreground">Driver Account</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Settings className="w-6 h-6 text-foreground" />
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors relative"
            >
              <BellIcon className="w-6 h-6 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isAvailable ? "bg-primary/20" : "bg-muted"
                }`}
              >
                <Power
                  className={`w-6 h-6 ${
                    isAvailable ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {isAvailable ? "You are Online" : "You are Offline"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAvailable
                    ? "Ready to accept rides"
                    : "Not accepting rides"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                isAvailable
                  ? "bg-red-200 text-destructive hover:bg-destructive/20"
                  : "bg-pri text-primary-foreground hover:bg-pri/90"
              }`}
            >
              {isAvailable ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Vehicle Info Card */}
        {!vehicle ? (
          <button
            onClick={() => navigate("/vehicle-registration")}
            className="w-full bg-white rounded-2xl p-4 shadow-card border-2 border-dashed border-pri/30 hover:border-pri transition-colors"
          >
            <div className="flex items-center justify-center gap-3 text-pri">
              <Plus className="w-6 h-6" />
              <span className="font-semibold">Register Your Vehicle</span>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Add your vehicle details to start accepting rides
            </p>
          </button>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Your Vehicle</h3>
              <button
                onClick={() => navigate("/vehicle-registration")}
                className="text-pri text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Car className="w-7 h-7 text-pri" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {vehicle.car_model}
                </p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.plate_number} • {vehicle.color}
                </p>
                <p className="text-xs text-muted-foreground">
                  {vehicle.seats_available} seats available
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-pri" />
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              ₦{todayEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-pri flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +12% from yesterday
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Rating</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{rating}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {completedRides.length * 10}+ rides
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 text-center shadow-card">
            <div className="text-2xl font-bold text-pri">
              {completedRides.length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-card">
            <div className="text-2xl font-bold text-amber-500">
              {pendingRides.length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-card">
            <div className="text-2xl font-bold text-blue-500">
              {activeRides.length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/ride-history")}
            className="flex-1 py-3 bg-white rounded-xl font-medium text-foreground shadow-card flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            <History className="w-5 h-5" />
            Ride History
          </button>
        </div>

        {/* Rides Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">Ride Requests</h3>
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
              <FilterIcon className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "pending"
                  ? "bg-pri text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Pending ({pendingRides.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "active"
                  ? "bg-pri text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Active ({activeRides.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-pri text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Done ({completedRides.length})
            </button>
          </div>

          {/* Ride List */}
          <div className="space-y-3">
            {displayRides.length === 0 ? (
              <div className="text-center py-8 bg-card rounded-xl shadow-card">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">No {activeTab} rides</p>
              </div>
            ) : (
              displayRides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-card rounded-xl p-4 space-y-3 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={`Rider ${ride.rider}`} size="sm" />
                      <span className="font-medium text-foreground">
                        Rider #{ride.rider}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        ride.status === "pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : ride.status === "in_progress"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-pri/10 text-pri"
                      }`}
                    >
                      {ride.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-2 pl-2 border-l-2 border-pri/20 ml-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-pri shrink-0" />
                      <span className="text-foreground truncate">
                        {ride.pickup_location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-foreground truncate">
                        {ride.dropoff_location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(ride.created_at).toLocaleString()}
                  </div>

                  {ride.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleAcceptRide(ride.id)}
                        className="flex-1 py-2 bg-pri text-primary-foreground rounded-full font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRide(ride.id)}
                        className="flex-1 py-2 bg-muted text-muted-foreground rounded-full font-medium"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {ride.status === "in_progress" && (
                    <button
                      onClick={() => handleCompleteRide(ride.id)}
                      className="w-full py-2 bg-pri text-primary-foreground rounded-full font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete Ride
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logout Button */}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default DriverDashboard;
