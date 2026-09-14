import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getQuestions } from "../Backend/examService";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiX,
  FiPrinter,
  FiHelpCircle,
  FiCheck,
  FiLock,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiTarget,
  FiArrowRight,
  FiAward,
} from "react-icons/fi";

const StudentAnswerSheetModal = ({ assignment, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState("focus"); // 'focus' (1-by-1) | 'list' (all)
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'correct' | 'wrong' | 'unattempted'
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  useEffect(() => {
    const fetchExamQuestions = async () => {
      if (!assignment) return;
      setLoading(true);
      try {
        const qs = await getQuestions(
          assignment.courseId,
          assignment.semesterId,
          assignment.setId
        );

        let orderedQs = qs;
        // Re-order based on student's questionOrder if stored
        if (assignment.questionOrder && Array.isArray(assignment.questionOrder)) {
          const qMap = new Map(qs.map((q) => [q.id, q]));
          const sorted = [];
          assignment.questionOrder.forEach((id) => {
            if (qMap.has(id)) {
              sorted.push(qMap.get(id));
              qMap.delete(id);
            }
          });
          qMap.forEach((q) => sorted.push(q));
          orderedQs = sorted;
        }

        setQuestions(orderedQs);
      } catch (error) {
        console.error("Failed to load questions for answer sheet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamQuestions();
  }, [assignment]);

  const savedAnswers = useMemo(
    () => assignment?.savedAnswers || {},
    [assignment?.savedAnswers]
  );

  // Compute stats
  const { correctCount, wrongCount, unattemptedCount, wrongIndices } = useMemo(() => {
    let c = 0;
    let w = 0;
    let u = 0;
    const wIndices = [];

    questions.forEach((q, idx) => {
      const studentAns = savedAnswers[q.id];
      const correctAns = (q.correctAnswer || "").toUpperCase();
      if (!studentAns) {
        u += 1;
      } else if (studentAns.toUpperCase() === correctAns) {
        c += 1;
      } else {
        w += 1;
        wIndices.push(idx);
      }
    });

    return {
      correctCount: c,
      wrongCount: w,
      unattemptedCount: u,
      wrongIndices: wIndices,
    };
  }, [questions, savedAnswers]);

  const totalQuestions = questions.length || assignment?.totalQuestions || 0;
  const score =
    assignment?.score !== null && assignment?.score !== undefined
      ? assignment.score
      : correctCount;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPassed = percentage >= 33;

  // Filtered index list for List View and Palette
  const filteredIndices = useMemo(() => {
    return questions
      .map((q, idx) => {
        const sAns = savedAnswers[q.id];
        const cAns = (q.correctAnswer || "").toUpperCase();
        const isC = sAns && sAns.toUpperCase() === cAns;
        const isU = !sAns;
        const isW = sAns && !isC;

        if (activeFilter === "correct" && !isC) return null;
        if (activeFilter === "wrong" && !isW) return null;
        if (activeFilter === "unattempted" && !isU) return null;
        return idx;
      })
      .filter((idx) => idx !== null);
  }, [questions, savedAnswers, activeFilter]);

  // When activeFilter changes, adjust currentIndex if it's not in the filtered set
  useEffect(() => {
    if (filteredIndices.length > 0 && !filteredIndices.includes(currentIndex)) {
      setCurrentIndex(filteredIndices[0]);
    }
  }, [activeFilter, filteredIndices, currentIndex]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    const list = filteredIndices.length > 0 ? filteredIndices : questions.map((_, i) => i);
    const currentPos = list.indexOf(currentIndex);
    if (currentPos > 0) {
      setCurrentIndex(list[currentPos - 1]);
    }
  }, [filteredIndices, questions, currentIndex]);

  const handleNext = useCallback(() => {
    const list = filteredIndices.length > 0 ? filteredIndices : questions.map((_, i) => i);
    const currentPos = list.indexOf(currentIndex);
    if (currentPos >= 0 && currentPos < list.length - 1) {
      setCurrentIndex(list[currentPos + 1]);
    }
  }, [filteredIndices, questions, currentIndex]);

  // Jump to next mistake
  const handleNextMistake = () => {
    if (wrongIndices.length === 0) return;
    const nextMistake = wrongIndices.find((idx) => idx > currentIndex);
    if (nextMistake !== undefined) {
      setCurrentIndex(nextMistake);
    } else {
      setCurrentIndex(wrongIndices[0]);
    }
    setViewMode("focus");
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== "focus") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, handlePrev, handleNext, onClose]);

  const scrollToQuestion = (idx) => {
    setCurrentIndex(idx);
    setShowMobilePalette(false);
    if (viewMode === "list") {
      const el = document.getElementById(`list-q-${idx}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!assignment) return null;

  const currentQ = questions[currentIndex];
  const currentStudentAns = currentQ ? savedAnswers[currentQ.id] : null;
  const currentCorrectAns = currentQ ? (currentQ.correctAnswer || "").toUpperCase() : "";
  const isCurrentCorrect =
    currentStudentAns && currentStudentAns.toUpperCase() === currentCorrectAns;
  const isCurrentUnattempted = !currentStudentAns;

  const currentFilteredPos = filteredIndices.indexOf(currentIndex);
  const isFirst = currentFilteredPos <= 0;
  const isLast = currentFilteredPos >= filteredIndices.length - 1;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container */}
      <div className="relative w-full max-w-6xl h-[92vh] bg-gray-900 border border-gray-700/80 rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden text-white">
        {/* Print Stylesheet */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .answer-sheet-print-container, .answer-sheet-print-container * {
              visibility: visible;
            }
            .answer-sheet-print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* ===================== TOP HEADER ===================== */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-gray-900/95 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          {/* Exam & Student Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
              <FiAward size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {assignment.setTitle || "Exam"} Answer Sheet
                </h2>
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                  <FiLock size={11} /> Read-Only
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span className="text-gray-300 font-medium">
                  {assignment.studentName || "Student"}
                </span>
                <span>•</span>
                <span className="text-yellow-400 font-mono font-bold">
                  {assignment.rollNo}
                </span>
                {assignment.courseName && (
                  <>
                    <span>•</span>
                    <span className="hidden sm:inline text-gray-400">
                      {assignment.courseName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controls: Mode Switch, Mobile Palette, Print, Close */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-gray-800 p-1 rounded-xl border border-gray-700/80 flex items-center">
              <button
                onClick={() => setViewMode("focus")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === "focus"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Review one question at a time"
              >
                <FiTarget size={13} />
                <span className="hidden sm:inline">Focus Mode</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Scroll all questions in list"
              >
                <FiLayers size={13} />
                <span className="hidden sm:inline">All Questions</span>
              </button>
            </div>

            {/* Mobile Palette Toggle Button */}
            <button
              onClick={() => setShowMobilePalette(!showMobilePalette)}
              className="lg:hidden px-3 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-400 font-bold rounded-xl border border-gray-700 text-xs flex items-center gap-1"
            >
              Palette
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700 transition"
              title="Print Answer Sheet"
            >
              <FiPrinter size={16} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl border border-gray-700 hover:border-red-500/40 transition"
              title="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* ===================== BODY AREA (2 COLUMNS) ===================== */}
        <div className="flex-1 flex overflow-hidden relative answer-sheet-print-container">
          {/* LEFT / MAIN PANEL: Question Content */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-gray-950/40">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium">Loading your exam sheet...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <FiHelpCircle size={44} className="text-gray-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-300">No Questions Found</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Could not retrieve the questions for this examination set.
                </p>
              </div>
            ) : viewMode === "focus" && currentQ ? (
              /* ================== FOCUS MODE: ONE QUESTION AT A TIME ================== */
              <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
                <div className="space-y-6">
                  {/* Question Top Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-800/80">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-mono font-black px-3 py-1 rounded-xl">
                        Question {(currentIndex + 1).toString().padStart(2, "0")} /{" "}
                        {questions.length.toString().padStart(2, "0")}
                      </span>

                      {/* Question Status Badge */}
                      {isCurrentCorrect ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                          <FiCheckCircle size={14} /> Correct (+1 Mark)
                        </span>
                      ) : isCurrentUnattempted ? (
                        <span className="bg-gray-800 text-gray-400 border border-gray-700 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <FiAlertCircle size={14} /> Not Attempted (0 Marks)
                        </span>
                      ) : (
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                          <FiXCircle size={14} /> Incorrect (0 Marks)
                        </span>
                      )}

                      {/* Active Filter Scope Tag */}
                      {activeFilter !== "all" && (
                        <span className="text-[11px] text-gray-400 font-medium bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700">
                          {currentFilteredPos + 1} of {filteredIndices.length} in{" "}
                          <strong className="text-white capitalize">{activeFilter}</strong>
                        </span>
                      )}
                    </div>

                    {/* Quick Mistakes Shortcut Button */}
                    {wrongIndices.length > 0 && (
                      <button
                        onClick={handleNextMistake}
                        className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 font-bold px-3 py-1 rounded-xl transition flex items-center gap-1.5"
                        title="Jump to the next question you got wrong"
                      >
                        Review Mistakes ({wrongIndices.length}) <FiArrowRight size={12} />
                      </button>
                    )}
                  </div>

                  {/* Question Prompt */}
                  <div className="bg-gray-900/90 border border-gray-800 p-5 sm:p-7 rounded-3xl space-y-3 shadow-lg">
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                      {currentQ.text}
                    </h3>
                    {currentQ.textHindi && (
                      <div className="pt-2 border-t border-gray-800/60 flex items-start gap-2.5">
                        <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-500/20 uppercase tracking-wider shrink-0 mt-1">
                          हिन्दी
                        </span>
                        <p className="text-base text-gray-300 font-medium leading-relaxed">
                          {currentQ.textHindi}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Options (Read-Only) */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                      Options & Verification:
                    </div>
                    {["A", "B", "C", "D"].map((key) => {
                      const optText = currentQ.options?.[key];
                      if (!optText) return null;
                      const optHindi = currentQ.optionsHindi?.[key];

                      const isOptionCorrect = key === currentCorrectAns;
                      const isOptionStudentChoice =
                        currentStudentAns && currentStudentAns.toUpperCase() === key;

                      let cardStyle = "bg-gray-900/60 border-gray-800 text-gray-300";
                      let badge = null;
                      let badgeIcon = null;

                      if (isOptionCorrect && isOptionStudentChoice) {
                        // Correct choice made by student
                        cardStyle =
                          "bg-emerald-500/15 border-emerald-500/60 text-emerald-100 ring-1 ring-emerald-500/30 shadow-md shadow-emerald-500/5";
                        badge = "Your Answer (Correct)";
                        badgeIcon = <FiCheck size={13} />;
                      } else if (isOptionCorrect && !isOptionStudentChoice) {
                        // Missed correct answer
                        cardStyle =
                          "bg-emerald-500/10 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/20";
                        badge = "Correct Answer";
                        badgeIcon = <FiCheck size={13} />;
                      } else if (isOptionStudentChoice && !isOptionCorrect) {
                        // Wrong option selected by student
                        cardStyle =
                          "bg-rose-500/15 border-rose-500/60 text-rose-100 ring-1 ring-rose-500/30";
                        badge = "Your Choice (Wrong)";
                        badgeIcon = <FiX size={13} />;
                      }

                      return (
                        <div
                          key={key}
                          className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none select-none ${cardStyle}`}
                        >
                          <div className="flex items-start gap-3.5">
                            <span
                              className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                                isOptionCorrect
                                  ? "bg-emerald-500 text-gray-950 font-black shadow-md shadow-emerald-500/20"
                                  : isOptionStudentChoice
                                  ? "bg-rose-500 text-white font-black shadow-md shadow-rose-500/20"
                                  : "bg-gray-800 text-gray-400 border border-gray-700"
                              }`}
                            >
                              {key}
                            </span>
                            <div>
                              <div className="text-sm sm:text-base font-semibold text-white">
                                {optText}
                              </div>
                              {optHindi && (
                                <div className="text-xs sm:text-sm text-gray-400 mt-0.5">
                                  {optHindi}
                                </div>
                              )}
                            </div>
                          </div>

                          {badge && (
                            <div className="self-end sm:self-center shrink-0">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                                  isOptionCorrect && isOptionStudentChoice
                                    ? "bg-emerald-500 text-gray-950 font-black"
                                    : isOptionCorrect
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500 text-white font-black"
                                }`}
                              >
                                {badgeIcon} {badge}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Feedback Callout */}
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center gap-3 ${
                      isCurrentCorrect
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : isCurrentUnattempted
                        ? "bg-gray-800/60 border-gray-700/80 text-gray-300"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                    }`}
                  >
                    <div className="shrink-0">
                      {isCurrentCorrect ? (
                        <FiCheckCircle size={20} className="text-emerald-400" />
                      ) : isCurrentUnattempted ? (
                        <FiAlertCircle size={20} className="text-gray-400" />
                      ) : (
                        <FiXCircle size={20} className="text-rose-400" />
                      )}
                    </div>
                    <div>
                      {isCurrentCorrect && (
                        <span>
                          <strong>Well done!</strong> You chose{" "}
                          <strong>Option {currentStudentAns?.toUpperCase()}</strong> which is the
                          correct answer.
                        </span>
                      )}
                      {isCurrentUnattempted && (
                        <span>
                          <strong>Unattempted:</strong> You skipped this question. The correct answer
                          was <strong>Option {currentCorrectAns}</strong>.
                        </span>
                      )}
                      {!isCurrentCorrect && !isCurrentUnattempted && (
                        <span>
                          <strong>Incorrect:</strong> You marked{" "}
                          <strong>Option {currentStudentAns?.toUpperCase()}</strong>, but the correct
                          answer is <strong>Option {currentCorrectAns}</strong>.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Prev / Next Navigation Bar */}
                <div className="pt-6 mt-6 border-t border-gray-800 flex items-center justify-between gap-4 no-print">
                  <button
                    onClick={handlePrev}
                    disabled={isFirst}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition border ${
                      isFirst
                        ? "bg-gray-800/40 text-gray-600 border-gray-800 cursor-not-allowed"
                        : "bg-gray-800 hover:bg-gray-700 text-white border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <FiChevronLeft size={16} /> Previous Question
                  </button>

                  <div className="text-xs text-gray-500 hidden md:block">
                    Tip: Use <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-300">←</kbd> and <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-300">→</kbd> arrow keys to navigate
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={isLast}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition border ${
                      isLast
                        ? "bg-gray-800/40 text-gray-600 border-gray-800 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-600/20"
                    }`}
                  >
                    Next Question <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* ================== LIST MODE: ALL QUESTIONS STREAM ================== */
              <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
                {filteredIndices.length === 0 ? (
                  <div className="text-center py-20 bg-gray-900/60 rounded-3xl border border-gray-800">
                    <FiHelpCircle size={40} className="mx-auto text-gray-600 mb-3" />
                    <h3 className="text-base font-bold text-gray-400">
                      No questions match this filter
                    </h3>
                    <button
                      onClick={() => setActiveFilter("all")}
                      className="mt-3 text-xs text-blue-400 hover:underline font-bold"
                    >
                      Reset Filter to All Questions
                    </button>
                  </div>
                ) : (
                  filteredIndices.map((origIdx) => {
                    const q = questions[origIdx];
                    const sAns = savedAnswers[q.id];
                    const cAns = (q.correctAnswer || "").toUpperCase();
                    const isC = sAns && sAns.toUpperCase() === cAns;
                    const isU = !sAns;

                    return (
                      <div
                        key={q.id}
                        id={`list-q-${origIdx}`}
                        className={`p-5 sm:p-6 rounded-3xl border transition ${
                          isC
                            ? "bg-gray-900/80 border-emerald-500/25"
                            : isU
                            ? "bg-gray-900/80 border-gray-800"
                            : "bg-gray-900/80 border-rose-500/25"
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-800 text-yellow-400 font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-gray-700">
                              Q{(origIdx + 1).toString().padStart(2, "0")}
                            </span>
                            {isC ? (
                              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-flex items-center gap-1">
                                <FiCheckCircle size={12} /> Correct (+1 Mark)
                              </span>
                            ) : isU ? (
                              <span className="bg-gray-800 text-gray-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-gray-700 inline-flex items-center gap-1">
                                <FiAlertCircle size={12} /> Not Attempted (0 Marks)
                              </span>
                            ) : (
                              <span className="bg-rose-500/20 text-rose-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-500/30 inline-flex items-center gap-1">
                                <FiXCircle size={12} /> Incorrect (0 Marks)
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-gray-400">
                            Your Answer:{" "}
                            <span
                              className={`font-black font-mono ${
                                isC
                                  ? "text-emerald-400"
                                  : isU
                                  ? "text-gray-500 italic"
                                  : "text-rose-400"
                              }`}
                            >
                              {sAns ? `Option ${sAns.toUpperCase()}` : "None"}
                            </span>
                          </div>
                        </div>

                        {/* Text */}
                        <h4 className="text-base font-bold text-white leading-relaxed mb-2">
                          {q.text}
                        </h4>
                        {q.textHindi && (
                          <p className="text-sm text-yellow-300/80 mb-4 font-medium">
                            {q.textHindi}
                          </p>
                        )}

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2 pt-2">
                          {["A", "B", "C", "D"].map((key) => {
                            const optText = q.options?.[key];
                            if (!optText) return null;
                            const isOptCorrect = key === cAns;
                            const isOptStudent = sAns && sAns.toUpperCase() === key;

                            let optStyle = "bg-gray-800/40 border-gray-800 text-gray-300";
                            let tag = null;

                            if (isOptCorrect && isOptStudent) {
                              optStyle =
                                "bg-emerald-500/15 border-emerald-500/60 text-emerald-200 ring-1 ring-emerald-500/30";
                              tag = "✓ Correct & Your Choice";
                            } else if (isOptCorrect && !isOptStudent) {
                              optStyle =
                                "bg-emerald-500/10 border-emerald-500/40 text-emerald-300";
                              tag = "✓ Correct Answer";
                            } else if (isOptStudent && !isOptCorrect) {
                              optStyle =
                                "bg-rose-500/15 border-rose-500/60 text-rose-200 ring-1 ring-rose-500/30";
                              tag = "✗ Your Choice";
                            }

                            return (
                              <div
                                key={key}
                                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 pointer-events-none select-none ${optStyle}`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                      isOptCorrect
                                        ? "bg-emerald-500 text-gray-950 font-black"
                                        : isOptStudent
                                        ? "bg-rose-500 text-white font-black"
                                        : "bg-gray-800 text-gray-400"
                                    }`}
                                  >
                                    {key}
                                  </span>
                                  <span>{optText}</span>
                                </div>
                                {tag && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 shrink-0">
                                    {tag}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* ===================== RIGHT SIDEBAR: PALETTE & SCORE ===================== */}
          <div
            className={`w-80 border-l border-gray-800 bg-gray-900/95 flex flex-col shrink-0 lg:static absolute inset-y-0 right-0 z-20 transition-transform duration-200 no-print ${
              showMobilePalette ? "translate-x-0 shadow-2xl" : "translate-x-full lg:translate-x-0"
            }`}
          >
            {/* Mobile Close Button for Palette */}
            <div className="p-3 border-b border-gray-800 flex items-center justify-between lg:hidden">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Question Palette
              </span>
              <button
                onClick={() => setShowMobilePalette(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Score & Metric Card */}
            <div className="p-5 border-b border-gray-800/80 bg-gray-950/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Exam Result
                </span>
                <span
                  className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isPassed
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}
                </span>
              </div>

              {/* Big Score Counter */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black text-yellow-400 font-mono tracking-tight">
                  {score}
                </span>
                <span className="text-sm text-gray-400 font-medium">/ {totalQuestions} Marks</span>
                <span className="ml-auto text-lg font-black text-white font-mono">
                  {percentage}%
                </span>
              </div>

              {/* Metric Badges */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">Correct</div>
                  <div className="text-lg font-black text-emerald-400">{correctCount}</div>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                  <div className="text-[10px] font-bold text-rose-400 uppercase">Wrong</div>
                  <div className="text-lg font-black text-rose-400">{wrongCount}</div>
                </div>
                <div className="bg-gray-800/60 border border-gray-700/60 p-2 rounded-xl">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Skipped</div>
                  <div className="text-lg font-black text-gray-300">{unattemptedCount}</div>
                </div>
              </div>
            </div>

            {/* Filter Tabs on Palette */}
            <div className="p-3 border-b border-gray-800/80 bg-gray-900/60">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Filter Questions:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                    activeFilter === "all"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-800/60 text-gray-400 hover:text-white"
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  onClick={() => setActiveFilter("correct")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                    activeFilter === "correct"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-800/60 text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                >
                  Correct ({correctCount})
                </button>
                <button
                  onClick={() => setActiveFilter("wrong")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                    activeFilter === "wrong"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-gray-800/60 text-rose-400 hover:bg-rose-500/10"
                  }`}
                >
                  Wrong ({wrongCount})
                </button>
                <button
                  onClick={() => setActiveFilter("unattempted")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                    activeFilter === "unattempted"
                      ? "bg-gray-700 text-white shadow-sm"
                      : "bg-gray-800/60 text-gray-400 hover:text-white"
                  }`}
                >
                  Skipped ({unattemptedCount})
                </button>
              </div>
            </div>

            {/* Numbered Palette Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Question Navigator:</span>
                <span className="text-[10px] text-gray-500 lowercase font-normal">
                  click to view
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const sAns = savedAnswers[q.id];
                  const cAns = (q.correctAnswer || "").toUpperCase();
                  const isC = sAns && sAns.toUpperCase() === cAns;
                  const isU = !sAns;
                  const isW = sAns && !isC;

                  // Filter visibility
                  if (activeFilter === "correct" && !isC) return null;
                  if (activeFilter === "wrong" && !isW) return null;
                  if (activeFilter === "unattempted" && !isU) return null;

                  const isCurrent = idx === currentIndex && viewMode === "focus";

                  let btnStyle = "";
                  if (isC) {
                    btnStyle =
                      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30";
                  } else if (isU) {
                    btnStyle =
                      "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700/80";
                  } else {
                    btnStyle =
                      "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30";
                  }

                  if (isCurrent) {
                    btnStyle =
                      "bg-yellow-500 text-gray-950 font-black border-2 border-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.5)] scale-105 ring-2 ring-yellow-400/40";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => scrollToQuestion(idx)}
                      className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center ${btnStyle}`}
                      title={`Question ${idx + 1}: ${
                        isC ? "Correct" : isU ? "Not Attempted" : "Incorrect"
                      }`}
                    >
                      {(idx + 1).toString().padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend Footer */}
            <div className="p-3 border-t border-gray-800 bg-gray-950/60 text-[11px] text-gray-400 flex items-center justify-around">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Correct
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Wrong
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-700 inline-block" /> Skipped
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnswerSheetModal;
