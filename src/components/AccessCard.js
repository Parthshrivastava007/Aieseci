import React from "react";

const AccessCard = ({
  studentEmail,
  setStudentEmail,
  adminEmail,
  setAdminEmail,
  handleAccess,
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Student Access</h2>
          <input
            type="email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            placeholder="Enter your email"
            className="p-2 text-black rounded mb-4 w-full"
          />
          <button
            onClick={() => handleAccess("student")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white w-full"
          >
            Access as Student
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Admin Access</h2>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Enter admin email"
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
