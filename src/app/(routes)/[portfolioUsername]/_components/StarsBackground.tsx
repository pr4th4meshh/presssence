// components/GalaxyBackground.tsx

import { motion } from "framer-motion";

// Generate a random number between a given range
const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Create a random star with size, position, opacity, and movement
const Star = () => {
  const size = getRandomNumber(1, 3); // Random size between 1 and 3
  const opacity = getRandomNumber(0.2, 1); // Random opacity between 0.2 and 1
  const positionX = getRandomNumber(0, 100); // Random position for X-axis (in %)
  const positionY = getRandomNumber(0, 100); // Random position for Y-axis (in %)
  
  // Animation properties for moving stars
  const moveX = getRandomNumber(-100, 100);
  const moveY = getRandomNumber(-100, 100);

  return (
    <motion.div
      className="absolute rounded-full dark:bg-white bg-black"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${positionX}%`,
        top: `${positionY}%`,
        opacity: opacity,
      }}
      animate={{
        // Create a movement animation for stars, moving them around the screen
        x: [positionX, positionX + moveX, positionX], 
        y: [positionY, positionY + moveY, positionY],
        opacity: [opacity, 0.3, opacity],
        scale: [1, 1.5, 1],
      }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        duration: 20, // Random duration for smooth motion
        ease: "easeInOut",
        delay: getRandomNumber(0, 1), // Random delay before starting
      }}
    />
  );
};

interface GalaxyBackgroundProps {
  children: React.ReactNode;
}

const GalaxyBackground = ({ children }: GalaxyBackgroundProps) => {
  return (
    <div className="relative dark:bg-black bg-light min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Galaxy stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 200 }).map((_, index) => (
          <Star key={index} />
        ))}
      </div>
      {/* Wrap the content with galaxy background */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GalaxyBackground;
