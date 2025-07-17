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

  const todayDate = new Date().toLocaleDateString("en-GB");

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    email: "",
    rollNo: "",
    phone: "",
    aadhaar: "",
    address: "",
    dob: "",
    course: courseName || "",
    dateOfEnrollment: todayDate,
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
      const docId = `${formData.rollNo || "noRoll"}_${formData.phone}`;

      const q = query(
        collection(db, "enrollments"),
        where("phone", "==", formData.phone),
        ...(formData.rollNo
          ? [where("rollNo", "==", `AFT-${formData.rollNo}`)]
          : [])
      );

      const snapshot = await getDocs(q);

      const rollNoWithPrefix =
        !["CCC", "O-Level"].includes(courseName) && formData.rollNo
          ? `AFT-${formData.rollNo}`
          : "";

      const enrollmentData = {
        ...formData,
        rollNo: rollNoWithPrefix,
        [snapshot.empty ? "createdAt" : "updatedAt"]: new Date(),
      };

      await setDoc(doc(db, "enrollments", docId), enrollmentData);

      toast.success(
        snapshot.empty
          ? "Enrollment submitted successfully!"
          : "Enrollment updated successfully!"
      );

      setFormData({
        name: "",
        fatherName: "",
        email: "",
        rollNo: "",
        phone: "",
        aadhaar: "",
        address: "",
        dob: "",
        course: courseName || "",
        dateOfEnrollment: todayDate,
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

        <label className="block mb-1">Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          required
          className="w-full p-2 mb-4 text-black rounded"
          onChange={handleChange}
        />

        <label className="block mb-1">Father's Name</label>
        <input
          type="text"
          name="fatherName"
          value={formData.fatherName}
          required
          className="w-full p-2 mb-4 text-black rounded"
          onChange={handleChange}
        />

        <label className="block mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          className="w-full p-2 mb-4 text-black rounded"
          onChange={handleChange}
        />

        {!["CCC", "O-Level"].includes(courseName) && (
          <>
            <label className="block mb-1">Roll Number</label>
            <div className="relative">
              <span className="absolute  top-5 left-2 transform -translate-y-1/2 text-black font-semibold">
                AFT -
              </span>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                className="w-full p-2 pl-14 mb-4 text-black rounded"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rollNo: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            </div>
          </>
        )}

        <label className="block mb-1">Mobile Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          pattern="[0-9]{10}"
          maxLength={10}
          required
          className="w-full p-2 mb-4 text-black rounded"
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/\D/g, "");
            setFormData((prev) => ({
              ...prev,
              phone: onlyNums,
            }));
          }}
        />

        <label className="block mb-1">Aadhaar Number</label>
        <input
          type="text"
          name="aadhaar"
          value={formData.aadhaar}
          pattern="\d{12}"
          maxLength={12}
          className="w-full p-2 mb-4 text-black rounded"
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/\D/g, "");
            setFormData((prev) => ({
              ...prev,
              aadhaar: onlyNums,
            }));
          }}
        />

        <label className="block mb-1">Address</label>
        <textarea
          name="address"
          value={formData.address}
          required
          className="w-full p-2 mb-4 text-black rounded"
          onChange={handleChange}
        />

        <label className="block mb-1">Date of Enrollment</label>
        <input
          type="text"
          name="dateOfEnrollment"
          value={formData.dateOfEnrollment}
          disabled
          className="w-full p-2 mb-4 text-black rounded bg-gray-200 cursor-not-allowed"
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
