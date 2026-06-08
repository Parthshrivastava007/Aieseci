import React, { useState, useEffect, useRef } from "react";
import {
  getStudentAssignments,
  getQuestions,
  submitExam,
  getSecuritySettings,
  saveExamProgress,
  getAssignment,
} from "../Backend/examService";
import { toast } from "react-toastify";
import { FiCheckCircle, FiPlayCircle, FiAward, FiLock } from "react-icons/fi";
import LogoAiseci from "../assets/Images/LogoAiseci.png";

const StudentExamPortal = ({ name, rollNumber }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exam Mode States
  const [activeExam, setActiveExam] = useState(null); // The assignment being taken
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionKey }
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const maxViolations = 3;

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // PIN Security States
  const [pinRequired, setPinRequired] = useState(false); //eslint-disable-line
  const [dbPin, setDbPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [examToUnlock, setExamToUnlock] = useState(null);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const settings = await getSecuritySettings();
      setDbPin(settings.accessPin);
      setPinRequired(settings.isEnabled);
    } catch (error) {
      console.error("Failed to load security settings:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [rollNumber]); //eslint-disable-line

  useEffect(() => {
    let timer;
    if (activeExam && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          if (next % 30 === 0) {
            saveExamProgress(activeExam.id, answersRef.current, next).catch(console.error);
          }
          return next;
        });
      }, 1000);
    } else if (activeExam && timeLeft === 0) {
      handleAutoSubmit();
    }
    return () => clearInterval(timer);
  }, [activeExam]); //eslint-disable-line

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const formattedRoll = rollNumber.toUpperCase().includes("AFT-")
        ? rollNumber.replace(/\s+/g, "").toUpperCase()
        : `AFT-${rollNumber}`.replace(/\s+/g, "").toUpperCase();

      console.log("Fetching assignments for:", formattedRoll);
      const data = await getStudentAssignments(formattedRoll);
      console.log("Fetched assignments:", data);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load your exams. (Permission Denied?)");
    } finally {
      setLoading(false);
    }
  };

  const startExam = async (assignment) => {
    if (assignment.status === "completed") {
      toast.info("You have already completed this exam.");
      return;
    }

    try {
      const settings = await getSecuritySettings();
      if (settings.isEnabled && settings.accessPin) {
        setDbPin(settings.accessPin);
        setPinRequired(true);
        setExamToUnlock(assignment);
        setShowPinModal(true);
        return;
      }
    } catch (e) {
      console.error("Security PIN check failed:", e);
    }

    await performStartExam(assignment);
  };

  const performStartExam = async (assignment) => {
    setLoading(true);
    try {
      // Fetch latest assignment snapshot to resume progress if applicable
      const latestAssignment = await getAssignment(assignment.id);
      const activeAssignment = latestAssignment || assignment;

      const qs = await getQuestions(
        activeAssignment.courseId,
        activeAssignment.semesterId,
        activeAssignment.setId,
      );
      if (qs.length === 0) {
        toast.error(
          "No questions found for this exam. Contact your administrator.",
        );
        setLoading(false);
        return;
      }
      let orderedQs = qs;
      if (activeAssignment.questionOrder && Array.isArray(activeAssignment.questionOrder)) {
        const qMap = new Map(qs.map((q) => [q.id, q]));
        const sortedQs = [];
        activeAssignment.questionOrder.forEach((id) => {
          if (qMap.has(id)) {
            sortedQs.push(qMap.get(id));
            qMap.delete(id);
          }
        });
        qMap.forEach((q) => sortedQs.push(q));
        orderedQs = sortedQs;
      }
      setQuestions(orderedQs);

      const savedAnswers = activeAssignment.savedAnswers || {};
      const savedTimeLeft = activeAssignment.timeLeft !== undefined
        ? activeAssignment.timeLeft
        : (activeAssignment.duration || 90) * 60;

      setAnswers(savedAnswers);
      setTimeLeft(savedTimeLeft);
      setCurrentQuestionIndex(0);
      setActiveExam(activeAssignment);

      // Save initial/in-progress status to Firestore
      await saveExamProgress(activeAssignment.id, savedAnswers, savedTimeLeft);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load exam questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPinAndStart = async () => {
    if (enteredPin.trim() === dbPin.trim()) {
      setShowPinModal(false);
      setEnteredPin("");
      const targetExam = examToUnlock;
      setExamToUnlock(null);
      await performStartExam(targetExam);
    } else {
      toast.error("Invalid Access PIN. Please ask the instructor.");
    }
  };

  const handleOptionSelect = (questionId, optionKey) => {
    const nextAnswers = { ...answers, [questionId]: optionKey };
    setAnswers(nextAnswers);
    if (activeExam) {
      saveExamProgress(activeExam.id, nextAnswers, timeLeft).catch(console.error);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score += 1; // Assuming 1 mark per question
      }
    });
    return score;
  };

  const handleAutoSubmit = async () => {
    toast.info("Time is up! Auto-submitting your exam...");
    await performSubmit();
  };

  const handleManualSubmit = async () => {
    const confirm = window.confirm(
      "Are you sure you want to submit? You cannot change your answers after submitting.",
    );
    if (confirm) {
      await performSubmit();
    }
  };

  const performSubmit = async () => {
    setLoading(true);
    try {
      const finalScore = calculateScore();
      await submitExam(activeExam.id, finalScore);
      toast.success(
        `Exam submitted successfully! Your score: ${finalScore}/${questions.length}`,
      );
      setActiveExam(null);
      fetchAssignments(); // refresh list
    } catch (error) {
      toast.error("Failed to submit exam.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const autoSubmitDueToViolation = async () => {
    setLoading(true);
    try {
      const finalScore = calculateScore();
      await submitExam(activeExam.id, finalScore);
      toast.error("Exam automatically submitted! You were caught switching tabs or leaving the exam window 3 times.");
      setActiveExam(null);
      fetchAssignments();
    } catch (error) {
      toast.error("Failed to auto-submit exam.");
    } finally {
      setLoading(false);
      setViolations(0);
      setShowViolationModal(false);
    }
  };

  useEffect(() => {
    if (!activeExam) {
      setViolations(0);
      setShowViolationModal(false);
      return;
    }

    let lastViolationTime = 0;

    const handleViolation = () => {
      const now = Date.now();
      if (now - lastViolationTime < 2000) return; // avoid double trigger
      lastViolationTime = now;

      setViolations((prev) => {
        const next = prev + 1;
        if (next >= maxViolations) {
          autoSubmitDueToViolation();
        } else {
          setShowViolationModal(true);
        }
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleBlur = () => {
      handleViolation();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [activeExam, questions, answers]); //eslint-disable-line

  if (loading && !activeExam) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-blue-400">
        <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 mb-4"></div>
        <p>Loading your portal...</p>
      </div>
    );
  }

  const handleResetAnswer = () => {
    if (!questions[currentQuestionIndex]) return;
    const qId = questions[currentQuestionIndex].id;
    const newAnswers = { ...answers };
    delete newAnswers[qId];
    setAnswers(newAnswers);
    if (activeExam) {
      saveExamProgress(activeExam.id, newAnswers, timeLeft).catch(console.error);
    }
  };

  // EXAM MODE RENDER
  if (activeExam) {
    const attemptedCount = Object.keys(answers).length;
    const notAttemptedCount = questions.length - attemptedCount;

    return (
      <div className="max-w-7xl mx-auto pb-20 space-y-6 animate-in fade-in duration-300">
        {/* Top Details Header Card */}
        <div className="bg-gray-880/40 backdrop-blur-md border border-gray-700/60 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img src={LogoAiseci} alt="AIESECI Logo" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                AIESECI
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block -mt-1">
                Computer Institute
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:text-base font-semibold text-gray-300">
            <div>
              <span className="text-gray-500 font-bold text-xs uppercase block">Exam Name:</span>
              <span className="text-white">{activeExam.setTitle}</span>
            </div>
            <div>
              <span className="text-gray-500 font-bold text-xs uppercase block">Login ID:</span>
              <span className="text-yellow-400 font-mono">{activeExam.rollNo || rollNumber}</span>
            </div>
            <div>
              <span className="text-gray-500 font-bold text-xs uppercase block">Student Name:</span>
              <span className="text-white capitalize">{name}</span>
            </div>
            <div>
              <span className="text-gray-500 font-bold text-xs uppercase block">Language:</span>
              <span className="text-white">Hindi/English</span>
            </div>
          </div>

          {/* <div className="flex items-center justify-center w-14 h-14 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shrink-0">
            <svg className="w-8 h-8 text-gray-400 mt-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div> */}
        </div>

        {/* Sub-Header Row Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 text-center font-semibold text-sm">
          <div className="border-r border-gray-850 py-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">QN:</span>
            <span className="text-blue-400 font-black text-base">{currentQuestionIndex + 1}</span>
          </div>
          <div className="sm:border-r border-gray-850 py-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">Total Marks:</span>
            <span className="text-white font-black text-base">{questions.length}</span>
          </div>
          <div className="border-r border-gray-850 py-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">Total Time:</span>
            <span className="text-green-400 font-black text-base">{(activeExam.duration || 90)} Mins</span>
          </div>
          <div className="sm:border-r border-gray-850 py-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">Remaining Time:</span>
            <span className="text-yellow-400 font-black font-mono text-base">{formatTime(timeLeft)}</span>
          </div>
          <div className="py-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">Mark:</span>
            <span className="text-white font-black text-base">1</span>
          </div>
        </div>

        {/* Main Grid: Workspace & Palette Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Question workspace container */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question Card */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-100 leading-relaxed mb-6">
                  <span className="text-blue-400 font-black mr-2">Q{currentQuestionIndex + 1}.</span>
                  <span>{questions[currentQuestionIndex]?.text}</span>
                  {questions[currentQuestionIndex]?.textHindi && (
                    <span className="block text-sm text-gray-400 font-semibold italic mt-2 leading-relaxed">
                      {questions[currentQuestionIndex]?.textHindi}
                    </span>
                  )}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(questions[currentQuestionIndex]?.options || {}).map(([key, val]) => (
                    <label
                      key={key}
                      className={`flex items-center p-4 rounded-2xl border cursor-pointer transition-all ${answers[questions[currentQuestionIndex]?.id] === key
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        : "bg-gray-900/40 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-900/60"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`question-${questions[currentQuestionIndex]?.id}`}
                        value={key}
                        checked={answers[questions[currentQuestionIndex]?.id] === key}
                        onChange={() => handleOptionSelect(questions[currentQuestionIndex]?.id, key)}
                        className="hidden"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center shrink-0 ${answers[questions[currentQuestionIndex]?.id] === key ? "border-blue-400" : "border-gray-600"
                          }`}
                      >
                        {answers[questions[currentQuestionIndex]?.id] === key && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-left">
                        <span className="font-black mr-2 text-blue-400">{key}.</span> 
                        <span>{val}</span>
                        {questions[currentQuestionIndex]?.optionsHindi?.[key] && (
                          <span className="block text-xs text-gray-400 mt-1 italic font-semibold">
                            {questions[currentQuestionIndex]?.optionsHindi[key]}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-800">
                <button
                  onClick={() => {
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                    } else {
                      toast.info("This is the last question. You can review your answers or click Finish Exam.");
                    }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  Submit Answer
                </button>
                <button
                  onClick={handleResetAnswer}
                  className="bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 font-bold py-3.5 px-6 rounded-2xl transition-all"
                >
                  Reset Answer
                </button>
              </div>
            </div>

            {/* Always Visible Instructions Box */}
            <div className="bg-gray-800/20 backdrop-blur-md border border-gray-800/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <h4 className="text-base font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span>📝</span> Exam Instructions
              </h4>
              <div className="text-gray-400 text-xs sm:text-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 leading-relaxed font-medium">
                <p>1. Ensure you have a stable network connection before starting the exam.</p>
                <p>2. Once the timer reaches zero, your exam will be automatically submitted.</p>
                <p>3. Each question carries exactly 1 mark. There is no negative marking.</p>
                <p>4. Use the question palette grid on the right to navigate directly to any question.</p>
                <p>5. Click <strong>Submit Answer</strong> to advance to the next question, or click <strong>Reset Answer</strong> to clear your option.</p>
                <p>6. Do not refresh the page or navigate away during the exam to prevent loss of progress.</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <button
              onClick={handleManualSubmit}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(29,78,216,0.3)] tracking-wide uppercase text-sm"
            >
              Finish Exam
            </button>

            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/60 rounded-3xl p-6 shadow-2xl space-y-4">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider">
                Question Status
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 text-center">
                  <span className="text-green-400 font-bold text-xs uppercase block">Attempted</span>
                  <span className="text-white font-black text-xl">{attemptedCount}</span>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-center">
                  <span className="text-red-400 font-bold text-xs uppercase block">Unattempted</span>
                  <span className="text-white font-black text-xl">{notAttemptedCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/60 rounded-3xl p-6 shadow-2xl">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">
                Choose Question
              </h4>
              <div
                className="grid grid-cols-5 gap-2 max-h-[250px] overflow-y-auto pr-1"
                style={{ scrollbarWidth: "thin" }}
              >
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = answers[q.id] !== undefined;

                  let circleClass = "";
                  if (isCurrent) {
                    circleClass = "bg-yellow-500 border-yellow-400 text-gray-950 font-black shadow-[0_0_12px_rgba(234,179,8,0.4)]";
                  } else if (isAnswered) {
                    circleClass = "bg-green-600/80 border-green-500 text-white font-bold";
                  } else {
                    circleClass = "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs transition-all ${circleClass}`}
                    >
                      {(idx + 1).toString().padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Focus Violation Warning Modal */}
        {showViolationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-800 border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-red-500/20 p-4 rounded-full text-red-500 animate-bounce">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-black text-red-400">Warning: Focus Lost!</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Switching tabs, minimizing the browser, or clicking outside the exam portal is strictly prohibited.
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Violations Recorded</span>
                <span className="text-red-400 font-black text-2xl">{violations} / {maxViolations}</span>
                <span className="text-gray-500 text-xs block mt-1">Exam will auto-submit on 3rd violation.</span>
              </div>
              <button
                onClick={() => setShowViolationModal(false)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/30"
              >
                I understand, return to Exam
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DASHBOARD RENDER
  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-3xl p-12 text-center">
            <FiAward size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">No Exams Assigned</h3>
            <p className="text-gray-500 mt-2">
              You currently have no exams assigned to your roll number.
            </p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-3xl p-6 shadow-xl relative overflow-hidden group"
            >
              {assignment.status === "completed" && (
                <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 font-bold text-xs px-3 py-1 rounded-bl-xl border-b border-l border-green-500/30 flex items-center gap-1">
                  <FiCheckCircle /> Completed
                </div>
              )}
              <h3 className="text-xl font-black text-white mb-1 mt-2">
                {assignment.setTitle}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {assignment.courseName} • {assignment.semesterName}
              </p>

              <div className="bg-gray-900/50 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                    Duration
                  </span>
                  <span className="text-gray-300 font-medium text-sm">
                    {assignment.duration || 90} Minutes
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                    Status
                  </span>
                  <span
                    className={`font-black text-sm ${
                      assignment.status === "completed"
                        ? "text-green-400"
                        : assignment.status === "in_progress"
                        ? "text-orange-400 animate-pulse"
                        : "text-yellow-400"
                    }`}
                  >
                    {assignment.status === "completed"
                      ? "Finished"
                      : assignment.status === "in_progress"
                      ? "In Progress"
                      : "Pending"}
                  </span>
                </div>
              </div>

              {assignment.status === "completed" ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <span className="text-green-400 font-bold uppercase text-xs tracking-widest block mb-1">
                    Your Score
                  </span>
                  <span className="text-3xl font-black text-white">
                    {assignment.score}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => startExam(assignment)}
                  className={`w-full text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 group-hover:scale-[1.02] ${
                    assignment.status === "in_progress"
                      ? "bg-orange-600 hover:bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                      : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  }`}
                >
                  <FiPlayCircle size={20} />
                  {assignment.status === "in_progress" ? "Resume Exam" : "Start Exam"}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* PIN Access Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-center mb-6">
              <div className="bg-red-500/20 p-4 rounded-full text-red-500 animate-pulse">
                <FiLock size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Enter Access PIN</h3>
            <p className="text-gray-400 text-center text-sm mb-6">
              This exam is protected. Please enter the unlock PIN provided by the administrator/instructor.
            </p>
            <input
              type="text"
              placeholder="••••••"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500 text-center text-2xl font-bold tracking-widest mb-6 w-full"
              onKeyDown={(e) => e.key === "Enter" && handleVerifyPinAndStart()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setEnteredPin("");
                  setExamToUnlock(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPinAndStart}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-red-500/30 text-sm"
              >
                Unlock & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExamPortal;
