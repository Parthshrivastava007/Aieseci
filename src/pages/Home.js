import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
import papa from "../assets/Images/papa.jpg";
import maa from "../assets/Images/Maa.jpeg";
import Footer from "../components/Footer";

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

  // About Section Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseGlow = {
    initial: { boxShadow: "0 0 0 rgba(59, 130, 246, 0)" },
    animate: {
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.3)",
        "0 0 40px rgba(59, 130, 246, 0.5)",
        "0 0 20px rgba(59, 130, 246, 0.3)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const aboutGradientAnimation = {
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
    <main className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full min-h-screen text-white flex flex-col items-center overflow-hidden">
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

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>

        {/* Additional About Backgrounds */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Header Section with Modern Animations */}
      <div className="px-4 py-16 flex flex-col items-center w-full">
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
      </div>

      {/* About Content Merged Here */}
      <div className="w-full">
        {/* About Hero Section */}
        <motion.section
          className="py-20 px-6 text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="relative inline-block rounded-xl p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-sky-200 border-2 border-blue-400/30"
            variants={pulseGlow}
            initial="initial"
            animate="animate"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 5,
              }}
            />

            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-4"
              variants={aboutGradientAnimation}
              initial="initial"
              animate="animate"
              style={{
                background: "linear-gradient(90deg, #60A5FA, #C084FC, #F472B6)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              About AIESECI
            </motion.h1>

            <motion.p
              className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
              variants={floatAnimation}
              initial="initial"
              animate="animate"
            >
              Empowering students with the best computer education in Sonbhadra,
              AISECI blends practical and theoretical learning to shape the
              future of the digital world.
            </motion.p>

            {/* Animated Divider */}
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mt-6 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </motion.div>
        </motion.section>

        {/* Mission & Vision Section */}
        <motion.section
          className="py-16 px-6 md:px-20 grid md:grid-cols-2 gap-8 relative z-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            {
              title: "Our Mission",
              content:
                "To empower individuals with advanced computer knowledge and foster digital literacy in Sonbhadra and beyond. AISECI strives to prepare students for real-world challenges by providing industry-relevant skills.",
              icon: "🎯",
              color: "from-blue-400 to-blue-600",
            },
            {
              title: "Our Vision",
              content:
                "To be a leading educational institute, transforming lives by delivering excellence in IT education, fostering innovation, and building a skilled workforce for tomorrow.",
              icon: "👁️",
              color: "from-purple-400 to-purple-600",
            },
          ].map((section, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{
                y: -10,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${section.color} rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
              />

              <div className="relative space-y-4 p-8 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-400/50 transition-all duration-300">
                <motion.div
                  className="text-4xl"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  {section.icon}
                </motion.div>

                <h2 className="text-3xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {section.title}
                </h2>

                <p className="text-gray-300 leading-relaxed">
                  {section.content}
                </p>

                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Timeline Section */}
        <motion.section
          className="py-16 px-6 md:px-20 bg-gray-900/50 backdrop-blur-sm relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl font-semibold text-center mb-12"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Our Journey Through Time
            </span>
          </motion.h2>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div
              className="space-y-6 flex-1"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  year: "2008",
                  text: "AIESECI Computer Institute was founded by Sanjeev Shrivastava, bringing quality computer education to Sonbhadra.",
                  icon: "🚀",
                },
                {
                  year: "2010",
                  text: "Launched foundational courses like DCA and CCC to make IT education more accessible.",
                  icon: "📚",
                },
                {
                  year: "2015",
                  text: "Expanded with advanced certifications like O LEVEL and CCO to cater to industry demands.",
                  icon: "🎓",
                },
                {
                  year: "2018",
                  text: "Introduced a hybrid teaching model, offering online and offline classes for flexible learning.",
                  icon: "💻",
                },
                {
                  year: "2024",
                  text: "The legacy of Sanjeev Shrivastava continues under the guidance of Iti Shrivastava, fostering innovation and growth.",
                  icon: "🌟",
                },
              ].map((entry, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ x: 10 }}
                  className="group relative"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full group-hover:w-2 transition-all duration-300" />

                  <div className="ml-6 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-400/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <motion.span
                        className="text-2xl"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        {entry.icon}
                      </motion.span>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {entry.year}
                      </h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {entry.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex justify-center items-center flex-1 w-full mt-10 md:mt-0"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-8 lg:gap-12 w-full justify-center perspective-1000">
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 10, rotateX: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative group w-48 sm:w-56"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="relative rounded-2xl bg-gray-800 p-2 shadow-2xl border border-gray-700 group-hover:border-blue-400/50 transition-colors duration-500">
                    <div className="overflow-hidden rounded-xl bg-gray-900 aspect-[3/4]">
                      <img
                        src={papa}
                        alt="Founder - Sanjeev Shrivastava"
                        className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                    </div>
                    <div className="absolute -bottom-5 inset-x-0 flex justify-center translate-z-10">
                      <motion.div
                        className="bg-gray-900 border border-blue-500/50 text-white px-6 py-2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-md"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          Founder
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                <div className="hidden sm:block w-8 h-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full" />

                <motion.div
                  whileHover={{ scale: 1.05, rotateY: -10, rotateX: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative group w-48 sm:w-56 mt-6 sm:mt-0"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="relative rounded-2xl bg-gray-800 p-2 shadow-2xl border border-gray-700 group-hover:border-pink-400/50 transition-colors duration-500">
                    <div className="overflow-hidden rounded-xl bg-gray-900 aspect-[3/4]">
                      <img
                        src={maa}
                        alt="Current Owner - Iti Shrivastava"
                        className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                    </div>
                    <div className="absolute -bottom-5 inset-x-0 flex justify-center translate-z-10">
                      <motion.div
                        className="bg-gray-900 border border-pink-500/50 text-white px-6 py-2 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.3)] backdrop-blur-md"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{
                          duration: 3.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5,
                        }}
                      >
                        <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Current Owner
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="py-16 bg-gradient-to-b from-gray-900 to-gray-800 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl font-semibold text-center mb-12"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Our Impact in Numbers
            </span>
          </motion.h2>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 px-6">
            {[
              {
                stat: "1000+",
                text: "Students Trained",
                icon: "👥",
                color: "from-blue-400 to-blue-600",
              },
              {
                stat: "95%",
                text: "Certification Success",
                icon: "📊",
                color: "from-purple-400 to-purple-600",
              },
              {
                stat: "10+",
                text: "Courses Offered",
                icon: "📚",
                color: "from-pink-400 to-pink-600",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{
                  y: -10,
                  transition: { type: "spring", stiffness: 300 },
                }}
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                />

                <div className="relative text-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-400/30 transition-all duration-300 w-64">
                  <motion.div
                    className="text-4xl mb-4"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    {item.icon}
                  </motion.div>

                  <motion.h3
                    className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    {item.stat}
                  </motion.h3>

                  <p className="text-gray-300">{item.text}</p>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-3/4 transition-all duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call-to-Action Section */}
        <Link to="/courses">
          <motion.section
            className="cursor-pointer py-16 text-center relative z-10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="relative inline-block p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-yellow-400/30"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(250, 204, 21, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  animate={{
                    x: [0, i % 2 === 0 ? 100 : -100, 0],
                    y: [0, i % 3 === 0 ? -50 : 50, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut",
                  }}
                />
              ))}

              <motion.h2
                className="text-4xl md:text-5xl font-semibold mb-4"
                variants={aboutGradientAnimation}
                initial="initial"
                animate="animate"
                style={{
                  background:
                    "linear-gradient(90deg, #FCD34D, #F59E0B, #FBBF24)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Join AIESECI Today
              </motion.h2>

              <motion.p
                className="text-gray-300 text-lg max-w-2xl mx-auto"
                variants={floatAnimation}
                initial="initial"
                animate="animate"
              >
                Start your journey towards a successful career in the digital
                world. Explore our wide range of courses and enroll now.
              </motion.p>

              <motion.div
                className="w-16 h-16 mx-auto mt-6"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="w-full h-full rounded-full border-4 border-yellow-400/30 border-t-yellow-400" />
              </motion.div>
            </motion.div>
          </motion.section>
        </Link>
      </div>

      <Footer />

      {/* Back to Top Button */}
      <motion.button
        className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-blue-500/20 backdrop-blur-lg rounded-full flex items-center justify-center cursor-pointer border border-blue-400/30"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{
          scale: 1.1,
          backgroundColor: "rgba(59, 130, 246, 0.3)",
          rotate: 360,
        }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
      </motion.button>
    </main>
  );
};

export default Home;
