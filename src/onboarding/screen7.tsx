import { sucessfullicon } from "../assets/images";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function screen7() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthContext();

  const user = location.state?.user;

  const handleGoToDashboard = () => {
    if (user) {
      // ✅ Immediately set user context so dashboard has it
      setUser({
        id: user.id,
        name: user.username,
        email: user.email,
        profilePic: user.profile_pic || "",
        preferences: {},
      });

      // ✅ Also store in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(user));
    }

    // ✅ Navigate to actual dashboard, not login
    navigate("/dashboard");
  };

  return (
    <div className="h-screen bg-[#00C317] w-full flex flex-col justify-between">
      <div className="flex flex-col h-screen items-center justify-between w-full p-6">
        <div className="mt-30">
          {/* Center image - takes remaining space and centers */}
          <div className="">
            <span>
              <img src={sucessfullicon} alt="right-icon" />
            </span>
            <p className="text-2xl text-white">Account Created Successfully</p>
          </div>
        </div>
        <div className="w-full pb-8">
          <button
            onClick={handleGoToDashboard}
            className="bg-white text-[#00C317] text-xl w-full p-4 font-semibold  rounded-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
