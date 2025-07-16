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
const allowedAdminPassword = "admin123"; // 🔒 You can store securely later

const EnrollmentTable = () => {
  // Admin and Student States
  const [studentName, setStudentName] = useState("");
  const [studentDob, setStudentDob] = useState("");
  const [studentEmail, setStudentEmail] = useState(""); // kept for legacy/filtering use
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Enrollment Data States
  const [enrollments, setEnrollments] = useState([]);
  const [searchRollNo, setSearchRollNo] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

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

  // 🔐 Access Handler
  const handleAccess = async (role) => {
    if (role === "admin") {
      if (
        adminEmail.trim().toLowerCase() === allowedAdminEmail.toLowerCase() &&
        adminPassword === allowedAdminPassword
      ) {
        setIsAdmin(true);
        setAuthenticated(true);
        toast.success("Admin access granted");
      } else {
        toast.error("Invalid admin credentials");
      }
    } else {
      // Student access via name + dob
      const q = query(
        collection(db, "enrollments"),
        where("name", "==", studentName.trim()),
        where("dob", "==", studentDob)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const studentData = snapshot.docs[0].data();
        setStudentEmail(studentData.email || ""); // for legacy filter
        setIsAdmin(false);
        setAuthenticated(true);
        toast.success("Student access granted");
      } else {
        toast.error("Student not found. Please check your Name and DOB.");
      }
    }
  };

  // 🔄 Fetch data
  const fetchData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "enrollments"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedData = data.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(0);
        const bDate = b.createdAt?.toDate?.() || new Date(0);
        return bDate - aDate;
      });

      if (isAdmin) {
        setEnrollments(sortedData);
      } else {
        const filtered = sortedData.filter(
          (entry) =>
            entry.name?.toLowerCase() === studentName.toLowerCase() &&
            entry.dob === studentDob
        );
        setEnrollments(filtered);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated]);

  // 🔁 Update entry
  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "enrollments", editId), editData);
      toast.success("Enrollment updated");
      setEditId(null);
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  // ❌ Delete entry
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "enrollments", id));
      toast.success("Enrollment deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

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

  // ⬇️ Download CSV
  const handleDownloadCSV = () => {
    if (!filteredEnrollments || filteredEnrollments.length === 0) {
      toast.warn("No enrollment data to download.");
      return;
    }

    const csvHeader = [
      "S.No",
      "Roll No",
      "Name",
      "Father Name",
      "Email",
      "Phone",
      "Course",
      "Aadhaar",
      "Address",
      "DOB",
      "Enrollment Date",
    ];

    const csvRows = filteredEnrollments.map((entry, idx) => [
      idx + 1,
      entry.rollNo || "",
      entry.name || "",
      entry.fatherName || "",
      entry.email || "",
      entry.phone || "",
      entry.course || "",
      entry.aadhaar || "",
      entry.address || "",
      entry.dob || "",
      entry.createdAt?.toDate?.().toLocaleDateString("en-IN") || "",
    ]);

    const allRows = [csvHeader, ...csvRows];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      allRows
        .map((row) =>
          row.map((cell) => `"${(cell + "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "enrollments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ⛔ Not logged in
  if (!authenticated) {
    return (
      <AccessCard
        adminEmail={adminEmail}
        setAdminEmail={setAdminEmail}
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        studentName={studentName}
        setStudentName={setStudentName}
        studentDob={studentDob}
        setStudentDob={setStudentDob}
        handleAccess={handleAccess}
      />
    );
  }

  // ✅ Main View
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "All Enrollment Records" : "Your Enrollment Record"}
        </h1>
        {isAdmin && (
          <button
            onClick={handleDownloadCSV}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
          >
            Download CSV
          </button>
        )}
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
