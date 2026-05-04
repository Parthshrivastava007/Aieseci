import React, { useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../Backend/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AccessCard from "./AccessCard";
import { courseFees } from "./CourseFeesData";

// Constants
// const PAYMENT_STATUS = {
//   PAID: "Paid",
//   PENDING: "Pending",
// };

const allowedAdminEmail = "aieseci.anpara@gmail.com";
const allowedAdminPassword = "Aieseci@220471";

// Utility functions
const calculateTotals = (paymentStatus, totalFee) => {
  if (!paymentStatus || !paymentStatus.length)
    return { paid: 0, pending: 0, total: 0 };

  const paid = paymentStatus
    .filter((fee) => fee.isPaid)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const pending = totalFee - paid;

  return { paid, pending, total: totalFee };
};

const calculateTotalLateFine = (feeBreakdown, enrollmentDateStr, testDate) => {
  if (!feeBreakdown || !enrollmentDateStr) return 0;

  let totalFine = 0;
  const today = testDate ? new Date(testDate) : new Date();

  feeBreakdown.forEach((fee) => {
    const isEnrollmentFee =
      fee.component_type === "Enrollment Fee" || fee.order === 1;
    if (fee.isPaid || isEnrollmentFee) return;

    const parts = enrollmentDateStr.split("/");
    let dateObj;
    if (parts.length === 3) {
      dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
      dateObj = new Date(enrollmentDateStr);
    }
    if (isNaN(dateObj.getTime())) return;

    let monthsToAdd = fee.order === 1 ? 0 : fee.order - 1;
    if (fee.frequency === "Quarterly") {
      monthsToAdd = (fee.order - 1) * 3;
    }
    dateObj.setMonth(dateObj.getMonth() + monthsToAdd);

    const dueDeadline = new Date(dateObj);
    dueDeadline.setDate(15);
    dueDeadline.setHours(23, 59, 59, 999);

    const timeDiff = today.getTime() - dueDeadline.getTime();
    if (timeDiff > 0) {
      const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysLate > 0) {
        totalFine += daysLate * 10;
      }
    }
  });

  return totalFine;
};

// Sub-components
const StudentInfoCard = ({ student, totalFee }) => (
  <div className="mt-8 relative overflow-hidden bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-6">
      <div>
        <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Student Profile</p>
        <h3 className="text-3xl font-black text-white mb-3 tracking-tight">
          {student.name}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-md shadow-purple-500/20">
            {student.course}
          </span>
          <span className="text-yellow-400 font-bold bg-gray-900 px-4 py-1.5 rounded-full border border-gray-700 text-sm tracking-wide">
            {student.rollNo}
          </span>
        </div>
      </div>
      <div className="w-full md:w-auto text-left md:text-right bg-gray-900/50 p-5 rounded-2xl border border-gray-700">
        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1">
          Total Course Fee
        </p>
        <span className="inline-block text-4xl font-black text-white tracking-tight">
          ₹{totalFee?.toLocaleString("en-IN") || 0}
        </span>
      </div>
    </div>
  </div>
);

