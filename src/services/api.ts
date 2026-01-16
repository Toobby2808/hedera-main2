const API_BASE_URL = "https://team-7-api.onrender.com";

// Demo mode for testing without backend
const DEMO_MODE = true;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Demo data
const demoUsers: Record<
  string,
  {
    id: number;
    username: string;
    email: string;
    password: string;
    role: "student" | "driver";
  }
> = {};

const demoDrivers: DriverInfo[] = [
  {
    id: 101,
    username: "john_driver",
    display_name: "John Doe",
    profile_image: "",
    car_model: "Toyota Camry",
    plate_number: "ABC-123",
    seats_available: 4,
    is_available: true,
  },
  {
    id: 102,
    username: "sarah_driver",
    display_name: "Sarah Smith",
    profile_image: "",
    car_model: "Honda Civic",
    plate_number: "XYZ-789",
    seats_available: 3,
    is_available: true,
  },
  {
    id: 103,
    username: "mike_driver",
    display_name: "Mike Johnson",
    profile_image: "",
    car_model: "Ford Focus",
    plate_number: "DEF-456",
    seats_available: 4,
    is_available: true,
  },
];

class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private demoMode = DEMO_MODE;

  setDemoMode(enabled: boolean) {
    this.demoMode = enabled;
  }

  isDemoMode() {
    return this.demoMode;
  }

  setToken(token: string, refresh?: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
    if (refresh) {
      this.refreshToken = refresh;
      localStorage.setItem("refresh_token", refresh);
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      /* const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      }; */
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (this.getToken()) {
        headers["Authorization"] = `Bearer ${this.getToken()}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.detail ||
            `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("API Error:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Auth endpoints
  async register(
    payload: RegisterPayload
  ): Promise<ApiResponse<RegisterResponse>> {
    if (this.demoMode) {
      // Demo registration
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (demoUsers[payload.email]) {
        return { error: "Email already registered" };
      }

      const newUser = {
        id: Date.now(),
        username: payload.username,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      };

      demoUsers[payload.email] = newUser;

      // If registering as driver, add to available drivers
      if (payload.role === "driver") {
        demoDrivers.push({
          id: newUser.id,
          username: newUser.username,
          display_name: newUser.username,
          profile_image: "",
          car_model: "Not set",
          plate_number: "Not set",
          seats_available: 4,
          is_available: true,
        });
      }

      return {
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      };
    }

    return this.request<RegisterResponse>("/register/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    if (this.demoMode) {
      // Demo login
      await new Promise((resolve) => setTimeout(resolve, 800));

      const user = demoUsers[payload.email];

      if (!user || user.password !== payload.password) {
        return { error: "Invalid email or password" };
      }

      const response: LoginResponse = {
        message: "Login successful",
        access: "demo_access_token_" + user.id,
        refresh: "demo_refresh_token_" + user.id,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };

      this.setToken(response.access, response.refresh);
      localStorage.setItem("user_data", JSON.stringify(response.user));

      return { data: response };
    }

    const response = await this.request<LoginResponse>("/login/", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.data) {
      this.setToken(response.data.access, response.data.refresh);
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    if (this.demoMode) {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        return {
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: "",
            last_name: "",
            role: user.role,
            display_name: user.username,
            profile_image: "",
            hedera_account_id: "",
            hedera_public_key: "",
          },
        };
      }
      return { error: "Not authenticated" };
    }
    return this.request<UserProfile>("/profile/");
  }

  async updateProfile(payload: UpdateProfilePayload) {
    if (this.demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userData = localStorage.getItem("user_data");
      if (!userData) return { error: "Not authenticated" };

      const user = JSON.parse(userData);
      const updatedUser = { ...user, ...payload };

      // 🔥 Persist update
      localStorage.setItem("user_data", JSON.stringify(updatedUser));

      return {
        data: {
          ...updatedUser,
          first_name: payload.first_name || "",
          last_name: payload.last_name || "",
          profile_image: "",
          hedera_account_id: "",
          hedera_public_key: "",
        },
      };
    }

    return this.request<UserProfile>("/profile/", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Driver endpoints
  async getAvailableDrivers(): Promise<ApiResponse<DriverInfo[]>> {
    if (this.demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { data: demoDrivers.filter((d) => d.is_available) };
    }
    return this.request<DriverInfo[]>("/ride/drivers/available/");
  }

  // Ride endpoints
  async getRideList(): Promise<ApiResponse<RideListItem[]>> {
    if (this.demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { data: [] };
    }
    return this.request<RideListItem[]>("/ride/lists/");
  }

  async bookRide(
    payload: BookRidePayload
  ): Promise<ApiResponse<BookRideResponse>> {
    if (this.demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const driver = demoDrivers.find((d) => d.id === payload.driver_id);
      return {
        data: {
          ride: {
            id: Date.now(),
            rider: "Demo User",
            driver: driver?.display_name || "Unknown Driver",
            pickup_location: payload.pickup_location,
            dropoff_location: payload.dropoff_location,
            status: "pending",
            created_at: new Date().toISOString(),
            completed_at: null,
          },
          reward: {
            id: Date.now(),
            amount: 5,
            reason: "Ride booked",
            created_at: new Date().toISOString(),
          },
        },
      };
    }
    return this.request<BookRideResponse>("/ride/book/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async trackRide(rideId: number): Promise<ApiResponse<RideTrackingData>> {
    if (this.demoMode) {
      return {
        data: {
          latitude: 6.6745,
          longitude: -1.5716,
          heading: 45,
          speed: 30,
          eta: "5 mins",
        },
      };
    }
    return this.request<RideTrackingData>(`/ride/${rideId}/track/`);
  }

  async monitorRide(rideId: number): Promise<ApiResponse<RideMonitorData>> {
    if (this.demoMode) {
      return {
        data: {
          status: "in_progress",
          driver_location: {
            latitude: 6.6745,
            longitude: -1.5716,
          },
          estimated_arrival: "5 mins",
        },
      };
    }
    return this.request<RideMonitorData>(`/ride/${rideId}/monitor/`);
  }

  async getRideLocations(rideId: number): Promise<ApiResponse<RideLocation[]>> {
    if (this.demoMode) {
      return { data: [] };
    }
    return this.request<RideLocation[]>(`/ride/${rideId}/locations/list/`);
  }

  async updateRideLocation(
    rideId: number,
    location: LocationPayload
  ): Promise<ApiResponse<void>> {
    if (this.demoMode) {
      return { data: undefined };
    }
    return this.request<void>(`/ride/${rideId}/location/`, {
      method: "POST",
      body: JSON.stringify(location),
    });
  }

  async completeRide(rideId: number): Promise<ApiResponse<void>> {
    if (this.demoMode) {
      return { data: undefined };
    }
    return this.request<void>(`/ride/${rideId}/complete/`, {
      method: "POST",
    });
  }

  async getRewards(): Promise<ApiResponse<Reward[]>> {
    if (this.demoMode) {
      return {
        data: [
          {
            id: 1,
            user: "Demo User",
            ride: 1,
            amount: 5,
            reason: "Ride completed",
            hedera_tx_id: "demo_tx_1",
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            user: "Demo User",
            ride: 2,
            amount: 10,
            reason: "Referral bonus",
            hedera_tx_id: "demo_tx_2",
            created_at: new Date().toISOString(),
          },
        ],
      };
    }
    return this.request<Reward[]>("/ride/rewards/");
  }

  async getRideHistory(): Promise<ApiResponse<RideListItem[]>> {
    if (this.demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Demo ride history
      return {
        data: [
          {
            id: 1,
            rider: 1,
            driver: "John Doe",
            pickup_location: "Main Gate",
            dropoff_location: "Library",
            status: "completed",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            completed_at: new Date(Date.now() - 86300000).toISOString(),
          },
          {
            id: 2,
            rider: 1,
            driver: "Sarah Smith",
            pickup_location: "Cafeteria",
            dropoff_location: "Sports Complex",
            status: "completed",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            completed_at: new Date(Date.now() - 172700000).toISOString(),
          },
          {
            id: 3,
            rider: 1,
            driver: "Mike Johnson",
            pickup_location: "Hostel A",
            dropoff_location: "Admin Block",
            status: "cancelled",
            created_at: new Date(Date.now() - 259200000).toISOString(),
            completed_at: null,
          },
        ],
      };
    }
    return this.request<RideListItem[]>("/ride/history/");
  }

  async registerVehicle(
    payload: VehiclePayload
  ): Promise<ApiResponse<VehicleInfo>> {
    if (this.demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const userData = localStorage.getItem("user");
      if (!userData) return { error: "Not authenticated" };

      const user = JSON.parse(userData);

      const driverIndex = demoDrivers.findIndex((d) => d.id === user.id);
      if (driverIndex !== -1) {
        demoDrivers[driverIndex] = {
          ...demoDrivers[driverIndex],
          ...payload,
        };
      }

      localStorage.setItem("vehicle_data", JSON.stringify(payload));
      return { data: payload };
    }

    // 🔥 Token automatically attached here
    return this.request<VehicleInfo>("/driver/vehicle/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getVehicleInfo(): Promise<ApiResponse<VehicleInfo | null>> {
    if (this.demoMode) {
      const vehicleData = localStorage.getItem("vehicle_data");
      if (vehicleData) {
        return { data: JSON.parse(vehicleData) };
      }
      return { data: null };
    }
    return this.request<VehicleInfo>("/driver/vehicle/");
  }
}

// Auth Types
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: "student" | "driver";
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  refresh: string;
  access: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: "student" | "driver";
  };
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "driver";
  display_name: string;
  profile_image: string;
  hedera_account_id: string;
  hedera_public_key: string;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  role?: "student" | "driver";
}

export interface DriverInfo {
  id: number;
  username: string;
  display_name: string;
  profile_image: string;
  car_model?: string;
  plate_number?: string;
  seats_available?: number;
  is_available: boolean;
}

// Ride Types
export interface RideListItem {
  id: number;
  rider: number;
  driver: string;
  pickup_location: string;
  dropoff_location: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  completed_at: string | null;
}

export interface BookRidePayload {
  driver_id: number;
  pickup_location: string;
  dropoff_location: string;
}

export interface BookRideResponse {
  ride: {
    id: number;
    rider: string;
    driver: string;
    pickup_location: string;
    dropoff_location: string;
    status: string;
    created_at: string;
    completed_at: string | null;
  };
  reward: {
    id: number;
    amount: number;
    reason: string;
    created_at: string;
  };
}

export interface RideTrackingData {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  eta: string;
}

export interface RideMonitorData {
  status: string;
  driver_location: {
    latitude: number;
    longitude: number;
  };
  estimated_arrival: string;
}

export interface RideLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
}

export interface Reward {
  id: number;
  user: string;
  ride: number;
  amount: number;
  reason: string;
  hedera_tx_id: string;
  created_at: string;
}

export interface VehiclePayload {
  car_model: string;
  plate_number: string;
  color: string;
  seats_available: number;
}

export interface VehicleInfo {
  car_model: string;
  plate_number: string;
  color: string;
  seats_available: number;
}

export const apiService = new ApiService();
