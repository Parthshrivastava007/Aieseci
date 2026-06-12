import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LogoAiseci from "../assets/Images/LogoAiseci.png";
import { useAuth } from "../context/AuthContext";
import AccessCard from "./AccessCard";
import { FiX } from "react-icons/fi";

const LoginModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [studentName, setStudentName] = useState("");
  const [studentRollNumber, setStudentRollNumber] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleAccess = async (role) => {
    setErrorMessage("");
    let result;
    if (role === "admin") {
      result = await login("admin", { email: adminEmail, password: adminPassword });
    } else {
      if (!studentName.trim() || !studentRollNumber.trim()) {
        setErrorMessage("Name and Roll Number are required");
        return;
      }
      result = await login("student", { name: studentName, rollNo: studentRollNumber });
    }

    if (result && result.success) {
      onClose();
    } else if (result && !result.success) {
      setErrorMessage(result.error || "Authentication failed");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Backdrop click closer */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-gray-800/90 border border-gray-700/50 rounded-3xl shadow-2xl p-1 z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-[160] text-gray-400 hover:text-white transition-colors p-2 bg-gray-955/60 rounded-full border border-gray-700/50 hover:bg-gray-800"
            >
              <FiX size={18} />
            </button>

            <div className="max-h-[90vh] overflow-y-auto">
              <AccessCard
                studentName={studentName}
                setStudentName={setStudentName}
                studentRollNumber={studentRollNumber}
                setStudentRollNumber={setStudentRollNumber}
                adminEmail={adminEmail}
                setAdminEmail={setAdminEmail}
                adminPassword={adminPassword}
                setAdminPassword={setAdminPassword}
                handleAccess={handleAccess}
                errorMessage={errorMessage}
                variant="modal"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth(); 
  const location = useLocation();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    ...(user?.role !== "student" ? [{ name: "Admissions", path: "/enrollementtable" }] : []),
    { name: "Ledger", path: "/feetracker" },
    { name: "Exams", path: "/exams" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-xl sticky top-0 z-[100] border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-[110]"
        >
          <Link to="/">
            <img
              src={LogoAiseci}
              alt="AISECI Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
            />
          </Link>
        </motion.div>

        {/* Desktop Menu & Action Button */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-8">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`relative py-1 text-sm font-semibold tracking-wide transition-colors duration-300 group ${location.pathname === item.path
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-400"
                    }`}
                >
                  <motion.span whileHover={{ y: -2 }} className="inline-block">
                    {item.name}
                  </motion.span>

                  {/* Animated Underline */}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-yellow-400 transition-all duration-300 rounded-full ${location.pathname === item.path
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                      }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {isAuthenticated ? (
            <Link
              to="/profile"
              title="View Profile"
              className="w-10 h-10 rounded-full border border-gray-700 bg-gray-950 flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95 transition-all text-yellow-400 font-black shadow-lg"
            >
              {user.role === "student" ? (user.name ? user.name[0].toUpperCase() : "S") : "A"}
            </Link>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-350 text-gray-950 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-md active:scale-95 hover:shadow-lg"
            >
              Login
            </button>
          )}
        </div>

        {/* Animated Hamburger Toggle */}
        <button
          className="md:hidden relative z-[110] w-10 h-10 flex flex-col items-center justify-center space-y-1.5 outline-none focus:outline-none"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <motion.span
            animate={
              isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }
            }
            className="w-8 h-0.5 bg-yellow-400 rounded-full block"
          />
          <motion.span
            animate={
              isMobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }
            }
            className="w-8 h-0.5 bg-yellow-400 rounded-full block"
          />
          <motion.span
            animate={
              isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }
            }
            className="w-8 h-0.5 bg-yellow-400 rounded-full block"
          />
        </button>
      </div>

      {/* Side Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Side Menu Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-gray-900 shadow-2xl z-[105] border-l border-gray-800"
            >
              <div className="flex flex-col h-full pt-28 px-10">
                <ul className="flex flex-col space-y-8">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-xl font-bold transition-all duration-300 flex items-center group ${location.pathname === item.path
                            ? "text-yellow-400"
                            : "text-gray-100 hover:text-yellow-400"
                          }`}
                      >
                        <motion.span
                          whileHover={{ x: 10 }}
                          className="flex items-center"
                        >
                          {item.name}
                          <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            whileHover={{ opacity: 1, x: 5 }}
                            className="ml-2 text-yellow-400"
                          >
                            →
                          </motion.span>
                        </motion.span>
                      </Link>
                    </motion.li>
                  ))}

                  {isAuthenticated ? (
                    <>
                      <motion.li
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: menuItems.length * 0.1 + 0.2 }}
                      >
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-xl font-bold text-gray-100 hover:text-yellow-400 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-full border border-gray-700 bg-gray-955 flex items-center justify-center text-yellow-400 font-black text-sm">
                            {user.role === "student" ? (user.name ? user.name[0].toUpperCase() : "S") : "A"}
                          </div>
                          Profile
                        </Link>
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: menuItems.length * 0.1 + 0.3 }}
                      >

                      </motion.li>
                    </>
                  ) : (
                    <motion.li
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: menuItems.length * 0.1 + 0.2 }}
                    >
                      <button
                        onClick={() => {
                          setIsLoginModalOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        Login
                      </button>
                    </motion.li>
                  )}
                </ul>

                <div className="mt-auto mb-12">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
                    AIESECI Computer Institute
                  </p>
                  <div className="w-12 h-1 bg-yellow-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