const SummaryCard = ({ title, amount, textColor }) => {
  const isPaid = title.includes("Paid");
  const isPending = title.includes("Pending");
  
  const iconBg = isPaid ? "bg-green-500/20 text-green-400" : isPending ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400";
  const glow = isPaid ? "shadow-[0_8px_30px_rgba(34,197,94,0.15)]" : isPending ? "shadow-[0_8px_30px_rgba(239,68,68,0.15)]" : "shadow-[0_8px_30px_rgba(234,179,8,0.15)]";

  return (
    <div className={`bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-700 ${glow} relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-gray-700/80`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconBg}`}>
          {isPaid ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : isPending ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          )}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
          {title}
        </p>
        <p className={`text-3xl font-black tracking-tight ${textColor}`}>
          ₹{amount?.toLocaleString("en-IN") || 0}
        </p>
      </div>
    </div>
  );
};

const OverallStatusCard = ({ isFullyPaid }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl border border-gray-700 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col justify-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 z-10">
      Overall Status
    </p>
    <div className="flex items-center z-10">
      {isFullyPaid ? (
        <span className="flex items-center text-green-400 font-black text-2xl tracking-tight">
          <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Fully Paid
        </span>
      ) : (
        <span className="flex items-center text-yellow-400 font-black text-2xl tracking-tight">
          <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Pending Dues
        </span>
      )}
    </div>
  </div>
);

const FeeTableRow = ({
  fee,
  onTogglePayment,
  onToggleLateFinePayment,
  isAdmin,
  enrollmentDateStr,
  testDate,
}) => {
  const getBaseDate = () => {
    if (!enrollmentDateStr) return null;
    const parts = enrollmentDateStr.split("/");
    let dateObj;
    if (parts.length === 3) {
      dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
      dateObj = new Date(enrollmentDateStr);
    }
    if (isNaN(dateObj.getTime())) return null;

    let monthsToAdd = fee.order === 1 ? 0 : fee.order - 1;
    if (fee.frequency === "Quarterly") {
      monthsToAdd = (fee.order - 1) * 3;
    }
    dateObj.setMonth(dateObj.getMonth() + monthsToAdd);
    return dateObj;
  };

  const baseDate = getBaseDate();

  const dueDate = (() => {
    if (!baseDate) return "N/A";
    if (fee.order === 1) return enrollmentDateStr;
    const m = String(baseDate.getMonth() + 1).padStart(2, "0");
    const y = baseDate.getFullYear();
    return `01/${m}/${y} - 15/${m}/${y}`;
  })();

  const isEnrollmentFee =
    fee.component_type === "Enrollment Fee" || fee.order === 1;

  let lateFine = 0;
  let fineApplicable = false;

  if (baseDate && !isEnrollmentFee) {
    const dueDeadline = new Date(baseDate);
    dueDeadline.setDate(15);
    dueDeadline.setHours(23, 59, 59, 999);

    const today = testDate ? new Date(testDate) : new Date();
    const timeDiff = today.getTime() - dueDeadline.getTime();
    if (timeDiff > 0) {
      fineApplicable = true;
      const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysLate > 0 && !fee.isPaid && !fee.isLateFinePaid) {
        lateFine = daysLate * 10;
      }
    }
  }

  let statusText = "Pending";
  let statusColor = "bg-red-100 text-red-800 border border-red-200";

  if (fee.isPaid) {
    if (
      isEnrollmentFee ||
      (!fineApplicable && !fee.isLateFinePaid) ||
      fee.isLateFinePaid
    ) {
      statusText = "Fully Paid";
      statusColor = "bg-green-100 text-green-800 border border-green-200";
    } else {
      statusText = "Regular Paid";
      statusColor = "bg-yellow-100 text-yellow-800 border border-yellow-200";
    }
  } else if (fee.isLateFinePaid) {
    statusText = "Fine Paid";
    statusColor = "bg-orange-100 text-orange-800 border border-orange-200";
  }

  const buttonClass = fee.isPaid
    ? "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md";

  return (
    <tr className="bg-white hover:bg-blue-50 transition-colors duration-150">
      <td className="p-4 text-gray-500 font-medium">{fee.order}</td>
      <td className="p-4 text-gray-900 font-semibold">
        {fee.component_type}
        {fee.frequency && (
          <span className="ml-2 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-md font-bold uppercase tracking-wide">
            {fee.frequency}
          </span>
        )}
      </td>
      <td className="p-4 text-gray-700 font-medium">{dueDate}</td>
      <td className="p-4 text-gray-900 font-bold text-right">
        ₹{fee.amount?.toLocaleString("en-IN")}
      </td>
      <td className="p-4 text-right font-bold text-red-600">
        {fee.isLateFinePaid ? (
          <span className="text-green-600">Paid</span>
        ) : lateFine > 0 ? (
          `₹${lateFine}`
        ) : (
          "-"
        )}
      </td>
      <td className="p-4 text-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}
        >
          {statusText}
        </span>
      </td>
      {isAdmin && (
        <td className="p-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => onTogglePayment(fee.order)}
              className={`px-4 py-2 w-36 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${buttonClass}`}
            >
              {fee.isPaid ? "Unpay Regular" : "Pay Regular"}
            </button>

            {!isEnrollmentFee && (fineApplicable || fee.isLateFinePaid) && (
              <button
                onClick={() => onToggleLateFinePayment(fee.order)}
                className={`px-4 py-2 w-36 rounded-lg text-xs font-bold shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${
                  fee.isLateFinePaid
                    ? "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {fee.isLateFinePaid ? "Fine Unpaid" : "Pay Fine"}
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

const FeeTable = ({
  paymentStatus,
  onTogglePayment,
  onToggleLateFinePayment,
  isAdmin,
  enrollmentDateStr,
  testDate,
}) => (
  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-800 border-b border-gray-700 text-sm text-gray-300 uppercase tracking-wider">
          <th className="p-4 font-bold">S.No</th>
          <th className="p-4 font-bold">Component Type</th>
          <th className="p-4 font-bold">Due Date</th>
          <th className="p-4 font-bold text-right">Amount</th>
          <th className="p-4 font-bold text-right">Late Fine</th>
          <th className="p-4 font-bold text-center">Status</th>
          {isAdmin && <th className="p-4 font-bold text-center">Action</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700 bg-gray-900/50">
        {paymentStatus?.map((fee) => (
          <FeeTableRow
            key={fee.order}
            fee={fee}
            onTogglePayment={onTogglePayment}
            onToggleLateFinePayment={onToggleLateFinePayment}
            isAdmin={isAdmin}
            enrollmentDateStr={enrollmentDateStr}
            testDate={testDate}
          />
        ))}
      </tbody>
    </table>
  </div>
);

// Main Component
const StudentFeeTracker = () => {
  /* ================= STUDENT ================= */
  const [studentName, setStudentName] = useState("");
  const [studentRollNumber, setStudentRollNumber] = useState("");

  /* ================= ADMIN ================= */
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  /* ================= AUTH ================= */
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= DATA ================= */
  const [currentStudent, setCurrentStudent] = useState(null);
  const [adminSearchRoll, setAdminSearchRoll] = useState("");
  const [loading, setLoading] = useState(false);
  const [testDate, setTestDate] = useState("");

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
      const formattedRoll = `AFT-${studentRollNumber}`
        .replace(/\s+/g, "")
        .toUpperCase();

      let q = query(
        collection(db, "enrollments"),
        where("rollNo", "==", formattedRoll),
      );

      let snapshot = await getDocs(q);

      // fallback for old data
      if (snapshot.empty) {
        q = query(
          collection(db, "enrollments"),
          where("rollNo", "==", studentRollNumber.trim()),
        );
        snapshot = await getDocs(q);
      }

      if (snapshot.empty) {
        setErrorMessage("Student not found");
        toast.error("Student not found");
        return;
      }

      const data = snapshot.docs[0].data();
      data.id = snapshot.docs[0].id;

      if (
        data.name?.trim().toLowerCase() !== studentName.trim().toLowerCase()
      ) {
        setErrorMessage("Roll number and name do not match");
        toast.error("Roll number and name do not match");
        return;
      }

      if (!data.feeBreakdown) {
        toast.info("No fee records found for this student. Contact admin.");
      }

      setCurrentStudent(data);
      setIsAdmin(false);
      setAuthenticated(true);
      toast.success("Student access granted");
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* ================= ADMIN SEARCH ================= */
  const handleAdminSearch = async () => {
    if (!adminSearchRoll.trim()) {
      toast.error("Please enter a roll number");
      return;
    }

    setLoading(true);
    try {
      const formattedRoll = adminSearchRoll.toUpperCase().includes("AFT-")
        ? adminSearchRoll.replace(/\s+/g, "").toUpperCase()
        : `AFT-${adminSearchRoll}`.replace(/\s+/g, "").toUpperCase();

      let q = query(
        collection(db, "enrollments"),
        where("rollNo", "==", formattedRoll),
      );

      let snapshot = await getDocs(q);

      // fallback
      if (snapshot.empty) {
        q = query(
          collection(db, "enrollments"),
          where("rollNo", "==", adminSearchRoll.trim()),
        );
        snapshot = await getDocs(q);
      }

      if (snapshot.empty) {
        toast.error("Student not found");
        setCurrentStudent(null);
      } else {
        const data = snapshot.docs[0].data();
        data.id = snapshot.docs[0].id;
        if (!data.feeBreakdown) {
          toast.info("No fee records generated for this student.");
        }
        setCurrentStudent(data);
        toast.success("Student found");
      }
    } catch {
      toast.error("Error searching for student");
    }
    setLoading(false);
  };

  /* ================= TOGGLE PAYMENT ================= */
  const handlePaymentToggle = async (orderId) => {
    if (!isAdmin || !currentStudent || !currentStudent.feeBreakdown) return;

    const updatedBreakdown = currentStudent.feeBreakdown.map((fee) =>
      fee.order === orderId ? { ...fee, isPaid: !fee.isPaid } : fee,
    );

    // Optimistic update
    setCurrentStudent((prev) => ({
      ...prev,
      feeBreakdown: updatedBreakdown,
    }));

    try {
      await updateDoc(doc(db, "enrollments", currentStudent.id), {
        feeBreakdown: updatedBreakdown,
      });
      toast.success("Payment status updated!");
    } catch {
      toast.error("Failed to update payment status");
      // Revert if failed
      setCurrentStudent((prev) => ({
        ...prev,
        feeBreakdown: currentStudent.feeBreakdown,
      }));
    }
  };

  /* ================= TOGGLE LATE FINE ================= */
  const handleLateFineToggle = async (orderId) => {
    if (!isAdmin || !currentStudent || !currentStudent.feeBreakdown) return;

    const updatedBreakdown = currentStudent.feeBreakdown.map((fee) =>
      fee.order === orderId
        ? { ...fee, isLateFinePaid: !fee.isLateFinePaid }
        : fee,
    );

    // Optimistic update
    setCurrentStudent((prev) => ({
      ...prev,
      feeBreakdown: updatedBreakdown,
    }));

    try {
      await updateDoc(doc(db, "enrollments", currentStudent.id), {
        feeBreakdown: updatedBreakdown,
      });
      toast.success("Late fine payment status updated!");
    } catch {
      toast.error("Failed to update late fine payment status");
      // Revert if failed
      setCurrentStudent((prev) => ({
        ...prev,
        feeBreakdown: currentStudent.feeBreakdown,
      }));
    }
  };

  /* ================= MARK ONE-TIME PAYMENT ================= */
  const handleOneTimePayment = async () => {
    if (!isAdmin || !currentStudent || !currentStudent.feeBreakdown) return;

    const confirmed = window.confirm(
      "Are you sure you want to mark all fees as paid via a one-time payment? This will settle all installments and waive any accumulated late fines."
    );
    if (!confirmed) return;

    const updatedBreakdown = currentStudent.feeBreakdown.map((fee) => ({
      ...fee,
      isPaid: true,
      isLateFinePaid: true,
    }));

    // Optimistic update
    setCurrentStudent((prev) => ({
      ...prev,
      feeBreakdown: updatedBreakdown,
      isOneTimePaid: true,
    }));

    try {
      await updateDoc(doc(db, "enrollments", currentStudent.id), {
        feeBreakdown: updatedBreakdown,
        isOneTimePaid: true,
      });
      toast.success("Course marked as fully paid via one-time payment!");
    } catch {
      toast.error("Failed to update payment status");
      // Revert if failed
      setCurrentStudent((prev) => ({
        ...prev,
        feeBreakdown: currentStudent.feeBreakdown,
        isOneTimePaid: currentStudent.isOneTimePaid || false,
      }));
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    setAuthenticated(false);
    setIsAdmin(false);
    setCurrentStudent(null);
    setStudentName("");
    setStudentRollNumber("");
    setAdminEmail("");
    setAdminPassword("");
    setAdminSearchRoll("");
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
          studentRollNumber={studentRollNumber}
          setStudentRollNumber={setStudentRollNumber}
          adminEmail={adminEmail}
          setAdminEmail={setAdminEmail}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          handleAccess={handleAccess}
          errorMessage={errorMessage}
          variant="fee"
        />
      </>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-10 px-4 font-sans text-gray-200">
      <ToastContainer />
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Sleek Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-800/60 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-700">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
            {isAdmin ? "Admin Fee Management" : "My Fee Status"}
          </h2>
          <button
            onClick={handleLogout}
            className="mt-4 sm:mt-0 bg-red-600 hover:bg-red-500 text-white border border-red-500 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.7)]"
          >
            Log Out
          </button>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                Find Student
              </h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Roll No (e.g. AFT-101)"
                  value={adminSearchRoll}
                  onChange={(e) => setAdminSearchRoll(e.target.value)}
                  className="flex-1 p-3.5 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
                />
                <button
                  onClick={handleAdminSearch}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  {loading ? "..." : "Search"}
                </button>
              </div>
            </div>

            <div className="bg-yellow-500/10 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-yellow-500/20">
              <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-4">
                Testing Sandbox (Admin)
              </h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="p-3 bg-gray-900/50 border border-yellow-500/30 rounded-xl text-yellow-400 focus:ring-2 focus:ring-yellow-500/50 outline-none font-medium w-full color-scheme-dark"
                  />
                </div>
                <span className="text-xs text-yellow-600/80 font-medium">Fast-forward time to verify late fine generation.</span>
              </div>
            </div>
          </div>
        )}

        {currentStudent ? (
          <div className="space-y-8">
            <StudentInfoCard
              student={currentStudent}
              totalFee={currentStudent.totalFee}
            />

            {currentStudent.feeBreakdown && currentStudent.feeBreakdown.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(() => {
                    const totals = calculateTotals(currentStudent.feeBreakdown, currentStudent.totalFee);
                    const isFullyPaid = totals.pending === 0;
                    const totalLateFine = calculateTotalLateFine(currentStudent.feeBreakdown, currentStudent.dateOfEnrollment, testDate);
                    return (
                      <>
                        <SummaryCard title="Total Paid" amount={totals.paid} textColor="text-green-400" />
                        <SummaryCard title="Total Pending" amount={totals.pending} textColor="text-red-400" />
                        <SummaryCard title="Total Late Fine" amount={totalLateFine} textColor="text-yellow-400" />
                        <OverallStatusCard isFullyPaid={isFullyPaid} />
                      </>
                    );
                  })()}
                </div>

                {isAdmin && (() => {
                  const totals = calculateTotals(currentStudent.feeBreakdown, currentStudent.totalFee);
                  const isFullyPaid = totals.pending === 0;
                  const courseInfo = courseFees.find(c => c.course_name === currentStudent.course);
                  const oneTimeFee = courseInfo ? courseInfo.one_time_fee : null;

                  if (courseInfo && !isFullyPaid) {
                    return (
                      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center shadow-[0_8px_30px_rgba(234,179,8,0.05)] gap-4 transition-all hover:bg-yellow-500/10">
                        <div>
                          <h4 className="text-yellow-400 font-black text-xl mb-1 tracking-tight">One-Time Payment Settlement</h4>
                          <p className="text-gray-400 text-sm font-medium">
                            The one-time course fee is <span className="text-white font-bold text-base">₹{oneTimeFee?.toLocaleString("en-IN")}</span>. 
                            If the student pays this amount in full, you can instantly settle all remaining monthly dues and late fines.
                          </p>
                        </div>
                        <button
                          onClick={handleOneTimePayment}
                          className="whitespace-nowrap bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-bold py-3.5 px-6 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                          Mark Fully Paid
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-700 p-6 sm:p-8">
                  <h3 className="text-xl font-black text-white mb-6 tracking-tight">
                    Payment Ledger
                  </h3>
                  <div className="rounded-2xl overflow-hidden border border-gray-700">
                    <FeeTable
                      paymentStatus={currentStudent.feeBreakdown}
                      onTogglePayment={handlePaymentToggle}
                      onToggleLateFinePayment={handleLateFineToggle}
                      isAdmin={isAdmin}
                      enrollmentDateStr={currentStudent.dateOfEnrollment}
                      testDate={testDate}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-12 bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-700 shadow-xl">
                <div className="w-16 h-16 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="text-xl font-black text-white mb-2">No Fee Records</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  No fee distribution could be found for this student. This usually happens if the student was enrolled prior to the automated system.
                </p>
              </div>
            )}
          </div>
        ) : (
          !isAdmin && (
            <div className="text-center p-12 bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-700 shadow-xl">
              <div className="animate-pulse flex space-x-4 justify-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animation-delay-200"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animation-delay-400"></div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentFeeTracker;
