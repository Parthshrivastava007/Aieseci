import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../Backend/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AccessCard from "../components/AccessCard";
import EnrollmentFilters from "../components/EnrollmentFilters";
import EnrollmentTableBody from "../components/EnrollmentTableBody";

const allowedAdminEmail = "aieseci.anpara@gmail.com";
const allowedAdminPassword = "Aieseci@220471";

const EnrollmentTable = () => {
  // 🔹 Student
  const [studentName, setStudentName] = useState("");
  const [studentDob, setStudentDob] = useState("");

  // 🔹 Admin
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // 🔹 Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🔹 Data
  const [enrollments, setEnrollments] = useState([]);

  // 🔹 Filters (Admin)
  const [searchRollNo, setSearchRollNo] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // 🔹 Edit
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    rollNo: "",
    name: "",
    fatherName: "",
    email: "",
    phone: "",
    course: "",
    aadhaar: "",
    address: "",
    dob: "",
  });

  /* =========================
     ACCESS HANDLER
  ========================== */
  const handleAccess = async (role) => {
    setErrorMessage("");

    // 🔐 ADMIN
    if (role === "admin") {
      if (
        adminEmail.trim().toLowerCase() === allowedAdminEmail.toLowerCase() &&
        adminPassword === allowedAdminPassword
      ) {
        setIsAdmin(true);
        setAuthenticated(true);
        toast.success("Admin access granted");
      } else {
        setErrorMessage("Invalid admin credentials");
        toast.error("Invalid admin credentials");
      }
      return;
    }

    // 🎓 STUDENT
    try {
      const q = query(
        collection(db, "enrollments"),
        where("name", "==", studentName.trim()),
        where("dob", "==", studentDob)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setErrorMessage("Student not found. Check Name & DOB.");
        toast.error("Student not found. Check Name & DOB.");
        return;
      }

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEnrollments(data);
      setIsAdmin(false);
      setAuthenticated(true);
      toast.success("Student access granted");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  /* =========================
     FETCH ADMIN DATA
  ========================== */
  const fetchAdminData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "enrollments"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(0);
        const bDate = b.createdAt?.toDate?.() || new Date(0);
        return bDate - aDate;
      });

      setEnrollments(data);
    } catch {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    if (authenticated && isAdmin) {
      fetchAdminData();
    }
  }, [authenticated, isAdmin]);

  /* =========================
     CRUD
  ========================== */
  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "enrollments", editId), editData);
      toast.success("Enrollment updated");
      setEditId(null);
      fetchAdminData();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "enrollments", id));
      toast.success("Enrollment deleted");
      fetchAdminData();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* =========================
     FILTERS (ADMIN)
  ========================== */
  const courseOptions = Array.from(
    new Set(enrollments.map((e) => e.course))
  ).filter(Boolean);

  const filteredEnrollments = isAdmin
    ? enrollments.filter((entry) => {
        const search = searchRollNo.toLowerCase();
        const matchesRoll = entry.rollNo?.toLowerCase().includes(search);
        const matchesName = entry.name?.toLowerCase().includes(search);
        const matchesCourse =
          selectedCourse === "" || entry.course === selectedCourse;
        return (matchesRoll || matchesName) && matchesCourse;
      })
    : enrollments;

  /* =========================
     LOGOUT
  ========================== */
  const handleLogout = () => {
    setAuthenticated(false);
    setIsAdmin(false);
    setEnrollments([]);
    setStudentName("");
    setStudentDob("");
    setAdminEmail("");
    setAdminPassword("");
    toast.info("Logged out successfully");
  };

  /* =========================
     AUTH SCREEN
  ========================== */
  if (!authenticated) {
    return (
      <>
        <ToastContainer />
        <AccessCard
          studentName={studentName}
          setStudentName={setStudentName}
          studentDob={studentDob}
          setStudentDob={setStudentDob}
          adminEmail={adminEmail}
          setAdminEmail={setAdminEmail}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          handleAccess={handleAccess}
          errorMessage={errorMessage}
        />
      </>
    );
  }

  /* =========================
     MAIN UI
  ========================== */
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <ToastContainer />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "All Enrollment Records" : "Your Enrollment Record"}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {isAdmin && (
        <EnrollmentFilters
          searchRollNo={searchRollNo}
          setSearchRollNo={setSearchRollNo}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          courseOptions={courseOptions}
        />
      )}

      <EnrollmentTableBody
        isAdmin={isAdmin}
        filteredEnrollments={filteredEnrollments}
        editId={editId}
        editData={editData}
        setEditId={setEditId}
        setEditData={setEditData}
        handleEditChange={(e) =>
          setEditData({ ...editData, [e.target.name]: e.target.value })
        }
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        handleEdit={(entry) => {
          setEditId(entry.id);
          setEditData(entry);
        }}
      />
    </div>
  );
};

export default EnrollmentTable;
