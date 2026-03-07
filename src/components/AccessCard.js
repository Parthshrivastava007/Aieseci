import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaUserCog,
  FaIdCard,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

const AccessCard = ({
  studentName,
  setStudentName,
  studentDob,
  setStudentRollNumber,
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  errorMessage,
  handleAccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [foucsedField, setFocusedField] = useState(null); // eslint-disable-line

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #ef4444",
          borderRadius: "10px",
        },
      });
    }
  }, [errorMessage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
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
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
      },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    focus: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: 0.2,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const iconVariants = {
    initial: { rotate: 0 },
    hover: {
      rotate: 360,
      scale: 1.2,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  };

  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // const pulseAnimation = {
  //   initial: { scale: 1 },
  //   animate: {
  //     scale: [1, 1.05, 1],
  //     transition: {
  //       duration: 2,
  //       repeat: Infinity,
  //       ease: "easeInOut",
  //     },
  //   },
  // };

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
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
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
          className="absolute bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl"
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
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"
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

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1000),
            }}
            animate={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1000),
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Student Card */}
        <motion.div
          className="relative group"
          variants={cardVariants}
          whileHover="hover"
          onHoverStart={() => setHoveredCard("student")}
          onHoverEnd={() => setHoveredCard(null)}
        >
          {/* Card Glow Effect */}
          <motion.div
            className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-500"
            animate={
              hoveredCard === "student" ? { opacity: 0.3 } : { opacity: 0 }
            }
          />

          <div className="relative bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 group-hover:border-blue-400/50 transition-all duration-300 overflow-hidden">
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              animate={
                hoveredCard === "student"
                  ? {
                      x: ["-100%", "200%"],
                    }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1,
              }}
            >
              <div className="absolute top-0 -inset-full h-full w-1/2 transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>

            {/* Header with Icon */}
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
                className="p-3 bg-blue-500/20 rounded-lg"
              >
                <FaUserGraduate className="text-blue-400 text-2xl" />
              </motion.div>
              <motion.h2
                className="text-2xl font-bold"
                variants={gradientAnimation}
                initial="initial"
                animate="animate"
                style={{
                  background: "linear-gradient(90deg, #60A5FA, #C084FC)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Student Access
              </motion.h2>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <motion.div
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-gray-300 flex items-center space-x-2">
                  <FaIdCard className="text-blue-400" />
                  <span>Full Name</span>
                </label>
                <motion.div whileFocus="focus" variants={fieldVariants}>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                    onFocus={() => setFocusedField("student-name")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </motion.div>

              {/* Roll Number Field */}
              <motion.div
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-gray-300 flex items-center space-x-2">
                  <FaIdCard className="text-blue-400" />
                  <span>Roll Number</span>
                </label>
                <motion.div
                  className="flex"
                  whileFocus="focus"
                  variants={fieldVariants}
                >
                  <motion.span
                    className="bg-gray-600 text-gray-300 px-4 py-3 rounded-l-lg border border-gray-600 border-r-0"
                    animate={floatAnimation}
                  >
                    AFT-
                  </motion.span>
                  <input
                    type="text"
                    value={studentDob}
                    onChange={(e) => setStudentRollNumber(e.target.value)}
                    placeholder="Enter roll number"
                    className="flex-1 p-3 bg-gray-700/50 border border-gray-600 rounded-r-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                    autoFocus
                    onFocus={() => setFocusedField("student-roll")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Access Button */}
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleAccess("student")}
              className="relative w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg overflow-hidden group/btn"
            >
              {/* Button Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
              />

              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>Access as Student</span>
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Admin Card */}
        <motion.div
          className="relative group"
          variants={cardVariants}
          whileHover="hover"
          onHoverStart={() => setHoveredCard("admin")}
          onHoverEnd={() => setHoveredCard(null)}
        >
          {/* Card Glow Effect */}
          <motion.div
            className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-500"
            animate={
              hoveredCard === "admin" ? { opacity: 0.3 } : { opacity: 0 }
            }
          />

          <div className="relative bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 group-hover:border-green-400/50 transition-all duration-300 overflow-hidden">
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              animate={
                hoveredCard === "admin"
                  ? {
                      x: ["-100%", "200%"],
                    }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1,
              }}
            >
              <div className="absolute top-0 -inset-full h-full w-1/2 transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>

            {/* Header with Icon */}
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
                className="p-3 bg-green-500/20 rounded-lg"
              >
                <FaUserCog className="text-green-400 text-2xl" />
              </motion.div>
              <motion.h2
                className="text-2xl font-bold"
                variants={gradientAnimation}
                initial="initial"
                animate="animate"
                style={{
                  background: "linear-gradient(90deg, #4ADE80, #34D399)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Admin Access
              </motion.h2>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Email Field */}
              <motion.div
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-gray-300 flex items-center space-x-2">
                  <FaEnvelope className="text-green-400" />
                  <span>Admin Email</span>
                </label>
                <motion.div whileFocus="focus" variants={fieldVariants}>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Enter admin email"
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                    onFocus={() => setFocusedField("admin-email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-gray-300 flex items-center space-x-2">
                  <FaLock className="text-green-400" />
                  <span>Password</span>
                </label>
                <motion.div
                  className="relative"
                  whileFocus="focus"
                  variants={fieldVariants}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300 pr-12"
                    onFocus={() => setFocusedField("admin-password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <motion.span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-green-400 cursor-pointer transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>

            {/* Access Button */}
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleAccess("admin")}
              className="relative w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg overflow-hidden group/btn"
            >
              {/* Button Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
              />

              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>Access as Admin</span>
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute bottom-10 left-10 text-6xl opacity-10 pointer-events-none"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <FaUserGraduate />
      </motion.div>

      <motion.div
        className="absolute top-10 right-10 text-6xl opacity-10 pointer-events-none"
        animate={{
          rotate: [0, -360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <FaUserCog />
      </motion.div>
    </motion.div>
  );
};

export default AccessCard;
