import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import papa from "../assets/Images/papa.jpg";
import { Link } from "react-router-dom";

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out-cubic",
      once: true,
      mirror: false,
    });
  }, []);

  // Animation variants
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

  // Custom hook for scroll animations
  // const ScrollAnimation = ({ children, delay = 0 }) => {
  //   const [ref, inView] = useInView({
  //     triggerOnce: true,
  //     threshold: 0.1,
  //   });

  //   return (
  //     <motion.div
  //       ref={ref}
  //       initial={{ opacity: 0, y: 50 }}
  //       animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
  //       transition={{ duration: 0.6, delay }}
  //     >
  //       {children}
  //     </motion.div>
  //   );
  // };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Section */}
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
            variants={gradientAnimation}
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
            AISECI blends practical and theoretical learning to shape the future
            of the digital world.
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
            {/* Background Glow Effect */}
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

              <p className="text-gray-300 leading-relaxed">{section.content}</p>

              {/* Animated Border */}
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
                  <p className="text-gray-300 leading-relaxed">{entry.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex justify-center items-center flex-1"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              {/* Image Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />

              <img
                src={papa}
                alt="Founder"
                className="relative w-72 aspect-[3/4] rounded-lg object-cover object-top shadow-2xl border-4 border-transparent hover:border-blue-400/50 transition-all duration-300"
              />

              {/* Floating Badge */}
              <motion.div
                className="absolute -bottom-4 -right-4 bg-gradient-to-r from-blue-400 to-purple-400 text-white px-4 py-2 rounded-full shadow-lg"
                animate={{
                  y: [-5, 5, -5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="font-semibold">Founder</span>
              </motion.div>
            </motion.div>
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

                {/* Animated Border */}
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
            {/* Particle Effect */}
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
              variants={gradientAnimation}
              initial="initial"
              animate="animate"
              style={{
                background: "linear-gradient(90deg, #FCD34D, #F59E0B, #FBBF24)",
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
    </div>
  );
};

export default About;
