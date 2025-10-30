import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronLeft } from "lucide-react";

import PickupIcon from "../../../assets/home-icons/pickup.svg?react";
import DropoffIcon from "../../../assets/home-icons/dropoff.svg?react";

export default function BookRidePage() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupPos, setPickupPos] = useState<LatLng | null>(null);
  const [dropoffPos, setDropoffPos] = useState<LatLng | null>(null);
  const [selecting, setSelecting] = useState<"pickup" | "dropoff">("pickup");

  const DEFAULT_CENTER: [number, number] = [6.5244, 3.3792]; // Lagos coordinates
  const isReady = pickup.trim() !== "" && dropoff.trim() !== "";

  // --- Map click handler ---
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        if (selecting === "pickup") {
          setPickupPos(e.latlng);
          setPickup(
            `Picked: ${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)}`
          );
        } else {
          setDropoffPos(e.latlng);
          setDropoff(
            `Drop: ${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)}`
          );
        }
      },
    });
    return null;
  }

  const handleContinue = () => {
    if (!isReady) return;
    navigate("/available-rides", {
      state: { pickup, dropoff },
    });
  };

  const popularLocations = [
    "Camp",
    "Isolu",
    "School Gate",
    "Zoo",
    "Accord Estate",
    "Elewe-Eran",
    "Main Library",
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)} className="">
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <span className="font-semibold text-gray-800 text-sm">
          Ride Booking
        </span>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 mb-1">Book Your Ride</h2>
        <p className="text-base text-gray-500 mb-4">
          Safe transport made for you to earn rewards
        </p>

        {/* Inputs */}
        <div className="space-y-3 mb-4">
          {/* Pickup */}
          <div
            className={`flex items-center bg-white border rounded-full px-4 py-3 shadow-sm ${
              selecting === "pickup" ? "border-pri" : "border-grey"
            }`}
            onClick={() => setSelecting("pickup")}
          >
            <input
              type="text"
              placeholder="Pick Up Location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="flex-1 pl-4 text-base outline-none text-gray-700"
            />
            <PickupIcon className="text-red-500 w-5 h-5 mr-3" />
          </div>

          {/* Drop-off */}
          <div
            className={`flex items-center bg-white border rounded-full px-4 py-3 shadow-sm ${
              selecting === "dropoff" ? "border-pri" : "border-grey"
            }`}
            onClick={() => setSelecting("dropoff")}
          >
            <input
              type="text"
              placeholder="Drop Off Location"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="flex-1 pl-5 text-base outline-none  text-gray-700"
            />
            <DropoffIcon className="text-pri w-5 h-5 mr-3" />
          </div>
        </div>

        {/* Map */}
        <div className="bg-white border border-green-200 rounded-2xl overflow-hidden mt-8 mb-6 shadow-sm">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "35vh", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {pickupPos && <Marker position={pickupPos} />}
            {dropoffPos && <Marker position={dropoffPos} />}
          </MapContainer>
        </div>

        {/* Popular locations */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-black">Popular Location</h3>
            <button className="text-xs px-2 py-0.5 bg-pri/20 rounded-2xl text-green-600 font-medium">
              see all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularLocations.map((loc, i) => (
              <button
                key={i}
                onClick={() =>
                  selecting === "pickup" ? setPickup(loc) : setDropoff(loc)
                }
                className="px-3 pt-1 pb-1.5 align-middle flex items-center justify-center rounded-full bg-pri/60 text-white font-medium  text-sm"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Continue button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          disabled={!isReady}
          className={`w-full py-3 my-8 rounded-full font-semibold text-white transition ${
            isReady ? "bg-pri" : "bg-gray-200 border border-pri/40"
          }`}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
