import React, { useState, useEffect } from "react";
import { db } from "../Backend/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const UnlockCountdown = ({ submittedAt, onUnlock }) => {
  const [timeLeftStr, setTimeLeftStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      if (!submittedAt) return;
      const submissionTime = submittedAt.seconds ? submittedAt.seconds * 1000 : new Date(submittedAt).getTime();
      const releaseTime = submissionTime + 24 * 60 * 60 * 1000;
      const remainingMs = releaseTime - Date.now();

      if (remainingMs <= 0) {
        setTimeLeftStr("");
        if (onUnlock) onUnlock();
        return;
      }

      const hours = Math.floor(remainingMs / (3600 * 1000));
      const minutes = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
      setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [submittedAt, onUnlock]);

  if (!timeLeftStr) return null;

  return (
    <span className="text-xs text-yellow-500 font-semibold block mt-1">
      Unlocks in {timeLeftStr}
    </span>
  );
};

const StudentExamMarksModal = ({ student, onClose }) => {
  const marks = student?.marks;
  const [onlineExams, setOnlineExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  useEffect(() => {
    if (student?.rollNo) {
      fetchOnlineExams(student.rollNo);
    }
  }, [student]);

  const fetchOnlineExams = async (rollNo) => {
    setLoadingExams(true);
    try {
      const q = query(
        collection(db, "exam_assignments"),
        where("rollNo", "==", rollNo),
        where("status", "==", "completed")
      );
      const snapshot = await getDocs(q);
      const exams = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      const enrichedExams = await Promise.all(exams.map(async (exam) => {
        if (exam.totalQuestions !== undefined) {
          return exam;
        }
        if (exam.questionOrder && exam.questionOrder.length > 0) {
          return { ...exam, totalQuestions: exam.questionOrder.length };
        }
        try {
          const questionsQ = query(
            collection(db, "exam_questions"),
            where("setId", "==", exam.setId)
          );
          const qSnapshot = await getDocs(questionsQ);
          return { ...exam, totalQuestions: qSnapshot.size };
        } catch (e) {
          console.error("Error fetching questions count for fallback:", e);
          return { ...exam, totalQuestions: 0 };
        }
      }));

      setOnlineExams(enrichedExams);
    } catch (error) {
      console.error("Failed to fetch online exams:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const instituteName = "AIESECI";
  const instituteAddress = "Anpara, Auri More";
  const isReleaseTimePassed = (submittedAt) => {
    if (!submittedAt) return false;
    const submissionTime = submittedAt.seconds ? submittedAt.seconds * 1000 : new Date(submittedAt).getTime();
    const releaseTime = submissionTime + 24 * 60 * 60 * 1000;
    return Date.now() >= releaseTime;
  };

  const releasedOnlineExams = onlineExams.filter(exam => isReleaseTimePassed(exam.submittedAt));

  // Calculate total statistics
  const totalOfflineMarks = marks ? Object.values(marks).reduce((acc, sem) => acc + sem.obtainedMarks, 0) : 0;
  const totalOfflineMax = marks ? Object.values(marks).reduce((acc, sem) => acc + sem.totalMarks, 0) : 0;

  const totalOnlineMarks = releasedOnlineExams.reduce((acc, exam) => acc + (exam.score || 0), 0);
  const totalOnlineMax = releasedOnlineExams.reduce((acc, exam) => acc + (exam.totalQuestions || 0), 0);

  const grandTotalObtained = totalOfflineMarks + totalOnlineMarks;
  const grandTotalMax = totalOfflineMax + totalOnlineMax;

  const totalExamsCount = (marks ? Object.keys(marks).length : 0) + releasedOnlineExams.length;

  const passedOffline = marks ? Object.values(marks).filter((sem) => (sem.obtainedMarks / sem.totalMarks) * 100 >= 30).length : 0;
  const passedOnline = releasedOnlineExams.filter((exam) => {
    const total = exam.totalQuestions || 0;
    return total > 0 && ((exam.score || 0) / total) * 100 >= 30;
  }).length;

  const totalPassed = passedOffline + passedOnline;

  const overallPercentage = grandTotalMax > 0 ? ((grandTotalObtained / grandTotalMax) * 100).toFixed(2) : 0;

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();

      // Set Title Font / Style
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("AIESECI COMPUTER INSTITUTE", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Anpara, Auri More", 14, 25);
      doc.text(`Date of Issue: ${new Date().toLocaleDateString("en-IN")}`, 14, 30);

      // Draw horizontal line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(14, 34, 196, 34);

      // Student info block
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("STUDENT REPORT CARD", 14, 43);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Student Name:  ${student?.name || "N/A"}`, 14, 50);
      doc.text(`Roll Number:   ${student?.rollNo || "N/A"}`, 14, 55);
      doc.text(`Father's Name: ${student?.fatherName || "N/A"}`, 120, 50);
      doc.text(`Date of Birth: ${student?.dob || "N/A"}`, 120, 55);

      // Table headers
      const headers = [["Exam / Semester", "Type", "Max Marks", "Obtained", "Percentage", "Result"]];
      const rows = [];

      // Offline Marks
      if (marks) {
        Object.keys(marks).forEach((semester) => {
          const total = marks[semester].totalMarks;
          const obtained = marks[semester].obtainedMarks;
          const pct = ((obtained / total) * 100).toFixed(2);
          rows.push([
            semester.replace("semester", "Semester "),
            "Offline",
            total.toString(),
            obtained.toString(),
            `${pct}%`,
            pct >= 30 ? "PASS" : "FAIL"
          ]);
        });
      }

      // Online Marks
      onlineExams.forEach((exam) => {
        const released = isReleaseTimePassed(exam.submittedAt);
        if (released) {
          const total = exam.totalQuestions || 0;
          const obtained = exam.score;
          const pct = total > 0 ? ((obtained / total) * 100).toFixed(2) : "0.00";
          rows.push([
            exam.setTitle,
            "Online",
            total.toString(),
            obtained.toString(),
            `${pct}%`,
            total > 0 && pct >= 30 ? "PASS" : "FAIL"
          ]);
        } else {
          rows.push([
            exam.setTitle,
            "Online",
            "-",
            "-",
            "-",
            "LOCKED"
          ]);
        }
      });

      // Using autoTable to draw the results
      autoTable(doc, {
        startY: 63,
        head: headers,
        body: rows,
        theme: "striped",
        headStyles: {
          fillColor: [79, 70, 229], // Indigo 600
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3.5,
        },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 20 },
          2: { halign: "center", cellWidth: 25 },
          3: { halign: "center", cellWidth: 25 },
          4: { halign: "center", cellWidth: 25 },
          5: { halign: "center", cellWidth: 25 },
        }
      });

      // Draw overall performance summary
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("OVERALL PERFORMANCE SUMMARY", 14, finalY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Total Exams Taken:  ${totalExamsCount}`, 14, finalY + 7);
      doc.text(`Passed Exams:       ${totalPassed}`, 14, finalY + 13);
      doc.text(`Overall Percentage:  ${overallPercentage}%`, 14, finalY + 19);

      // Save PDF
      const fileName = `${(student?.name || "student").toLowerCase().replace(/\s+/g, "_")}_report_card.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Failed to generate report card PDF:", error);
      alert("Failed to generate report card PDF. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="bg-gradient-to-br mt-[4.2rem] from-gray-900 to-gray-800 rounded-xl w-[500px] max-h-[85vh] overflow-y-auto hide-scrollbar shadow-2xl border border-gray-700">
        {/* Header with Institute Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white">{instituteName}</h2>
              <p className="text-blue-100 text-sm mt-1 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {instituteAddress}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors flex items-center gap-1 text-xs font-bold bg-white/10 px-2.5 py-1.5 border border-white/20 shadow-sm"
                title="Download report card PDF"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PDF
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
              >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

        {/* Student Profile Card */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {student?.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white flex items-center flex-wrap gap-2">
                <span>{student?.name}</span>
                {student?.rollNo && (
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
                    {student.rollNo}
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-gray-400">Father's Name</span>
                  <p className="text-white font-medium">
                    {student?.fatherName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Date of Birth</span>
                  <p className="text-white font-medium">{student?.dob}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats (if marks or online exams exist) */}
        {((marks && Object.keys(marks).length > 0) || releasedOnlineExams.length > 0) && (
          <div className="grid grid-cols-3 gap-3 p-5 bg-gray-800/50">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Total Exams</p>
              <p className="text-2xl font-bold text-white">{totalExamsCount}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Exams Passed</p>
              <p className="text-2xl font-bold text-green-400">
                {totalPassed}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Overall</p>
              <p className="text-2xl font-bold text-blue-400">
                {overallPercentage}%
              </p>
            </div>
          </div>
        )}

        {/* Marks Section */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            Academic Performance
          </h3>

          {loadingExams ? (
            <div className="text-center py-8">
              <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Loading online exam marks...</p>
            </div>
          ) : (!marks && onlineExams.length === 0) ? (
            <div className="text-center py-8 bg-gray-800/50 rounded-lg">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-yellow-400 font-medium">
                Marks not uploaded yet
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Manual/Offline Semester Marks */}
              {marks && Object.keys(marks).length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Semester Marks (Offline)
                  </h4>
                  {Object.keys(marks).map((semester) => {
                    const total = marks[semester].totalMarks;
                    const obtained = marks[semester].obtainedMarks;
                    const percentage = ((obtained / total) * 100).toFixed(2);
                    const isFail = percentage < 30;

                    return (
                      <div
                        key={semester}
                        className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-blue-400">
                            {semester.replace("semester", "Semester ")}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isFail
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {isFail ? "FAIL" : "PASS"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Marks</span>
                            <span className="text-white font-medium">{total}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Marks Obtained</span>
                            <span className="text-white font-medium">
                              {obtained}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Percentage</span>
                            <span className="text-white font-medium">
                              {percentage}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-2">
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  isFail ? "bg-red-500" : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Online Exam Marks */}
              {onlineExams.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Online Exam Marks
                  </h4>
                  {onlineExams.map((exam) => {
                    const total = exam.totalQuestions || 0;
                    const obtained = exam.score;
                    const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : "0.00";
                    const isFail = total > 0 && percentage < 30;
                    const released = isReleaseTimePassed(exam.submittedAt);

                    return (
                      <div
                        key={exam.id}
                        className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-purple-400">
                            {exam.setTitle}
                          </h4>
                          {released ? (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isFail
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {isFail ? "FAIL" : "PASS"}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">
                              Locked
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Course / Semester</span>
                            <span className="text-white font-medium">{exam.courseName} • {exam.semesterName}</span>
                          </div>

                          {released ? (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Marks</span>
                                <span className="text-white font-medium">{total}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Marks Obtained</span>
                                <span className="text-white font-medium">{obtained}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Percentage</span>
                                <span className="text-white font-medium">{percentage}%</span>
                              </div>

                              {/* Progress Bar */}
                              <div className="mt-2">
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      isFail ? "bg-red-500" : "bg-green-500"
                                    }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 text-center mt-2">
                              <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider block mb-1">
                                Marks Unlock Countdown
                              </span>
                              <UnlockCountdown 
                                submittedAt={exam.submittedAt}
                                onUnlock={() => fetchOnlineExams(student.rollNo)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentExamMarksModal;
