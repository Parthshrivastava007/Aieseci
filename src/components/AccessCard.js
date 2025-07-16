import React, { useEffect } from "react";
import { toast } from "react-toastify";

const AccessCard = ({
  // Student props
  studentName,
  setStudentName,
  studentDob,
  setStudentDob,

  // Admin props
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,

  // Error message
  errorMessage,

  handleAccess,
}) => {
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
        {/* Student Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Student Access</h2>
          <label className="block mb-1 font-semibold text-sm">Full Name</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter your name"
            className="p-2 text-black rounded mb-4 w-full"
          />
          <label className="block mb-1 font-semibold text-sm">
            Date of Birth
          </label>
          <input
            type="date"
            value={studentDob}
            onChange={(e) => setStudentDob(e.target.value)}
            className="p-2 text-black rounded mb-4 w-full"
            autoFocus
          />
          <button
            onClick={() => handleAccess("student")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white w-full"
          >
            Access as Student
          </button>
        </div>

        {/* Admin Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Admin Access</h2>

          <label className="block mb-1 font-semibold text-sm">
            Admin Email
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Enter admin email"
            className="p-2 text-black rounded mb-4 w-full"
          />

          <label className="block mb-1 font-semibold text-sm">Password</label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Enter password"
            className="p-2 text-black rounded mb-4 w-full"
          />

          <button
            onClick={() => handleAccess("admin")}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white w-full"
          >
            Access as Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessCard;
