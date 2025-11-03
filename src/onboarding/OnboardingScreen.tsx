import { motion } from "framer-motion";

interface Props {
  title: string;
  description: string;
  image: string;
  onNext: () => void;
  current: number;
  total: number;
}

export default function OnboardingScreen({
  title,
  description,
  image,
  onNext,
  current,
  total,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-between h-full text-center">
      {/* Title + Description */}
      <div className="px-6 mt-10">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-black/68 mt-2 text-[17px] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Top Illustration */}
      <motion.img
        src={image}
        alt={title}
        className="w-[96%] my-15 object-contain"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      <div className="w-full mt-auto">
        {/* Progress Dots */}
        <div className="flex mb-6  items-center justify-center  space-x-2">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i === current ? "bg-green-500 scale-110" : "bg-gray-300"
              } transition-all`}
            />
          ))}
        </div>

        {/* Next Button */}
        <motion.button
          onClick={onNext}
          whileTap={{ scale: 0.97 }}
          className="bg-pri cursor-pointer hover:bg-green-600 text-white text-lg w-11/12 py-3 mb-10 rounded-full font-semibold shadow-md transition"
        >
          {current === total - 1 ? "Get Started" : "Next"}
        </motion.button>
      </div>
    </div>
  );
}
