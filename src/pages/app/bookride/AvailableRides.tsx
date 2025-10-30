import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Rider1 from "../../../assets/home-icons/rider1.svg";
import Rider2 from "../../../assets/home-icons/rider2.svg";
import Pickup from "../../../assets/home-icons/pickup.svg?react";
import DropOff from "../../../assets/home-icons/dropoff.svg?react";

interface Ride {
  id: number;
  name: string;
  car: string;
  plate: string;
  price: string;
  eta: string;
  img: string;
  badge: string;
}

interface LocationState {
  pickup?: string;
  dropoff?: string;
}

const AvailableRides = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup = "Location A", dropoff = "Location B" } =
    (location.state as LocationState) || {};

  const rides: Ride[] = [
    {
      id: 1,
      name: "First Driver",
      car: "Honda Accord",
      plate: "ABJ-123-GW",
      price: "$20",
      eta: "3 mins",
      img: Rider1,
      badge: "text-pri",
    },
    {
      id: 2,
      name: "Second Driver",
      car: "Toyota Camry",
      plate: "IKJ-345-AG",
      price: "$20",
      eta: "7 mins",
      img: Rider2,
      badge: "text-[#1976d2]",
    },
    {
      id: 3,
      name: "Better Driver",
      car: "Toyota Camry",
      plate: "IKJ-345-AG",
      price: "$15",
      eta: "5 mins",
      img: Rider1,
      badge: "text-[#641200]",
    },
    {
      id: 4,
      name: "Straight Driver",
      car: "Honda Accord",
      plate: "ABJ-123-GW",
      price: "$17",
      eta: "1 min",
      img: Rider2,
      badge: "text-pri",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-linear-to-b from-green-50 to-white"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-6">
        <button onClick={() => navigate(-1)} className="">
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <span className="font-semibold text-gray-800 text-sm">
          Ride Booking
        </span>
      </div>

      {/* Locations summary */}
      <div className="mx-4 mb-5 bg-white border border-pri/60 shadow rounded-2xl p-4 ">
        <div className="flex items-center">
          <div className="flex flex-col items-center justify-center">
            <Pickup className="w-9 h-10" />
          </div>
          <div className="flex-1 text-center text-gray-800 text-sm">
            <div>5 km</div>
            <div className="w-full px-2 my-0.5">
              <div className="w-full h-px bg-linear-to-r rounded-md from-[#ff3333]/64 via-[#a68d01]/64 to-pri "></div>
            </div>
            <div>3 minutes</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <DropOff className=" w-9 h-10" />
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <div className="font-semibold text-gray-800">{pickup}</div>
          <div className="font-semibold text-gray-800">{dropoff}</div>
        </div>
      </div>

      {/* Rides List */}
      <div className="px-4">
        <h3 className="font-bold text-black mb-3 text-xl">Available Rides</h3>
        <div className="space-y-4">
          {rides.map((ride) => (
            <motion.div
              key={ride.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl shadow-sm p-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={ride.img} alt={ride.name} className="w-13" />
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-black">
                        {ride.name}
                      </div>
                      <RiVerifiedBadgeFill size={18} className={ride.badge} />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-900">{ride.car}</div>
                      <div className="text-xs bg-[#c3c3c3] text-black font-medium inline-block mt-1 px-2 py-0.5 rounded">
                        {ride.plate}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">
                    {ride.price}
                  </div>
                  <div className="text-xs text-gray-500">{ride.eta} away</div>
                </div>
              </div>
              <button
                className="mt-3 w-full bg-pri font-semibold text-white py-2.5 rounded-xl text-[15px]"
                onClick={() =>
                  navigate("/ride-details", {
                    state: { ride, pickup, dropoff },
                  })
                }
              >
                Select Ride
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AvailableRides;
