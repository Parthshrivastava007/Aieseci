import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../Backend/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CourseForm = () => {
  const [searchParams] = useSearchParams();
  const courseName = searchParams.get("course");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    phone: "",
    course: courseName || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const q = query(
        collection(db, "enrollments"),
        where("rollNo", "==", formData.rollNo),
        where("phone", "==", formData.phone)
      );
      const snapshot = await getDocs(q);

      const docId = `${formData.rollNo}_${formData.phone}`;

      await setDoc(doc(db, "enrollments", docId), {
        ...formData,
        [snapshot.empty ? "createdAt" : "updatedAt"]: new Date(),
      });

      toast.success(
        snapshot.empty
          ? "Enrollment submitted successfully!"
          : "Enrollment updated successfully!"
      );

      // Reset the form
      setFormData({
        name: "",
        email: "",
        rollNo: "",
        phone: "",
        course: courseName || "",
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg w-full max-w-md shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Enroll in {courseName}</h2>

        <label className="block mb-1">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          required
          className="w-full p-2 mb-4 text-black rounded"
          onChange={handleChange}
        />

        <label className="block mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          required
          className="w-full p-2 mb-4 text-black rounded"
          onChange={handleChange}
        />

        <label className="block mb-1">Roll Number</label>
        <input
          type="text"
          name="rollNo"
          value={formData.rollNo}
          required
          className="w-full p-2 mb-4 text-black rounded"
          onChange={handleChange}
        />

        <label className="block mb-1">Mobile Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          pattern="[0-9]{10}"
          required
          className="w-full p-2 mb-4 text-black rounded"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded mt-2 w-full"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default CourseForm;
