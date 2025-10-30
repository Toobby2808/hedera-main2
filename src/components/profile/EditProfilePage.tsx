import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthContext();

  const name = user?.name || "";

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    profilePic: user?.profilePic || "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    updateUser(formData);
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 80, damping: 18 }}
      className="min-h-screen bg-green-50 dark:bg-gray-900 p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className=" rounded-full cursor-pointer "
        >
          <ChevronLeft size={22} className="text-black dark:text-gray-200" />
        </button>
        <h2 className="text-xl font-bold text-black dark:text-gray-100">
          Edit Profile
        </h2>
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center gap-3 mb-8">
        {formData.profilePic ? (
          <img
            src={formData.profilePic}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-3 border-pri dark:border-gray-700"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-pri dark:bg-gray-700 flex items-center justify-center text-white text-3xl font-semibold">
            {name ? name.charAt(0).toUpperCase() : "?"}
          </div>
        )}
        <label className="cursor-pointer text-green-600 font-medium text-sm">
          Change Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-[17px] font-bold text-black/80 dark:text-gray-300 mb-3">
          Personal Information
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="mt-1 w-full border border-pri/80 outline-none focus:outline-none text-base dark:border-gray-700 p-3 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pri"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="mt-1 w-full border border-pri/80 outline-none focus:outline-none text-base dark:border-gray-700 p-3 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pri"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="mt-1 w-full border border-pri/80 outline-none focus:outline-none text-base dark:border-gray-700 p-3 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pri"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State, or Address"
              className="mt-1 w-full border border-pri/80 outline-none focus:outline-none text-base dark:border-gray-700 p-3 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pri"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pri text-white cursor-pointer py-3 rounded-lg hover:bg-green-600 transition font-semibold mt-6"
          >
            Save Changes
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default EditProfilePage;
