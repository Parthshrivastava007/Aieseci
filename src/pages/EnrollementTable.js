import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Backend/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const allowedEmail = "aieseci.anpara@gmail.com";

const EnrollmentTable = () => {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [enrollments, setEnrollments] = useState([]);

  const handleAccess = () => {
    const normalizedInput = enteredEmail.trim().toLowerCase();
    if (normalizedInput === allowedEmail.toLowerCase()) {
      setAuthenticated(true);
      toast.success("Access granted. Welcome!");
    } else {
      toast.error("Access Denied: Unauthorized email.");
    }
  };

  useEffect(() => {
    if (authenticated) {
      const fetchData = async () => {
        const snapshot = await getDocs(collection(db, "enrollments"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEnrollments(data);
      };

      fetchData();
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <ToastContainer />
        <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
        <input
          type="email"
          value={enteredEmail}
          onChange={(e) => setEnteredEmail(e.target.value)}
          placeholder="Enter admin email"
          className="p-2 text-black rounded mb-4 w-72"
        />
        <button
          onClick={handleAccess}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white"
        >
          Submit
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Enrollment Records</h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 table-auto text-left">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3 border border-gray-700">Name</th>
              <th className="p-3 border border-gray-700">Email</th>
              <th className="p-3 border border-gray-700">Phone</th>
              <th className="p-3 border border-gray-700">Course</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((entry) => (
              <tr key={entry.id} className="bg-gray-700">
                <td className="p-3 border border-gray-600">{entry.name}</td>
                <td className="p-3 border border-gray-600">{entry.email}</td>
                <td className="p-3 border border-gray-600">{entry.phone}</td>
                <td className="p-3 border border-gray-600">{entry.course}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnrollmentTable;
