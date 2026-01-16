import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  FileText,
  Palette,
  Users,
  Loader2,
} from "lucide-react";
import { apiService } from "../services/api";
import { useNotifications } from "../context/NotificationContext";
import PrimaryButton from "../components/common/PrimaryButton";

const VehicleRegistration = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    car_model: "",
    plate_number: "",
    color: "",
    seats_available: "4",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.car_model || !formData.plate_number || !formData.color) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.registerVehicle({
        car_model: formData.car_model,
        plate_number: formData.plate_number.toUpperCase(),
        color: formData.color,
        seats_available: parseInt(formData.seats_available),
      });

      if (response.error) {
        setError(response.error);
      } else {
        addNotification({
          title: "Vehicle Registered",
          message: `Your ${formData.car_model} has been successfully registered.`,
          type: "success",
        });
        navigate("/driver");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-header px-5 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            Register Vehicle
          </h1>
        </div>

        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center mx-auto mb-3">
            <Car className="w-10 h-10 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Add your vehicle details to start accepting rides
          </p>
        </div>
      </div>

      <div className="px-5 py-4 -mt-4">
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl p-5 space-y-5 shadow-card"
        >
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Car Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Car Model *
            </label>
            <div className="relative">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={formData.car_model}
                onChange={(e) =>
                  setFormData({ ...formData, car_model: e.target.value })
                }
                placeholder="e.g., Toyota Camry 2020"
                className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Plate Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Plate Number *
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={formData.plate_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plate_number: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., ABC-123-XY"
                className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all uppercase"
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Vehicle Color *
            </label>
            <div className="relative">
              <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="e.g., Black, White, Silver"
                className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Seats Available */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Available Seats
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={formData.seats_available}
                onChange={(e) =>
                  setFormData({ ...formData, seats_available: e.target.value })
                }
                className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
              >
                <option value="1">1 Seat</option>
                <option value="2">2 Seats</option>
                <option value="3">3 Seats</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
                <option value="6">6 Seats</option>
              </select>
            </div>
          </div>

          <PrimaryButton
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Vehicle"
            )}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default VehicleRegistration;
