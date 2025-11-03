import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import OnboardingScreen from "./OnboardingScreen";
import SplashScreen from "./SplashScreen";
import Screen1 from "../assets/images-and-icons/3.svg";
import Screen2 from "../assets/images-and-icons/1.svg";
import Screen3 from "../assets/images-and-icons/2.svg";

const screens = [
  {
    title: "Discover New Moments Within Campus",
    description: "Connect, share, and grow within campus and beyond.",
    image: Screen1,
  },
  {
    title: "Achieve and Earn Rewards",
    description: "Engage in activities and earn Hedera tokens securely.",
    image: Screen2,
  },
  {
    title: "Connect your wallet",
    description:
      "Securely link your crypto wallet to start exploring the decentralized ecosystem.",
    image: Screen3,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // checks if user already saw onboarding
  /* useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("onboarded");
    if (hasSeenOnboarding) navigate("/signup");
  }, [navigate]); */

  const nextScreen = () => {
    if (index === screens.length - 1) {
      navigate("/signup");
    } else {
      setIndex(index + 1);
    }
  };

  const skipOnboarding = () => {
    startLoaderThenNavigate();
  };

  const startLoaderThenNavigate = () => {
    setLoading(true);
    localStorage.setItem("onboarded", "true");
    setTimeout(() => {
      navigate("/signup");
    }, 1500);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SplashScreen onFinish={() => setShowSplash(false)} />
          </motion.div>
        ) : (
          <motion.div
            key={index}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-linear-to-b from-green-50 to-white"
          >
            <motion.button
              onClick={skipOnboarding}
              whileTap={{ scale: 0.97 }}
              className="absolute top-6 right-6 text-gray-600 hover:text-gray-800 font-semibold cursor-pointer "
            >
              Skip
            </motion.button>

            <OnboardingScreen
              title={screens[index].title}
              description={screens[index].description}
              image={screens[index].image}
              onNext={nextScreen}
              current={index}
              total={screens.length}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
