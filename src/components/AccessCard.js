import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaUserShield,
  FaIdCard,
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";

const AccessCard = ({
  studentName,
  setStudentName,
  studentDob, // Also used as roll number mapping in old code
  studentRollNumber,
  setStudentRollNumber,
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  errorMessage,
  handleAccess,
  variant = "fee", // 'fee' | 'dashboard'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("student");

  // Handle the old prop binding (studentDob vs studentRollNumber)
  const rollVal = studentRollNumber || studentDob;
  const setRoll = setStudentRollNumber;

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
          background: variant === "fee" ? "rgba(20, 20, 20, 0.9)" : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          color: variant === "fee" ? "#fff" : "#111",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "16px",
        },
      });
    }
  }, [errorMessage, variant]);

  const formVariants = {
    hidden: { opacity: 0, x: -20, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      x: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 } 
    },
    exit: { opacity: 0, x: 20, filter: "blur(10px)", transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // ==========================================
  // VARIANT: FEE TRACKER
  // ==========================================
  if (variant === "fee") {
    return (
      <div className="w-full flex items-center justify-center relative overflow-hidden font-sans min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        
        {/* Theme Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[100px] opacity-20"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.8) 0%, rgba(236,72,153,0) 70%)" }}
            animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[120px] opacity-20"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(139,92,246,0) 70%)" }}
            animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Main Glass Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md z-10"
        >
          <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/50 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 mx-auto bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20"
              >
                <FaIdCard className="text-3xl text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
                Fee Portal
              </h2>
              <p className="text-sm text-gray-400 mt-2">Secure access to your records</p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-gray-900/60 rounded-2xl p-1.5 mb-8 border border-gray-700/50 relative">
              <button 
                onClick={() => setActiveTab("student")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex justify-center items-center gap-2 z-10 ${
                  activeTab === "student" ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <FaUserGraduate className={activeTab === "student" ? "text-blue-400" : ""} /> Student
              </button>
              <button 
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex justify-center items-center gap-2 z-10 ${
                  activeTab === "admin" ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <FaUserShield className={activeTab === "admin" ? "text-pink-400" : ""} /> Admin
              </button>
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gray-700/50 rounded-xl border border-gray-600/50 shadow-lg transition-transform duration-500 ease-out`}
                style={{ transform: activeTab === "admin" ? "translateX(100%)" : "translateX(0)" }}
              />
            </div>

            {/* Forms Container */}
            <div className="min-h-[220px]">
              <AnimatePresence mode="wait">
                {activeTab === "student" ? (
                  <motion.div
                    key="student"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-5"
                  >
                    <motion.div variants={itemVariants} className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                        <FaIdCard />
                      </div>
                      <input 
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative group flex items-center bg-black/20 border border-white/10 rounded-xl focus-within:border-blue-500/50 focus-within:bg-blue-500/5 transition-all">
                      <div className="pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                        <FaIdCard />
                      </div>
                      <span className="pl-3 text-gray-500 font-medium font-mono text-sm tracking-widest">AFT-</span>
                      <input 
                        type="text"
                        value={rollVal}
                        onChange={(e) => setRoll(e.target.value)}
                        placeholder="Roll Number"
                        className="flex-1 bg-transparent py-3.5 pl-1 pr-4 text-white placeholder-gray-600 focus:outline-none"
                      />
                    </motion.div>

                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAccess("student")}
                      className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex justify-center items-center gap-2 group/btn"
                    >
                      Access Portal <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="admin"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-5"
                  >
                    <motion.div variants={itemVariants} className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                        <FaEnvelope />
                      </div>
                      <input 
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="Admin Email"
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                        <FaLock />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Admin Password"
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-purple-400 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </motion.div>

                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAccess("admin")}
                      className="w-full mt-2 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] flex justify-center items-center gap-2 group/btn"
                    >
                      Access Dashboard <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // VARIANT: MODAL (NO OUTER BACKGROUND WRAPPER)
  // ==========================================
  if (variant === "modal") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md z-10 mx-auto"
      >
        <div className="bg-gray-800/95 border border-gray-700/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 mx-auto bg-gray-900 border border-gray-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/10"
            >
              <FaIdCard className="text-3xl text-yellow-400" />
            </motion.div>
            <h2 className="text-2xl font-black text-white">
              Access Portal
            </h2>
            <p className="text-sm text-gray-400 mt-2 font-medium">
              Log in to view details
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-gray-900/80 rounded-2xl p-1.5 mb-8 border border-gray-700 relative">
            <button 
              onClick={() => setActiveTab("student")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex justify-center items-center gap-2 z-10 ${
                activeTab === "student" ? "text-yellow-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <FaUserGraduate className={activeTab === "student" ? "text-yellow-400" : ""} /> Student
            </button>
            <button 
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex justify-center items-center gap-2 z-10 ${
                activeTab === "admin" ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <FaUserShield className={activeTab === "admin" ? "text-blue-400" : ""} /> Admin
            </button>
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gray-800 rounded-xl border border-gray-600 shadow-sm transition-transform duration-500 ease-out`}
              style={{ transform: activeTab === "admin" ? "translateX(100%)" : "translateX(0)" }}
            />
          </div>

          {/* Forms Container */}
          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {activeTab === "student" ? (
                <motion.div
                  key="student"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-5"
                >
                  <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-400 transition-colors">
                      <FaIdCard />
                    </div>
                    <input 
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all shadow-sm"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative group flex items-center bg-gray-900/50 border border-gray-700 rounded-xl focus-within:border-yellow-400/50 focus-within:ring-1 focus-within:ring-yellow-400/50 transition-all shadow-sm">
                    <div className="pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-400 transition-colors">
                      <FaIdCard />
                    </div>
                    <span className="pl-3 text-gray-500 font-bold font-mono text-sm tracking-widest">AFT-</span>
                    <input 
                      type="text"
                      value={rollVal}
                      onChange={(e) => setRoll(e.target.value)}
                      placeholder="Roll Number"
                      className="flex-1 bg-transparent py-3.5 pl-1 pr-4 text-white font-medium placeholder-gray-500 focus:outline-none"
                    />
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccess("student")}
                    className="w-full mt-2 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex justify-center items-center gap-2 group/btn"
                  >
                    Enter Portal <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="admin"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-5"
                >
                  <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                      <FaEnvelope />
                    </div>
                    <input 
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Admin Email"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                      <FaLock />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Admin Password"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccess("admin")}
                    className="w-full mt-2 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2 group/btn"
                  >
                    Access Management <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // ==========================================
  // VARIANT: DASHBOARD (GLOBAL THEME WITH YELLOW ACCENT)
  // ==========================================
  return (
    <div className="w-full flex items-center justify-center relative overflow-hidden font-sans min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      {/* Dark Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[100px] opacity-10"
          style={{ background: "radial-gradient(circle, rgba(250,204,21,0.8) 0%, rgba(250,204,21,0) 70%)" }}
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[120px] opacity-10"
          style={{ background: "radial-gradient(circle, rgba(96,165,250,0.8) 0%, rgba(96,165,250,0) 70%)" }}
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Glass Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-gray-800/60 backdrop-blur-3xl border border-gray-700 rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 mx-auto bg-gray-900 border border-gray-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/10"
            >
              <FaIdCard className="text-3xl text-yellow-400" />
            </motion.div>
            <h2 className="text-2xl font-black text-white">
              {variant === "exam" ? "Exam Portal" : "Student Dashboard"}
            </h2>
            <p className="text-sm text-gray-400 mt-2 font-medium">
              {variant === "exam" ? "Log in to view your exams" : "Log in to view enrollment"}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-gray-900/80 rounded-2xl p-1.5 mb-8 border border-gray-700 relative">
            <button 
              onClick={() => setActiveTab("student")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex justify-center items-center gap-2 z-10 ${
                activeTab === "student" ? "text-yellow-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <FaUserGraduate className={activeTab === "student" ? "text-yellow-400" : ""} /> Student
            </button>
            <button 
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex justify-center items-center gap-2 z-10 ${
                activeTab === "admin" ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <FaUserShield className={activeTab === "admin" ? "text-blue-400" : ""} /> Admin
            </button>
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gray-800 rounded-xl border border-gray-600 shadow-sm transition-transform duration-500 ease-out`}
              style={{ transform: activeTab === "admin" ? "translateX(100%)" : "translateX(0)" }}
            />
          </div>

          {/* Forms Container */}
          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {activeTab === "student" ? (
                <motion.div
                  key="student"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-5"
                >
                  <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-400 transition-colors">
                      <FaIdCard />
                    </div>
                    <input 
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all shadow-sm"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative group flex items-center bg-gray-900/50 border border-gray-700 rounded-xl focus-within:border-yellow-400/50 focus-within:ring-1 focus-within:ring-yellow-400/50 transition-all shadow-sm">
                    <div className="pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-400 transition-colors">
                      <FaIdCard />
                    </div>
                    <span className="pl-3 text-gray-500 font-bold font-mono text-sm tracking-widest">AFT-</span>
                    <input 
                      type="text"
                      value={rollVal}
                      onChange={(e) => setRoll(e.target.value)}
                      placeholder="Roll Number"
                      className="flex-1 bg-transparent py-3.5 pl-1 pr-4 text-white font-medium placeholder-gray-500 focus:outline-none"
                    />
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccess("student")}
                    className="w-full mt-2 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex justify-center items-center gap-2 group/btn"
                  >
                    {variant === "exam" ? "Enter Exam Portal" : "Enter Dashboard"} <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="admin"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-5"
                >
                  <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                      <FaEnvelope />
                    </div>
                    <input 
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Admin Email"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                      <FaLock />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Admin Password"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccess("admin")}
                    className="w-full mt-2 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2 group/btn"
                  >
                    {variant === "exam" ? "Access Exam Management" : "Access Dashboard"} <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessCard;
