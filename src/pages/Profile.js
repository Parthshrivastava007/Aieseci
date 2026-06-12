import React from "react";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaPhone, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaAddressCard, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-gray-900 border border-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaLock className="text-3xl text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Profile Locked</h2>
          <p className="text-gray-400 mb-6 font-medium leading-relaxed">
            Please log in using the button in the navigation bar to access your user profile.
          </p>
        </div>
      </div>
    );
  }

  const isStudent = user.role === "student";
  const enrollment = user.enrollment || {};

  const handleLogoutClick = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 font-sans text-gray-200">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-semibold"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative flex items-end justify-center">
            <div className="absolute -bottom-16 w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-955 flex items-center justify-center overflow-hidden shadow-2xl">
              {isStudent ? (
                <div className="w-full h-full bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-4xl font-black text-gray-955">
                  {user.name ? user.name[0].toUpperCase() : "S"}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white">
                  <FaUser className="text-4xl text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-20 pb-10 px-6 sm:px-10 text-center">
            {/* User Meta */}
            <h1 className="text-3xl font-black text-white tracking-tight">
              {isStudent ? user.name : "Administrator"}
            </h1>
            <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm mt-1">
              {isStudent ? `Student Account` : `System Administrator`}
            </p>

            <hr className="border-gray-700/60 my-8" />

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {isStudent ? (
                <>
                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4">
                    <FaIdCard className="text-blue-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Roll Number</p>
                      <p className="text-white font-semibold font-mono mt-0.5">{enrollment.rollNo || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4">
                    <FaBuilding className="text-purple-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Course</p>
                      <p className="text-white font-semibold mt-0.5">{enrollment.course || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4">
                    <FaPhone className="text-emerald-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</p>
                      <p className="text-white font-semibold mt-0.5">{enrollment.phone || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4">
                    <FaEnvelope className="text-sky-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-white font-semibold mt-0.5 truncate max-w-[220px]">{enrollment.email || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4">
                    <FaUser className="text-pink-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Father's Name</p>
                      <p className="text-white font-semibold mt-0.5">{enrollment.fatherName || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4">
                    <FaCalendarAlt className="text-yellow-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date of Birth</p>
                      <p className="text-white font-semibold mt-0.5">{enrollment.dob || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4">
                    <FaAddressCard className="text-orange-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aadhaar Card</p>
                      <p className="text-white font-semibold font-mono mt-0.5">{enrollment.aadhaar || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4">
                    <FaCalendarAlt className="text-indigo-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enrollment Date</p>
                      <p className="text-white font-semibold mt-0.5">{enrollment.dateOfEnrollment || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4 md:col-span-2">
                    <FaMapMarkerAlt className="text-red-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Permanent Address</p>
                      <p className="text-white font-semibold mt-0.5 leading-relaxed">{enrollment.address || "N/A"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-700/30 flex items-start gap-4">
                    <FaEnvelope className="text-sky-400 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Email</p>
                      <p className="text-white font-semibold mt-0.5">{user.email || "N/A"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout Action */}
            <div className="mt-10">
              <button
                onClick={handleLogoutClick}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-red-600/20 w-full md:w-auto"
              >
                Log Out of Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
