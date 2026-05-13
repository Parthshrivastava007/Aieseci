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

  const partialPaid = paymentStatus
    .filter((fee) => !fee.isPaid && fee.partialPaid > 0)
    .reduce((acc, curr) => acc + curr.partialPaid, 0);

  const totalPaidAmount = paid + partialPaid;
  const pending = totalFee - totalPaidAmount;

  return { paid: totalPaidAmount, pending, total: totalFee };
};

const parseCustomDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.includes("/") ? dateStr.split("/") : dateStr.split("-");
  if (parts.length !== 3) return new Date(dateStr);

  let dateObj;
  if (dateStr.includes("/")) {
    // Handle DD/MM/YYYY
    let year = parseInt(parts[2]);
    if (year < 100) year += 2000;
    dateObj = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
  } else {
    // Handle YYYY-MM-DD
    if (parts[0].length === 4) {
      dateObj = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2]),
      );
    } else {
      dateObj = new Date(dateStr);
    }
  }
  return isNaN(dateObj.getTime()) ? null : dateObj;
};

const formatDateToDMY = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const calculateTotalLateFine = (feeBreakdown, enrollmentDateStr, testDate) => {
  if (!feeBreakdown || !enrollmentDateStr) return 0;

  let totalFine = 0;
  const today = testDate ? new Date(testDate) : new Date();

  feeBreakdown.forEach((fee) => {
    const isEnrollmentFee =
      fee.component_type === "Enrollment Fee" || fee.order === 1;
    if (isEnrollmentFee || fee.isLateFinePaid) return;

    const dateObj = parseCustomDate(enrollmentDateStr);
    if (!dateObj) return;
    if (isNaN(dateObj.getTime())) return;

    let monthsToAdd = fee.order === 1 ? 0 : fee.order - 1;
    if (fee.frequency === "Quarterly") {
      monthsToAdd = (fee.order - 1) * 3;
    }

    if (dateObj.getDate() > 25 && fee.order > 1) {
      monthsToAdd += 1;
    }

    const targetMonth = dateObj.getMonth() + monthsToAdd;
    dateObj.setMonth(targetMonth);
    if (dateObj.getMonth() !== targetMonth % 12) {
      dateObj.setDate(0);
    }

    const dueDeadline = new Date(dateObj);
    dueDeadline.setDate(15);
    dueDeadline.setHours(23, 59, 59, 999);

    // Use payment date if already paid, else use today
    let calculationDate = today;
    if (fee.isPaid && fee.paymentDate) {
      const pDate = parseCustomDate(fee.paymentDate);
      if (pDate) {
        calculationDate = pDate;
        calculationDate.setHours(23, 59, 59, 999);
      }
    }

    const timeDiff = calculationDate.getTime() - dueDeadline.getTime();
    const isPastDue = timeDiff > 0;
    const hasManualFine = fee.manualLateFine !== undefined;

    if (isPastDue || hasManualFine) {
      const daysLate = isPastDue ? Math.ceil(timeDiff / (1000 * 3600 * 24)) : 0;
      if (hasManualFine) {
        totalFine += fee.manualLateFine;
      } else if (daysLate > 0) {
        totalFine += daysLate * 10;
      }
    }
  });

  return totalFine;
};

const calculateCurrentlyDueRegular = (
  feeBreakdown,
  enrollmentDateStr,
  testDate,
) => {
  if (!feeBreakdown || !enrollmentDateStr) return 0;

  let currentlyPendingRegular = 0;
  const today = testDate ? new Date(testDate) : new Date();

  feeBreakdown.forEach((fee) => {
    if (fee.isPaid) return;

    const isEnrollmentFee =
      fee.component_type === "Enrollment Fee" || fee.order === 1;

    let isDue = false;

    if (isEnrollmentFee) {
      isDue = true;
    } else {
      const dateObj = parseCustomDate(enrollmentDateStr);
      if (dateObj && !isNaN(dateObj.getTime())) {
        let monthsToAdd = fee.order - 1;
        if (fee.frequency === "Quarterly") {
          monthsToAdd = (fee.order - 1) * 3;
        }

        if (dateObj.getDate() > 25 && fee.order > 1) {
          monthsToAdd += 1;
        }

        const targetMonth = dateObj.getMonth() + monthsToAdd;
        dateObj.setMonth(targetMonth);
        if (dateObj.getMonth() !== targetMonth % 12) {
          dateObj.setDate(0);
        }

        if (
          dateObj.getFullYear() < today.getFullYear() ||
          (dateObj.getFullYear() === today.getFullYear() &&
            dateObj.getMonth() <= today.getMonth())
        ) {
          isDue = true;
        }
      }
    }

    if (isDue) {
      currentlyPendingRegular += fee.amount - (fee.partialPaid || 0);
    }
  });

  return currentlyPendingRegular;
};

