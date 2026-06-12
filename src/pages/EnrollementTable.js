import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../Backend/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import EnrollmentFilters from "../components/EnrollmentFilters";
import EnrollmentTableBody from "../components/EnrollmentTableBody";
import ExamMarksModal from "../components/ExamMarksModal";
import StudentMarksModal from "../components/StudentMarksModal";
import { useAuth } from "../context/AuthContext";
import { FaLock } from "react-icons/fa";

const getEnrollmentDateObject = (entry) => {
  if (entry.dateOfEnrollment) {
    const parts = entry.dateOfEnrollment.includes("/")
      ? entry.dateOfEnrollment.split("/")
      : entry.dateOfEnrollment.split("-");

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else if (entry.dateOfEnrollment.includes("/")) {
        // DD/MM/YYYY
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        // DD-MM-YYYY
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
  }

  if (entry.createdAt?.toDate) {
    return entry.createdAt.toDate();
  }

  return null;
};

const EnrollmentTable = () => {
  const { user, isAuthenticated, isAdmin: authIsAdmin } = useAuth();

  /* ================= AUTH ================= */
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  /* ================= DATA ================= */
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      setAuthenticated(true);
      setIsAdmin(authIsAdmin);
      if (!authIsAdmin && user && user.enrollment) {
        setEnrollments([user.enrollment]);
      }
    } else {
      setAuthenticated(false);
      setIsAdmin(false);
      setEnrollments([]);
    }
  }, [isAuthenticated, authIsAdmin, user]);

  /* ================= FILTER ================= */
  const [searchRollNo, setSearchRollNo] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* ================= EDIT ================= */
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  /* ================= MARKS ================= */
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [showStudentMarks, setShowStudentMarks] = useState(false);
  const [studentForMarks, setStudentForMarks] = useState(null);

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
      dateOfEnrollment: entry.dateOfEnrollment 
        ? (entry.dateOfEnrollment.includes("/") ? entry.dateOfEnrollment.split("/").reverse().join("-") : entry.dateOfEnrollment)
        : (entry.createdAt?.toDate ? entry.createdAt.toDate().toISOString().split('T')[0] : ""),
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
    new Set(enrollments.map((e) => e.course)),
  ).filter(Boolean);

  const filteredEnrollments = isAdmin
    ? enrollments.filter((e) => {
        const search = searchRollNo.toLowerCase();
        const matchesRoll = e.rollNo?.toLowerCase().includes(search);
        const matchesName = e.name?.toLowerCase().includes(search);
        const matchesCourse =
          selectedCourse === "" || e.course === selectedCourse;

        let matchesDate = true;
        if (startDate || endDate) {
          const enrollDate = getEnrollmentDateObject(e);
          if (enrollDate) {
            // Compare dates at midnight to avoid timezone issues
            const d = new Date(enrollDate.getFullYear(), enrollDate.getMonth(), enrollDate.getDate());

            if (startDate) {
              const start = new Date(startDate);
              const cleanStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
              if (d < cleanStart) matchesDate = false;
            }
            if (endDate) {
              const end = new Date(endDate);
              const cleanEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
              if (d > cleanEnd) matchesDate = false;
            }
          } else {
            // No enrollment date was found, but a date filter is active: exclude this record.
            matchesDate = false;
          }
        }

        return (matchesRoll || matchesName) && matchesCourse && matchesDate;
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

  // Logout handled globally in NavBar

  /* ================= AUTH SCREEN ================= */
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-gray-900 border border-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaLock className="text-3xl text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Admissions Portal Locked</h2>
          <p className="text-gray-400 mb-6 font-medium leading-relaxed">
            Only accessible by admin only
          </p>
        </div>
      </div>
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
        </div>
      </div>

      {isAdmin && (
        <EnrollmentFilters
          searchRollNo={searchRollNo}
          setSearchRollNo={setSearchRollNo}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          courseOptions={courseOptions}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
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
