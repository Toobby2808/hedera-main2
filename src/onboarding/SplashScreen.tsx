import { useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "../assets/images-and-icons/hedera23.svg";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen w-full bg-linear-to-r from-[#00A651] via-[#6DCB00] to-[#ffeb3b] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* App Logo Animation */}
      <motion.img
        src={Logo}
        alt="SMS Logo"
        className="w-40 h-40 drop-shadow-2xl"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* App Name  */}
      <motion.h1
        className="text-2xl font-bold tracking-wide drop-shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Student Mobility System
      </motion.h1>

      {/* Animated Loader Dots */}
      <motion.div
        className="flex mt-6 space-x-2"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2.5 h-2.5 bg-white rounded-full"
            variants={{
              hidden: { opacity: 0.3, y: 0 },
              visible: {
                opacity: [0.3, 1, 0.3],
                y: [-4, 0, -4],
                transition: {
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              },
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