// Sub-components
const StudentInfoCard = ({ student, totalFee }) => (
  <div className="mt-8 relative overflow-hidden bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-6">
      <div>
        <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">
          Student Profile
        </p>
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

  const iconBg = isPaid
    ? "bg-green-500/20 text-green-400"
    : isPending
      ? "bg-red-500/20 text-red-400"
      : "bg-yellow-500/20 text-yellow-400";
  const glow = isPaid
    ? "shadow-[0_8px_30px_rgba(34,197,94,0.15)]"
    : isPending
      ? "shadow-[0_8px_30px_rgba(239,68,68,0.15)]"
      : "shadow-[0_8px_30px_rgba(234,179,8,0.15)]";

  return (
    <div
      className={`bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-700 ${glow} relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-gray-700/80`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconBg}`}>
          {isPaid ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          ) : isPending ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
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
          <svg
            className="w-7 h-7 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Fully Paid
        </span>
      ) : (
        <span className="flex items-center text-yellow-400 font-black text-2xl tracking-tight">
          <svg
            className="w-7 h-7 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Pending Dues
        </span>
      )}
    </div>
  </div>
);

const InvoiceModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialInvoice,
  initialDate,
  baseAmount,
  isEdit,
  lateFine,
  isLateFinePaid,
  lateFinePaidAmount,
  isFineOnly,
}) => {
  const [invoice, setInvoice] = React.useState(initialInvoice || "");
  const [date, setDate] = React.useState("");
  const [amount, setAmount] = React.useState(baseAmount || 0);
  const [fineAmount, setFineAmount] = React.useState(
    lateFinePaidAmount || lateFine || 0,
  );

  React.useEffect(() => {
    setInvoice(initialInvoice || "");
    setAmount(baseAmount || 0);
    setFineAmount(lateFinePaidAmount || lateFine || 0);
    // Default to today if no date provided, else format existing date for input[type=date]
    if (initialDate) {
      const parts = initialDate.split("/");
      if (parts.length === 3) {
        setDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        setDate(initialDate);
      }
    } else {
      const today = new Date();
      setDate(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
      );
    }
  }, [initialInvoice, initialDate, baseAmount, isOpen]); // eslint-disable-line

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Format date back to DD/MM/YYYY
    const dateObj = new Date(date);
    const formattedDate = !isNaN(dateObj.getTime())
      ? `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`
      : new Date().toLocaleDateString("en-IN");

    onConfirm(invoice, formattedDate, Number(amount), Number(fineAmount));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <style>{`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>

      <div
        className="relative w-full
      max-w-2xl
      bg-[#1e293b]
      border
      border-slate-700
      rounded-3xl
      shadow-2xl
      overflow-hidden
      my-auto
    "
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-700">
          <h2 className="text-3xl font-black text-white">Payment Details</h2>

          <p className="text-slate-400 mt-2">
            Confirm or update the payment information for this installment.
          </p>
        </div>

        {/* BODY */}
        <div className="px-8 py-6 space-y-6 max-h-[65vh] overflow-y-auto hide-scrollbar">
          {(lateFine > 0 || isLateFinePaid) && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-red-400 font-bold text-lg">Late Fine</p>

                  <p className="text-red-300/70 text-sm mt-1">
                    Settle the fine amount for this installment.
                  </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-red-400 font-black text-2xl">
                  {isLateFinePaid
                    ? `Paid: ₹${lateFinePaidAmount || 0}`
                    : `Due: ₹${lateFine}`}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-red-400 mb-3">
                  Fine Amount Collected (₹)
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 font-bold">
                    ₹
                  </span>

                  <input
                    type="number"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(e.target.value)}
                    className="
                  w-full
                  bg-slate-900/70
                  border
                  border-red-500/20
                  rounded-2xl
                  py-4
                  pl-12
                  pr-4
                  text-white
                  text-xl
                  font-semibold
                  outline-none
                  focus:ring-2
                  focus:ring-red-500/40
                "
                  />
                </div>
              </div>
            </div>
          )}

          {!isEdit && !isFineOnly && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Amount Paid (₹)
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  ₹
                </span>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="
                w-full
                bg-slate-900/70
                border
                border-slate-600
                rounded-2xl
                py-4
                pl-12
                pr-4
                text-white
                text-xl
                font-semibold
                outline-none
                focus:ring-2
                focus:ring-blue-500/40
              "
                />
              </div>

              <p className="text-blue-400 text-sm mt-3">
                Excess amount automatically carries over to the next
                installment.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Payment Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="
              w-full
              bg-slate-900/70
              border
              border-slate-600
              rounded-2xl
              p-4
              text-white
              outline-none
              focus:ring-2
              focus:ring-blue-500/40
            "
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Invoice No.
              </label>

              <input
                type="text"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                placeholder="INV-001"
                className="
              w-full
              bg-slate-900/70
              border
              border-slate-600
              rounded-2xl
              p-4
              text-white
              outline-none
              focus:ring-2
              focus:ring-blue-500/40
            "
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-700 px-8 py-5 bg-[#1e293b]">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="
            flex-1
            py-4
            rounded-2xl
            bg-slate-600
            hover:bg-slate-500
            text-white
            font-bold
            text-lg
            transition
          "
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              className="
            flex-1
            py-4
            rounded-2xl
            bg-blue-600
            hover:bg-blue-500
            text-white
            font-bold
            text-lg
            shadow-lg
            shadow-blue-500/20
            transition
          "
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditFineModal = ({ isOpen, onClose, onConfirm, currentFine }) => {
  const [fine, setFine] = React.useState(currentFine);

  React.useEffect(() => {
    setFine(currentFine);
  }, [currentFine, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl transition-all">
        <h2 className="text-2xl font-black text-white mb-2">Edit Late Fine</h2>
        <p className="text-slate-400 text-sm mb-6">
          Manually override the late fine for this installment.
        </p>

        <label className="block text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
          Fine Amount (₹)
        </label>
        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
            ₹
          </span>
          <input
            type="number"
            value={fine}
            onChange={(e) => setFine(e.target.value)}
            className="w-full bg-slate-900/70 border border-slate-600 rounded-2xl py-3 pl-10 pr-4 text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Number(fine))}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, studentName }) => {
  const [confirmText, setConfirmText] = React.useState("");
  
  React.useEffect(() => {
    if (isOpen) setConfirmText("");
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = confirmText.toUpperCase() === "DELETE";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] transition-all">
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-black text-white text-center mb-2">Delete Ledger?</h2>
        <p className="text-slate-400 text-center text-sm mb-6">
          You are about to delete the entire fee ledger for <span className="text-white font-bold">{studentName}</span>. This action is irreversible.
        </p>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-red-400 mb-2 text-center">
            Type <span className="bg-red-500 text-white px-2 py-0.5 rounded">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type here..."
            className="w-full bg-slate-900/70 border border-red-500/20 rounded-xl py-3 px-4 text-white text-center font-bold outline-none focus:ring-2 focus:ring-red-500/40 transition-all uppercase"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!isConfirmed}
            onClick={onConfirm}
            className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-lg ${
              isConfirmed 
                ? "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20" 
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            Delete Now
          </button>
        </div>
      </div>
    </div>
  );
};


const FeeTableRow = ({
  fee,
  onTogglePayment,
  onToggleLateFinePayment,
  onEditLateFine,
  onCancelFineOverride,
  isAdmin,
  enrollmentDateStr,
  testDate,
}) => {
  const getBaseDate = () => {
    if (!enrollmentDateStr) return null;
    const dateObj = parseCustomDate(enrollmentDateStr);
    if (!dateObj) return null;
    if (isNaN(dateObj.getTime())) return null;

    let monthsToAdd = fee.order === 1 ? 0 : fee.order - 1;
    if (fee.frequency === "Quarterly") {
      monthsToAdd = (fee.order - 1) * 3;
    }

    if (dateObj.getDate() > 25 && fee.order > 1) {
      monthsToAdd += 1;
    }

    const targetMonth = dateObj.getMonth() + monthsToAdd;
    dateObj.setMonth(targetMonth);
    if (dateObj.getMonth() !== targetMonth % 12) {
      dateObj.setDate(0);
    }
    return dateObj;
  };

  const baseDate = getBaseDate();

  const dueDate = (() => {
    if (!baseDate) return "N/A";
    if (fee.order === 1) {
      const dd = String(baseDate.getDate()).padStart(2, "0");
      const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
      const yyyy = baseDate.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
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

    // Use payment date if already paid, else use today
    let calculationDate = today;
    if (fee.isPaid && fee.paymentDate) {
      const pDate = parseCustomDate(fee.paymentDate);
      if (pDate) {
        calculationDate = pDate;
        calculationDate.setHours(23, 59, 59, 999);
      }
    }

    const timeDiff = calculationDate.getTime() - dueDeadline.getTime();
    const isPastDue = timeDiff > 0;
    const hasManualFine = fee.manualLateFine !== undefined;

    if (isPastDue || hasManualFine) {
      fineApplicable = true;
      const daysLate = isPastDue ? Math.ceil(timeDiff / (1000 * 3600 * 24)) : 0;
      if (!fee.isLateFinePaid) {
        if (hasManualFine) {
          lateFine = fee.manualLateFine;
        } else if (daysLate > 0) {
          lateFine = daysLate * 10;
        }
      }
    }
  }

  let statusText = "Pending";
  let statusColor = "bg-red-100 text-red-800 border border-red-200";

  if (fee.isPaid) {
    if (
      isEnrollmentFee ||
      (lateFine === 0 && !fee.isLateFinePaid) ||
      fee.isLateFinePaid
    ) {
      statusText = "Fully Paid";
      statusColor = "bg-green-100 text-green-800 border border-green-200";
    } else {
      statusText = "Regular Paid (Fine Pending)";
      statusColor = "bg-yellow-100 text-yellow-800 border border-yellow-200";
    }
  } else if (!isEnrollmentFee && fee.isLateFinePaid) {
    statusText = "Fine Paid (Regular Pending)";
    statusColor = "bg-orange-100 text-orange-800 border border-orange-200";
  } else if (fee.partialPaid > 0) {
    statusText = "Partially Paid";
    statusColor = "bg-blue-100 text-blue-800 border border-blue-200";
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
      <td className="p-4 text-right font-bold text-blue-400">
        ₹{fee.amount?.toLocaleString("en-IN")}
        {fee.partialPaid > 0 && !fee.isPaid && (
          <div className="text-xs text-green-500 mt-1 font-semibold">
            + Paid: ₹{fee.partialPaid.toLocaleString("en-IN")}
          </div>
        )}
      </td>
      <td className="p-4 text-right font-bold text-red-600">
        {!isEnrollmentFee && fee.isLateFinePaid ? (
          <span className="text-green-500">
            Paid (₹{fee.lateFinePaidAmount || 0})
          </span>
        ) : !isEnrollmentFee && lateFine > 0 ? (
          `₹${lateFine}`
        ) : (
          "-"
        )}
      </td>
      <td className="p-4 text-center text-gray-700 font-medium whitespace-nowrap">
        {fee.paymentDate || "-"}
      </td>
      <td className="p-4 text-center text-blue-600 font-bold uppercase tracking-wide">
        {fee.invoiceNo || "-"}
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
              onClick={() =>
                onTogglePayment(
                  fee.order,
                  fee.isPaid,
                  fee.invoiceNo,
                  fee.paymentDate,
                  false,
                  lateFine,
                )
              }
              className={`px-4 py-2 w-36 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${buttonClass}`}
            >
              {fee.isPaid ? "Unpay Regular" : "Pay Regular"}
            </button>

            {(fee.isPaid || fee.partialPaid > 0) && (
              <button
                onClick={() =>
                  onTogglePayment(
                    fee.order,
                    false,
                    fee.invoiceNo,
                    fee.paymentDate,
                    true,
                    lateFine,
                  )
                }
                className="px-4 py-2 w-36 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 transition-all duration-200"
              >
                Edit Info
              </button>
            )}

            {!isEnrollmentFee && (fineApplicable || fee.isLateFinePaid) && (
              <div className="flex items-center space-x-2 w-36">
                <button
                  onClick={() =>
                    lateFine > 0 || fee.isLateFinePaid
                      ? onToggleLateFinePayment(fee.order, lateFine)
                      : null
                  }
                  className={`flex-1 px-2 py-2 rounded-lg text-xs font-bold shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${
                    fee.isLateFinePaid
                      ? "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                      : lateFine === 0
                        ? "bg-green-100 text-green-700 border border-green-300 cursor-default hover:bg-green-100 hover:transform-none"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                  disabled={!fee.isLateFinePaid && lateFine === 0}
                >
                  {fee.isLateFinePaid
                    ? `Fine Paid (₹${fee.lateFinePaidAmount || 0})`
                    : lateFine === 0
                      ? "Fine Waived"
                      : "Pay Fine"}
                </button>
                {!fee.isLateFinePaid && (
                  <>
                    <button
                      onClick={() => onEditLateFine(fee.order, lateFine)}
                      className="p-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 transition-all duration-200 transform hover:-translate-y-0.5"
                      title="Edit Fine Amount"
                    >
                      ✎
                    </button>
                    {fee.manualLateFine !== undefined && (
                      <button
                        onClick={() => onCancelFineOverride(fee.order)}
                        className="p-2 rounded-lg text-xs font-bold bg-red-100 text-red-600 border border-red-300 hover:bg-red-200 transition-all duration-200 transform hover:-translate-y-0.5"
                        title="Cancel Fine Waiver / Override"
                      >
                        ✕
                      </button>
                    )}
                  </>
                )}
              </div>
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
  onEditLateFine,
  onCancelFineOverride,
  isAdmin,
  enrollmentDateStr,
  testDate,
}) => (
  <div
    className="overflow-x-auto rounded-xl border border-gray-700 shadow-sm"
    style={{
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "thin",
      scrollbarColor: "#4B5563 transparent",
    }}
  >
    <table className="w-full text-left border-collapse min-w-[800px]">
      <thead>
        <tr className="bg-gray-800 border-b border-gray-700 text-sm text-gray-300 uppercase tracking-wider">
          <th className="p-4 font-bold">S.No</th>
          <th className="p-4 font-bold">Component Type</th>
          <th className="p-4 font-bold">Due Date</th>
          <th className="p-4 font-bold text-right">Amount</th>
          <th className="p-4 font-bold text-right">Late Fine</th>
          <th className="p-4 font-bold text-center">Payment Date</th>
          <th className="p-4 font-bold text-center">Invoice No</th>
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
            onEditLateFine={onEditLateFine}
            onCancelFineOverride={onCancelFineOverride}
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
  const [testDate, setTestDate] = useState(""); // eslint-disable-line

  /* ================= MODAL STATE ================= */
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [showEditFineModal, setShowEditFineModal] = useState(false);
  const [editingFineData, setEditingFineData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  /* ================= DOWNLOAD DUE LIST ================= */
  const handleDownloadDueList = async (type = "cumulative") => {
    try {
      setLoading(true);
      toast.info(`Generating ${type} due list... please wait.`);
      const enrollmentsRef = collection(db, "enrollments");
      const snapshot = await getDocs(enrollmentsRef);

      let headers;
      if (type === "monthly") {
        headers = [
          "Roll Number",
          "Student Name",
          "Course",
          "Enrollment Date",
          "Pending Regular Fee",
          "Late Fine",
          "Total Due",
        ];
      } else {
        headers = [
          "Roll Number",
          "Student Name",
          "Course",
          "Enrollment Date",
          "Total Fee",
          "Total Paid",
          "Pending Regular Fee",
          "Late Fine",
          "Total Due",
        ];
      }

      const csvRows = [headers];

      let grandTotalFee = 0;
      let grandTotalPaid = 0;
      let grandTotalPendingRegular = 0;
      let grandTotalLateFine = 0;
      let grandTotalDue = 0;

      snapshot.forEach((docSnap) => {
        const student = { id: docSnap.id, ...docSnap.data() };
        if (!student.feeBreakdown || student.feeBreakdown.length === 0) return;

        const totals = calculateTotals(student.feeBreakdown, student.totalFee);
        const currentlyDueRegular = calculateCurrentlyDueRegular(
          student.feeBreakdown,
          student.dateOfEnrollment,
          testDate,
        );
        const totalLateFine = calculateTotalLateFine(
          student.feeBreakdown,
          student.dateOfEnrollment,
          testDate,
        );

        const pendingRegular =
          type === "monthly" ? currentlyDueRegular : totals.pending;
        const totalDue = pendingRegular + totalLateFine;

        if (totalDue > 0) {
          grandTotalFee += student.totalFee || 0;
          grandTotalPaid += totals.paid || 0;
          grandTotalPendingRegular += pendingRegular || 0;
          grandTotalLateFine += totalLateFine || 0;
          grandTotalDue += totalDue || 0;

          let rowData;
          if (type === "monthly") {
            rowData = [
              student.rollNo || "",
              student.name || "",
              student.course || "",
              student.dateOfEnrollment || "",
              pendingRegular || 0,
              totalLateFine || 0,
              totalDue || 0,
            ];
          } else {
            rowData = [
              student.rollNo || "",
              student.name || "",
              student.course || "",
              student.dateOfEnrollment || "",
              student.totalFee || 0,
              totals.paid || 0,
              pendingRegular || 0,
              totalLateFine || 0,
              totalDue || 0,
            ];
          }
          csvRows.push(rowData);
        }
      });

      if (csvRows.length === 1) {
        toast.success("No students with pending dues found!");
        setLoading(false);
        return;
      }

      // Add a blank row for visual spacing
      if (type === "monthly") {
        csvRows.push(["", "", "", "", "", "", ""]);

        // Add the Grand Total row
        csvRows.push([
          "GRAND TOTAL",
          "",
          "",
          "",
          grandTotalPendingRegular,
          grandTotalLateFine,
          grandTotalDue,
        ]);
      } else {
        csvRows.push(["", "", "", "", "", "", "", "", ""]);

        // Add the Grand Total row
        csvRows.push([
          "GRAND TOTAL",
          "",
          "",
          "",
          grandTotalFee,
          grandTotalPaid,
          grandTotalPendingRegular,
          grandTotalLateFine,
          grandTotalDue,
        ]);
      }

      const csvContent = csvRows.map((e) => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `student_${type}_due_list_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Due list downloaded successfully!");
    } catch (error) {
      console.error("Download Error: ", error);
      toast.error("Failed to generate due list");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GENERATE OLD STUDENT LEDGER ================= */
  const handleGenerateLedger = async () => {
    if (!currentStudent || !currentStudent.course) return;

    try {
      setLoading(true);
      const courseFeeData = courseFees.find(
        (c) => c.course_name?.toLowerCase() === currentStudent.course?.toLowerCase()
      );

      if (!courseFeeData) {
        toast.error(`Course fee details not found for ${currentStudent.course}`);
        setLoading(false);
        return;
      }

      const initialFeeBreakdown = courseFeeData.fee_breakdown.map((fee) => ({
        ...fee,
        isPaid: false,
        invoiceNo: "",
        paymentDate: "",
      }));

      const totalFeeAmount = courseFeeData.total_fee;

      await updateDoc(doc(db, "enrollments", currentStudent.id), {
        feeBreakdown: initialFeeBreakdown,
        totalFee: totalFeeAmount,
      });

      setCurrentStudent((prev) => ({
        ...prev,
        feeBreakdown: initialFeeBreakdown,
        totalFee: totalFeeAmount,
      }));

      toast.success("Fee ledger successfully generated for this student!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate fee ledger");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE STUDENT LEDGER ================= */
  const handleDeleteLedger = async () => {
    if (!isAdmin || !currentStudent) return;
    setShowDeleteModal(true);
  };

  const confirmDeleteLedger = async () => {
    try {
      setLoading(true);
      setShowDeleteModal(false);
      await updateDoc(doc(db, "enrollments", currentStudent.id), {
        feeBreakdown: null,
        totalFee: 0,
        isOneTimePaid: false,
      });

      setCurrentStudent((prev) => ({
        ...prev,
        feeBreakdown: null,
        totalFee: 0,
        isOneTimePaid: false,
      }));

      toast.success("Fee ledger deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete fee ledger");
    } finally {
      setLoading(false);
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
  const handlePaymentToggle = async (
    orderId,
    currentStatus,
    currentInvoice,
    currentDate,
    isEdit = false,
    lateFine = 0,
  ) => {
    if (!isAdmin || !currentStudent || !currentStudent.feeBreakdown) return;

    const feeToPay = currentStudent.feeBreakdown.find(
      (f) => f.order === orderId,
    );
    const amountNeeded = feeToPay
      ? feeToPay.amount - (feeToPay.partialPaid || 0)
      : 0;

    if (!currentStatus || isEdit) {
      // If marking as paid OR editing existing payment, show modal
      const defaultDate = testDate ? new Date(testDate) : new Date();
      setPendingPayment({
        orderId,
        currentInvoice,
        currentDate: currentDate || formatDateToDMY(defaultDate),
        baseAmount: isEdit ? feeToPay?.amount : amountNeeded,
        isEdit,
        lateFine,
        isLateFinePaid: feeToPay?.isLateFinePaid || false,
        lateFinePaidAmount: feeToPay?.lateFinePaidAmount || 0,
      });
      setShowInvoiceModal(true);
      return;
    }

    // If unpaying, proceed directly
    await processPayment(orderId, false, "", "");
  };

  const processPayment = async (
    orderId,
    newIsPaid,
    invoiceNo,
    paymentDateInput,
    paidAmount,
    paidFineAmount,
    isEdit = false,
    isFineOnly = false,
  ) => {
    if (newIsPaid || isEdit || isFineOnly) {
      if (!invoiceNo || !invoiceNo.trim()) {
        toast.error("Invoice number is required for a transaction.");
        return;
      }

      const invoiceStr = invoiceNo.trim();
      const originalFee = currentStudent.feeBreakdown.find(
        (f) => f.order === orderId,
      );
      const originalInvoice = originalFee ? originalFee.invoiceNo : null;

      // If the admin changed the invoice number or is providing a new one
      if (originalInvoice !== invoiceStr) {
        try {
          const enrollmentsRef = collection(db, "enrollments");
          const snapshot = await getDocs(enrollmentsRef);
          let isDuplicate = false;

          snapshot.forEach((docSnap) => {
            const student = docSnap.data();
            if (student.feeBreakdown) {
              student.feeBreakdown.forEach((f) => {
                if (f.invoiceNo && f.invoiceNo.trim() === invoiceStr) {
                  isDuplicate = true;
                }
              });
            }
          });

          if (isDuplicate) {
            toast.error(
              `Invoice number "${invoiceStr}" is already used in another transaction.`,
            );
            return;
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to verify invoice uniqueness.");
          return;
        }
      }
    }

    const defaultDate = testDate ? new Date(testDate) : new Date();
    const paymentDate = newIsPaid
      ? paymentDateInput || formatDateToDMY(defaultDate)
      : "";

    let updatedBreakdown = [...currentStudent.feeBreakdown];

    if (isFineOnly) {
      updatedBreakdown = updatedBreakdown.map((fee) =>
        fee.order === orderId
          ? {
              ...fee,
              isLateFinePaid: paidFineAmount > 0,
              lateFinePaidAmount: paidFineAmount > 0 ? paidFineAmount : 0,
            }
          : fee,
      );
    } else if (isEdit) {
      updatedBreakdown = updatedBreakdown.map((fee) =>
        fee.order === orderId
          ? {
              ...fee,
              invoiceNo,
              paymentDate,
              isLateFinePaid: paidFineAmount > 0,
              lateFinePaidAmount: paidFineAmount > 0 ? paidFineAmount : 0,
            }
          : fee,
      );
    } else if (newIsPaid) {
      let remaining = paidAmount;
      const startIndex = updatedBreakdown.findIndex((f) => f.order === orderId);

      if (startIndex !== -1) {
        for (let i = startIndex; i < updatedBreakdown.length; i++) {
          let fee = { ...updatedBreakdown[i] };
          let isTargetFee = fee.order === orderId;

          // Apply fine amount ONLY to the target fee
          if (isTargetFee && paidFineAmount !== undefined) {
            fee.isLateFinePaid = paidFineAmount > 0;
            fee.lateFinePaidAmount = paidFineAmount > 0 ? paidFineAmount : 0;
          }

          if (fee.isPaid) {
            updatedBreakdown[i] = fee;
            continue;
          }

          const needed = fee.amount - (fee.partialPaid || 0);

          if (remaining >= needed) {
            remaining -= needed;
            updatedBreakdown[i] = {
              ...fee,
              isPaid: true,
              partialPaid: 0,
              invoiceNo: isTargetFee ? invoiceNo : fee.invoiceNo || invoiceNo,
              paymentDate: isTargetFee
                ? paymentDate
                : fee.paymentDate || paymentDate,
            };
          } else if (remaining > 0) {
            updatedBreakdown[i] = {
              ...fee,
              partialPaid: (fee.partialPaid || 0) + remaining,
            };
            remaining = 0;
          } else {
            updatedBreakdown[i] = fee;
          }

          if (remaining <= 0 && i >= startIndex) {
            break;
          }
        }
      }
    } else {
      updatedBreakdown = updatedBreakdown.map((fee) =>
        fee.order === orderId
          ? {
              ...fee,
              isPaid: false,
              invoiceNo: "",
              paymentDate: "",
              partialPaid: 0,
            }
          : fee,
      );
    }

    // Optimistic update
    setCurrentStudent((prev) => ({
      ...prev,
      feeBreakdown: updatedBreakdown,
    }));

    try {
      await updateDoc(doc(db, "enrollments", currentStudent.id), {
        feeBreakdown: updatedBreakdown,
      });
      toast.success(newIsPaid ? "Payment recorded!" : "Payment removed!");
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
  const handleLateFineToggle = async (orderId, lateFine = 0) => {
    if (!isAdmin || !currentStudent || !currentStudent.feeBreakdown) return;

    const feeToPay = currentStudent.feeBreakdown.find(
      (f) => f.order === orderId,
    );
    if (!feeToPay) return;

    if (feeToPay.isLateFinePaid) {
      // Unpay fine directly
      const updatedBreakdown = currentStudent.feeBreakdown.map((fee) =>
        fee.order === orderId
          ? { ...fee, isLateFinePaid: false, lateFinePaidAmount: 0 }
          : fee,
      );

      setCurrentStudent((prev) => ({
        ...prev,
        feeBreakdown: updatedBreakdown,
      }));

      try {
        await updateDoc(doc(db, "enrollments", currentStudent.id), {
          feeBreakdown: updatedBreakdown,
        });
        toast.success("Late fine removed!");
      } catch {
        toast.error("Failed to update late fine");
        setCurrentStudent((prev) => ({
          ...prev,
          feeBreakdown: currentStudent.feeBreakdown,
        }));
      }
    } else {
      // Open modal to pay fine
      const defaultDate = testDate ? new Date(testDate) : new Date();
      setPendingPayment({
        orderId,
        currentInvoice: feeToPay.invoiceNo || "",
        currentDate: feeToPay.paymentDate || formatDateToDMY(defaultDate),
        baseAmount: feeToPay.amount,
        isEdit: false,
        isFineOnly: true,
        lateFine,
        isLateFinePaid: false,
        lateFinePaidAmount: lateFine, // default to full fine calculated
      });
      setShowInvoiceModal(true);
    }
  };

  /* ================= EDIT LATE FINE ================= */
  const handleEditLateFine = (orderId, currentFine) => {
    if (!isAdmin || !currentStudent || !currentStudent.feeBreakdown) return;
    setEditingFineData({ orderId, currentFine });
    setShowEditFineModal(true);
  };

  const confirmEditLateFine = async (newFine) => {
    if (isNaN(newFine) || newFine < 0) {
      toast.error("Invalid fine amount.");
      return;
    }

    const updatedBreakdown = currentStudent.feeBreakdown.map((fee) =>
      fee.order === editingFineData.orderId
        ? { ...fee, manualLateFine: newFine }
        : fee,
    );

    setCurrentStudent((prev) => ({
      ...prev,
      feeBreakdown: updatedBreakdown,
    }));

    try {
      await updateDoc(doc(db, "enrollments", currentStudent.id), {
        feeBreakdown: updatedBreakdown,
      });
      toast.success("Late fine updated!");
    } catch {
      toast.error("Failed to update late fine");
      setCurrentStudent((prev) => ({
        ...prev,
        feeBreakdown: currentStudent.feeBreakdown,
      }));
    }

    setShowEditFineModal(false);
  };

  const handleCancelFineOverride = async (orderId) => {
    if (!isAdmin || !currentStudent || !currentStudent.feeBreakdown) return;

    const confirmed = window.confirm("Are you sure you want to cancel the fine waiver/override and return to automatic calculation?");
    if (!confirmed) return;

    const updatedBreakdown = currentStudent.feeBreakdown.map((fee) => {
      if (fee.order === orderId) {
        const newFee = { ...fee };
        delete newFee.manualLateFine;
        return newFee;
      }
      return fee;
    });

    setCurrentStudent((prev) => ({
      ...prev,
      feeBreakdown: updatedBreakdown,
    }));

    try {
      await updateDoc(doc(db, "enrollments", currentStudent.id), {
        feeBreakdown: updatedBreakdown,
      });
      toast.success("Fine waiver cancelled!");
    } catch {
      toast.error("Failed to cancel fine waiver");
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
      "Are you sure you want to mark all fees as paid via a one-time payment? This will settle all installments and waive any accumulated late fines.",
    );
    if (!confirmed) return;

    const todayStr = formatDateToDMY(
      testDate ? new Date(testDate) : new Date(),
    );
    const updatedBreakdown = currentStudent.feeBreakdown.map((fee) => ({
      ...fee,
      isPaid: true,
      isLateFinePaid: true,
      paymentDate: fee.isPaid ? fee.paymentDate : todayStr,
      invoiceNo: fee.invoiceNo || `OTP-${Date.now().toString().slice(-6)}`,
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

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onConfirm={(invoiceNo, paymentDate, paidAmount, paidFineAmount) => {
          processPayment(
            pendingPayment.orderId,
            true,
            invoiceNo,
            paymentDate,
            paidAmount,
            paidFineAmount,
            pendingPayment.isEdit,
            pendingPayment.isFineOnly,
          );
          setShowInvoiceModal(false);
          setPendingPayment(null);
        }}
        initialInvoice={pendingPayment?.currentInvoice}
        initialDate={pendingPayment?.currentDate}
        baseAmount={pendingPayment?.baseAmount}
        isEdit={pendingPayment?.isEdit}
        isFineOnly={pendingPayment?.isFineOnly}
        lateFine={pendingPayment?.lateFine}
        isLateFinePaid={pendingPayment?.isLateFinePaid}
        lateFinePaidAmount={pendingPayment?.lateFinePaidAmount}
      />

      <EditFineModal
        isOpen={showEditFineModal}
        onClose={() => setShowEditFineModal(false)}
        onConfirm={confirmEditLateFine}
        currentFine={editingFineData?.currentFine || 0}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteLedger}
        studentName={currentStudent?.name}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Sleek Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-800/60 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-700 gap-4">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight text-center sm:text-left">
            {isAdmin ? "Admin Fee Management" : "My Fee Status"}
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-3 w-full sm:w-auto">
            {isAdmin && (
              <>
                <button
                  onClick={() => handleDownloadDueList("monthly")}
                  disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-5 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                  title="Download fees currently due up to this month"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {loading ? "Generating..." : "Monthly Due List"}
                </button>
                <button
                  onClick={() => handleDownloadDueList("cumulative")}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-5 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50"
                  title="Download total pending balance for the entire course"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {loading ? "Generating..." : "Cumulative Due List"}
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white border border-red-500 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.7)]"
            >
              Log Out
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                Find Student
              </h3>
              <div className="flex space-x-3">
                <div className="flex items-center flex-1 bg-gray-900/50 border border-gray-600 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all font-medium overflow-hidden">
                  <span className="pl-4 pr-1 text-gray-400 font-bold select-none">
                    AFT-
                  </span>
                  <input
                    type="text"
                    placeholder="101"
                    value={adminSearchRoll.replace(/^AFT-?/i, "")}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^AFT-?/i, "");
                      setAdminSearchRoll(val ? `AFT-${val}` : "");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminSearch()}
                    className="w-full py-3.5 pr-3.5 bg-transparent text-white placeholder-gray-500 outline-none"
                  />
                </div>
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
                    className="p-3 bg-gray-900/50 border border-yellow-500/30 rounded-xl text-yellow-400 focus:ring-2 focus:ring-yellow-500/50 outline-none font-medium w-full"
                  />
                </div>
                <span className="text-xs text-yellow-600/80 font-medium">
                  Fast-forward time to verify late fine generation.
                </span>
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

            {currentStudent.feeBreakdown &&
            currentStudent.feeBreakdown.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(() => {
                    const totals = calculateTotals(
                      currentStudent.feeBreakdown,
                      currentStudent.totalFee,
                    );
                    const totalLateFine = calculateTotalLateFine(
                      currentStudent.feeBreakdown,
                      currentStudent.dateOfEnrollment,
                      testDate,
                    );
                    const isFullyPaid =
                      totals.pending === 0 && totalLateFine === 0;
                    return (
                      <>
                        <SummaryCard
                          title="Total Paid"
                          amount={totals.paid}
                          textColor="text-green-400"
                        />
                        <SummaryCard
                          title="Total Pending"
                          amount={totals.pending + totalLateFine}
                          textColor="text-red-400"
                        />
                        <SummaryCard
                          title="Total Late Fine"
                          amount={totalLateFine}
                          textColor="text-yellow-400"
                        />
                        <OverallStatusCard isFullyPaid={isFullyPaid} />
                      </>
                    );
                  })()}
                </div>

                {isAdmin &&
                  (() => {
                    const totals = calculateTotals(
                      currentStudent.feeBreakdown,
                      currentStudent.totalFee,
                    );
                    const isFullyPaid = totals.pending === 0;
                    const courseInfo = courseFees.find(
                      (c) => c.course_name === currentStudent.course,
                    );
                    const oneTimeFee = courseInfo
                      ? courseInfo.one_time_fee
                      : null;

                    if (courseInfo && !isFullyPaid) {
                      return (
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center shadow-[0_8px_30px_rgba(234,179,8,0.05)] gap-4 transition-all hover:bg-yellow-500/10">
                          <div>
                            <h4 className="text-yellow-400 font-black text-xl mb-1 tracking-tight">
                              One-Time Payment Settlement
                            </h4>
                            <p className="text-gray-400 text-sm font-medium">
                              The one-time course fee is{" "}
                              <span className="text-white font-bold text-base">
                                ₹{oneTimeFee?.toLocaleString("en-IN")}
                              </span>
                              . If the student pays this amount in full, you can
                              instantly settle all remaining monthly dues and
                              late fines.
                            </p>
                          </div>
                          <button
                            onClick={handleOneTimePayment}
                            className="whitespace-nowrap bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-bold py-3.5 px-6 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all flex items-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                            Mark Fully Paid
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-700 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Payment Ledger
                    </h3>
                    {isAdmin && (
                      <button
                        onClick={handleDeleteLedger}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete Fee Ledger
                      </button>
                    )}
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-gray-700">
                    <FeeTable
                      paymentStatus={currentStudent.feeBreakdown}
                      onTogglePayment={handlePaymentToggle}
                      onToggleLateFinePayment={handleLateFineToggle}
                      onEditLateFine={handleEditLateFine}
                      onCancelFineOverride={handleCancelFineOverride}
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
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-2">
                  No Fee Records
                </h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  No fee distribution could be found for this student. This
                  usually happens if the student was enrolled prior to the
                  automated system.
                </p>
                {isAdmin && (
                  <button
                    onClick={handleGenerateLedger}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                  >
                    {loading ? "Generating..." : "Generate Fee Ledger"}
                  </button>
                )}
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
