import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../Backend/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

import AccessCard from "../components/AccessCard";
import EnrollmentFilters from "../components/EnrollmentFilters";
import EnrollmentTableBody from "../components/EnrollmentTableBody";
import ExamMarksModal from "../components/ExamMarksModal";
import StudentMarksModal from "../components/StudentMarksModal";

const allowedAdminEmail = "aieseci.anpara@gmail.com";
const allowedAdminPassword = "Aieseci@220471";

const EnrollmentTable = () => {
  /* ================= STUDENT ================= */
  const [studentName, setStudentName] = useState("");
  const [studentDob, setStudentDob] = useState("");

  /* ================= ADMIN ================= */
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  /* ================= AUTH ================= */
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= DATA ================= */
  const [enrollments, setEnrollments] = useState([]);

  /* ================= FILTER ================= */
  const [searchRollNo, setSearchRollNo] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  /* ================= EDIT ================= */
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  /* ================= MARKS ================= */
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [showStudentMarks, setShowStudentMarks] = useState(false);
  const [studentForMarks, setStudentForMarks] = useState(null);

  /* ================= ACCESS HANDLER ================= */
  const handleAccess = async (role) => {
    setErrorMessage("");

    // -------- ADMIN --------
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

    // -------- STUDENT --------
    try {
      const q = query(
        collection(db, "enrollments"),
        where("name", "==", studentName.trim()),
        where("dob", "==", studentDob)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setErrorMessage("Student not found");
        toast.error("Student not found");
        return;
      }

      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setEnrollments(data);
      setIsAdmin(false);
      setAuthenticated(true);
      toast.success("Student access granted");
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* ================= FETCH ADMIN DATA ================= */
  const fetchAdminData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "enrollments"));
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
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

  /* ================= CRUD ================= */
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

  const handleEdit = (entry) => {
    setEditId(entry.id);
    setEditData({
      rollNo: entry.rollNo,
      name: entry.name,
      fatherName: entry.fatherName,
      email: entry.email,
      phone: entry.phone,
      course: entry.course,
      aadhaar: entry.aadhaar,
      address: entry.address,
      dob: entry.dob,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= FILTER DATA ================= */
  const courseOptions = Array.from(
    new Set(enrollments.map((e) => e.course))
  ).filter(Boolean);

  const filteredEnrollments = isAdmin
    ? enrollments.filter((e) => {
        const search = searchRollNo.toLowerCase();
        const matchesRoll = e.rollNo?.toLowerCase().includes(search);
        const matchesName = e.name?.toLowerCase().includes(search);
        const matchesCourse =
          selectedCourse === "" || e.course === selectedCourse;
        return (matchesRoll || matchesName) && matchesCourse;
      })
    : enrollments;

  // Excel Download
  const downloadExcel = async () => {
    try {
      // 🔥 Always fetch fresh data
      const snapshot = await getDocs(collection(db, "enrollments"));
      const freshData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (!freshData.length) {
        toast.error("No records available");
        return;
      }

      const excelData = freshData.map((e) => ({
        "Roll No": e.rollNo || "",
        "Student Name": e.name || "",
        "Father Name": e.fatherName || "",
        DOB: e.dob || "",
        Course: e.course || "",
        Email: e.email || "",
        Phone: e.phone || "",

        // 🔽 MARKS (SAFE OPTIONAL CHAINING)
        "Semester 1 Total": e.marks?.semester1?.totalMarks ?? "N/A",
        "Semester 1 Obtained": e.marks?.semester1?.obtainedMarks ?? "N/A",

        "Semester 2 Total": e.marks?.semester2?.totalMarks ?? "N/A",
        "Semester 2 Obtained": e.marks?.semester2?.obtainedMarks ?? "N/A",

        // 🔽 PASS / FAIL (OPTIONAL)
        "Semester 1 Result": e.marks?.semester1
          ? e.marks.semester1.obtainedMarks < e.marks.semester1.totalMarks * 0.3
            ? "FAIL"
            : "PASS"
          : "N/A",

        "Semester 2 Result": e.marks?.semester2
          ? e.marks.semester2.obtainedMarks < e.marks.semester2.totalMarks * 0.3
            ? "FAIL"
            : "PASS"
          : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollment Records");

      XLSX.writeFile(workbook, "Enrollment_Records.xlsx");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download Excel");
    }
  };

  /* ================= LOGOUT ================= */
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

  /* ================= AUTH SCREEN ================= */
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

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <ToastContainer />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "All Enrollment Records" : "Student Dashboard"}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={downloadExcel}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Download Excel
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
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
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        handleEditChange={handleEditChange}
        setShowMarksModal={setShowMarksModal}
        setSelectedStudent={setSelectedStudent}
      />

      {/* ================= STUDENT VIEW MARKS ================= */}
      {!isAdmin && enrollments.length > 0 && (
        <div className="mt-6 text-center">
          <button
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded"
            onClick={async () => {
              try {
                const ref = doc(db, "enrollments", enrollments[0].id);
                const snap = await getDoc(ref);

                if (!snap.exists()) {
                  toast.error("Student record not found");
                  return;
                }

                setStudentForMarks({
                  id: snap.id,
                  ...snap.data(),
                });
                setShowStudentMarks(true);
              } catch {
                toast.error("Failed to fetch marks");
              }
            }}
          >
            View Exam Marks
          </button>
        </div>
      )}

      {/* ================= ADMIN MARKS MODAL ================= */}
      {showMarksModal && selectedStudent && (
        <ExamMarksModal
          student={selectedStudent}
          onClose={() => {
            setShowMarksModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* ================= STUDENT MARKS MODAL ================= */}
      {showStudentMarks && (
        <StudentMarksModal
          student={studentForMarks}
          onClose={() => {
            setShowStudentMarks(false);
            setStudentForMarks(null);
          }}
        />
      )}
    </div>
  );
};

export default EnrollmentTable;
