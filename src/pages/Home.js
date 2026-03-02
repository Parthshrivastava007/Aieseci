import React, { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import image1 from "../assets/Images/image1.jpg";
import image2 from "../assets/Images/image2.jpg";
import image3 from "../assets/Images/image3.jpg";
import image4 from "../assets/Images/image4.jpg";
import image5 from "../assets/Images/image5.jpg";
import image6 from "../assets/Images/image6.png";
import image7 from "../assets/Images/image7.jpg";
import image8 from "../assets/Images/image8.jpg";
import image9 from "../assets/Images/image9.jpg";
import image10 from "../assets/Images/image10.jpg";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }, []);

  const images = [
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
    image7,
    image8,
    image9,
    image10,
  ];

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.6,
      },
    },
    hover: {
      y: -10,
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  };

  // Floating animation for header
  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Gradient animation
  const gradientAnimation = {
    initial: { backgroundPosition: "0% 50%" },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  return (
    <main className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full min-h-screen text-white px-4 py-16 flex flex-col items-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header Section with Modern Animations */}
      <motion.header
        className="text-center max-w-3xl relative z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4"
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
        >
          <motion.span
            className="inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text bg-gradient-to-r bg-[length:200%_200%]"
            variants={gradientAnimation}
            initial="initial"
            animate="animate"
          >
            AIESECI
          </motion.span>
        </motion.h1>

        <motion.p
          className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-300"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.span
            className="inline-block"
            whileHover={{ scale: 1.05, color: "#60A5FA" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Empowering Students
          </motion.span>{" "}
          with the Best Computer Education in Sonbhadra
        </motion.p>

        {/* Animated Divider */}
        <motion.div
          className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mt-6 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      </motion.header>

      {/* Gallery Section with Modern Animations */}
      <motion.section
        className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl relative z-10"
        aria-label="Photo Gallery"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative group cursor-pointer"
            variants={itemVariants}
            whileHover="hover"
            custom={index}
          >
            {/* Image Container with Advanced Effects */}
            <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform-gpu">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 rounded-2xl" />

              {/* Image */}
              <motion.img
                src={image}
                alt={`AIESECI Event ${index + 1}`}
                className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-2xl"
                whileHover={{
                  scale: 1.15,
                  transition: { duration: 0.4, ease: "easeOut" },
                }}
              />

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
              </div>

              {/* Border Animation */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400/50 transition-all duration-300" />
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shine {
          100% {
            left: 200%;
          }
        }
        .animate-shine {
          animation: shine 1.5s ease-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
};

export default Home;
