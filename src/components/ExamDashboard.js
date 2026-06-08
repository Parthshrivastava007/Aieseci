import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { db } from "../Backend/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  getCourses,
  getSemesters,
  getQuestionSets,
  getQuestions,
  createCourse,
  createSemester,
  createQuestionSet,
  bulkAddQuestions,
  deleteQuestion,
  deleteQuestionsInSet,
  deleteQuestionSet,
  assignExam,
  getSecuritySettings,
  setSecuritySettings,
  getAllAssignments,
  deassignExam,
  renameSemester,
  deleteSemester,
  renameQuestionSet,
  addQuestion,
} from "../Backend/examService";
import { courseFees } from "./CourseFeesData";
import AccessCard from "./AccessCard";
import StudentExamPortal from "./StudentExamPortal";
import axios from "axios";
import {
  FiUpload,
  FiPlus,
  FiBook,
  FiLayers,
  FiCheckCircle,
  FiFileText,
  FiLoader,
  FiFolder,
  FiTrash2,
  FiUsers,
  FiLock,
  FiEdit2,
} from "react-icons/fi";

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const translateToHindi = async (text) => {
  if (!text || typeof text !== "string" || !text.trim()) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
    const res = await axios.get(url);
    if (res.data && res.data[0]) {
      return res.data[0].map((item) => item[0]).join("");
    }
  } catch (error) {
    console.error("Translation failed for text:", text, error);
  }
  return "";
};

const ExamDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [questionSets, setQuestionSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCourse, setSelectedFilterCourse] = useState("");

  // Form states
  const [newSemesterName, setNewSemesterName] = useState("");
  const [newSetName, setNewSetName] = useState("");
  const [activeTab, setActiveTab] = useState("questions");
  const [assignRollNumber, setAssignRollNumber] = useState("");
  const [examDuration, setExamDuration] = useState("90");
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [pinRestrictionEnabled, setPinRestrictionEnabled] = useState(false);
  const [accessPin, setAccessPin] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "",
    id: null,
    message: "",
  });

  // Rename states
  const [editingSemesterId, setEditingSemesterId] = useState(null);
  const [editingSemesterName, setEditingSemesterName] = useState("");
  const [editingSetId, setEditingSetId] = useState(null);
  const [editingSetName, setEditingSetName] = useState("");

  // Manual Question form states
  const [manualText, setManualText] = useState("");
  const [manualTextHindi, setManualTextHindi] = useState("");
  const [manualOptA, setManualOptA] = useState("");
  const [manualOptAHindi, setManualOptAHindi] = useState("");
  const [manualOptB, setManualOptB] = useState("");
  const [manualOptBHindi, setManualOptBHindi] = useState("");
  const [manualOptC, setManualOptC] = useState("");
  const [manualOptCHindi, setManualOptCHindi] = useState("");
  const [manualOptD, setManualOptD] = useState("");
  const [manualOptDHindi, setManualOptDHindi] = useState("");
  const [manualCorrect, setManualCorrect] = useState("A");

  const resetManualQuestionForm = () => {
    setManualText("");
    setManualTextHindi("");
    setManualOptA("");
    setManualOptAHindi("");
    setManualOptB("");
    setManualOptBHindi("");
    setManualOptC("");
    setManualOptCHindi("");
    setManualOptD("");
    setManualOptDHindi("");
    setManualCorrect("A");
  };

  /* ================= AUTH ================= */
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentRollNumber, setStudentRollNumber] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    if (authenticated && isAdmin) {
      loadSecuritySettings();
      fetchExamAssignments();
    }
  }, [authenticated, isAdmin]);

  const loadSecuritySettings = async () => {
    try {
      const settings = await getSecuritySettings();
      setAccessPin(settings.accessPin);
      setPinRestrictionEnabled(settings.isEnabled);
    } catch (error) {
      console.error("Failed to load security settings:", error);
    }
  };

  const fetchExamAssignments = async () => {
    try {
      setLoading(true);

      // Fetch enrollments to enrich student names (essential for legacy assignments)
      const enrollmentsRef = collection(db, "enrollments");
      const enrollmentsSnapshot = await getDocs(enrollmentsRef);
      const studentMap = {};
      enrollmentsSnapshot.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.rollNo) {
          studentMap[d.rollNo.toUpperCase().trim()] = d.name;
        }
      });

      const data = await getAllAssignments();
      const enriched = data.map((asg) => {
        const rollKey = (asg.rollNo || "").toUpperCase().trim();
        return {
          ...asg,
          studentName: asg.studentName || studentMap[rollKey] || "N/A",
        };
      });

      const sorted = enriched.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setAssignments(sorted);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      toast.error("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeassignExam = async (assignmentId) => {
    try {
      setLoading(true);
      await deassignExam(assignmentId);
      toast.success("Exam deassigned successfully!");
      await fetchExamAssignments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to deassign exam.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    if (pinRestrictionEnabled && !accessPin.trim()) {
      toast.error("Please enter a valid PIN or disable the restriction.");
      return;
    }
    try {
      setLoading(true);
      await setSecuritySettings(accessPin.trim(), pinRestrictionEnabled);
      toast.success("Security PIN settings updated successfully!");
    } catch (error) {
      toast.error("Failed to save security settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePinRestriction = async (checked) => {
    setPinRestrictionEnabled(checked);
    try {
      await setSecuritySettings(accessPin.trim(), checked);
      toast.success(checked ? "PIN security activated!" : "PIN security deactivated.");
    } catch (error) {
      toast.error("Failed to toggle PIN security.");
      setPinRestrictionEnabled(!checked);
    }
  };

  const handleGenerateRandomPin = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setAccessPin(randomPin);
    toast.info(`Generated random PIN: ${randomPin}. Save settings to apply.`);
  };

  const allowedAdminEmail = "aieseci.anpara@gmail.com";
  const allowedAdminPassword = "Aieseci@220471";

  const handleAccess = async (role) => {
    setErrorMessage("");

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

    if (studentName.trim() && studentRollNumber.trim()) {
      setIsAdmin(false);
      setAuthenticated(true);
      toast.success("Student access granted");
    } else {
      setErrorMessage("Please enter both Name and Roll Number");
      toast.error("Name and Roll Number required");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setIsAdmin(false);
    setStudentName("");
    setStudentRollNumber("");
    setAdminEmail("");
    setAdminPassword("");
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSet(null);
    setQuestions([]);
    toast.info("Logged out successfully");
  };

  useEffect(() => {
    if (authenticated) {
      fetchAndSyncCourses();
    }
  }, [authenticated]);

  const fetchAndSyncCourses = async () => {
    try {
      setLoading(true);
      const existingCourses = await getCourses();

      const allowedCourseNames = courseFees
        .map((c) => c.course_name)
        .filter(
          (name) => name !== "O-Level" && name !== "CCC" && name !== "cccc",
        );

      // 1. Sync Courses
      const syncedCourses = [];
      for (const name of allowedCourseNames) {
        let course;
        const existing = existingCourses.find((c) => c.name === name);

        if (!existing) {
          const docRef = await createCourse({ name });
          course = { id: docRef.id, name };
        } else {
          course = existing;
        }
        syncedCourses.push(course);
      }

      setCourses(syncedCourses);
    } catch (error) {
      console.error("DETAILED SYNC ERROR:", error);
      toast.error(`Sync Error: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setSelectedSemester(null);
    setSelectedSet(null);
    setSemesters([]);
    setQuestionSets([]);
    setQuestions([]);
    setLoading(true);
    try {
      const sems = await getSemesters(course.id);
      setSemesters(sems);
    } catch (error) {
      toast.error("Error loading semesters");
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterSelect = async (semester) => {
    setSelectedSemester(semester);
    setSelectedSet(null);
    setQuestions([]);
    setLoading(true);
    try {
      const sets = await getQuestionSets(semester.id);
      setQuestionSets(sets);
    } catch (error) {
      toast.error("Error loading question sets");
    } finally {
      setLoading(false);
    }
  };

  const handleSetSelect = async (set) => {
    setSelectedSet(set);
    setLoading(true);
    try {
      const qs = await getQuestions(
        selectedCourse.id,
        selectedSemester.id,
        set.id,
      );
      setQuestions(qs);
    } catch (error) {
      toast.error("Error loading questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSetQuestions = () => {
    if (!selectedSet) return;
    setDeleteModal({
      isOpen: true,
      type: "SET_QUESTIONS",
      id: selectedSet.id,
      message:
        "Are you sure you want to delete ALL questions in this set? This action cannot be undone.",
    });
  };

  const handleDeleteSingleQuestion = (questionId) => {
    setDeleteModal({
      isOpen: true,
      type: "SINGLE_QUESTION",
      id: questionId,
      message: "Are you sure you want to delete this specific question?",
    });
  };

  const handleDeleteSet = (setId, e) => {
    e.stopPropagation(); // prevent triggering select
    setDeleteModal({
      isOpen: true,
      type: "ENTIRE_SET",
      id: setId,
      message:
        "Are you sure you want to delete this entire Question Set and ALL its questions?",
    });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteModal;
    setDeleteModal({ ...deleteModal, isOpen: false });

    if (type === "SET_QUESTIONS") {
      setLoading(true);
      try {
        await deleteQuestionsInSet(id);
        setQuestions([]);
        toast.success("All questions deleted successfully");
      } catch (error) {
        toast.error("Failed to delete questions");
      } finally {
        setLoading(false);
      }
    } else if (type === "SINGLE_QUESTION") {
      try {
        await deleteQuestion(id);
        setQuestions(questions.filter((q) => q.id !== id));
        toast.success("Question deleted");
      } catch (error) {
        toast.error("Failed to delete question");
      }
    } else if (type === "ENTIRE_SET") {
      setLoading(true);
      try {
        await deleteQuestionSet(id);
        setQuestionSets(questionSets.filter((s) => s.id !== id));
        if (selectedSet?.id === id) {
          setSelectedSet(null);
          setQuestions([]);
        }
        toast.success("Question set deleted");
      } catch (error) {
        toast.error("Failed to delete set");
      } finally {
        setLoading(false);
      }
    } else if (type === "ENTIRE_SEMESTER") {
      setLoading(true);
      try {
        await deleteSemester(id);
        setSemesters(semesters.filter((sem) => sem.id !== id));
        if (selectedSemester?.id === id) {
          setSelectedSemester(null);
          setSelectedSet(null);
          setQuestionSets([]);
          setQuestions([]);
        }
        toast.success("Semester and all its cascading contents deleted successfully");
      } catch (error) {
        toast.error("Failed to delete semester");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteSemesterPrompt = (semester, e) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: "ENTIRE_SEMESTER",
      id: semester.id,
      message: `Are you sure you want to delete "${semester.name}"? This will delete the semester, ALL its question sets, and ALL questions inside those sets.`,
    });
  };

  const handleRenameSemesterPrompt = (semester, e) => {
    e.stopPropagation();
    setEditingSemesterId(semester.id);
    setEditingSemesterName(semester.name);
  };

  const handleSaveSemesterRename = async (semesterId) => {
    if (!editingSemesterName.trim()) {
      toast.error("Semester name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await renameSemester(semesterId, editingSemesterName.trim());
      setSemesters(
        semesters.map((sem) =>
          sem.id === semesterId ? { ...sem, name: editingSemesterName.trim() } : sem
        )
      );
      if (selectedSemester?.id === semesterId) {
        setSelectedSemester((prev) => ({ ...prev, name: editingSemesterName.trim() }));
      }
      setEditingSemesterId(null);
      toast.success("Semester renamed successfully");
    } catch (error) {
      toast.error("Failed to rename semester");
    } finally {
      setLoading(false);
    }
  };

  const handleRenameSetPrompt = (set, e) => {
    e.stopPropagation();
    setEditingSetId(set.id);
    setEditingSetName(set.title);
  };

  const handleSaveSetRename = async (setId) => {
    if (!editingSetName.trim()) {
      toast.error("Question set name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await renameQuestionSet(setId, editingSetName.trim());
      setQuestionSets(
        questionSets.map((s) =>
          s.id === setId ? { ...s, title: editingSetName.trim() } : s
        )
      );
      if (selectedSet?.id === setId) {
        setSelectedSet((prev) => ({ ...prev, title: editingSetName.trim() }));
      }
      setEditingSetId(null);
      toast.success("Question set renamed successfully");
    } catch (error) {
      toast.error("Failed to rename question set");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSemester = async () => {
    if (!newSemesterName || !selectedCourse) return;
    try {
      await createSemester({
        name: newSemesterName,
        courseId: selectedCourse.id,
      });
      setNewSemesterName("");
      const sems = await getSemesters(selectedCourse.id);
      setSemesters(sems);
      toast.success("Semester created");
    } catch (error) {
      toast.error("Failed to create semester");
    }
  };

  const handleAddSet = async () => {
    if (!newSetName || !selectedSemester) return;
    try {
      await createQuestionSet({
        title: newSetName,
        semesterId: selectedSemester.id,
      });
      setNewSetName("");
      const sets = await getQuestionSets(selectedSemester.id);
      setQuestionSets(sets);
      toast.success("Question set created");
    } catch (error) {
      toast.error("Failed to create set");
    }
  };

  const handleSaveManualQuestion = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCourse || !selectedSemester || !selectedSet) {
      toast.error("Please select a course, semester, and set first.");
      return;
    }

    if (!manualText.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (!manualOptA.trim() || !manualOptB.trim() || !manualOptC.trim() || !manualOptD.trim()) {
      toast.error("All four options (A, B, C, D) are required.");
      return;
    }

    setLoading(true);
    try {
      // Auto-translate to Hindi if fields are left blank
      toast.info("Translating missing Hindi fields...");

      const qHindi = manualTextHindi.trim()
        ? manualTextHindi.trim()
        : await translateToHindi(manualText.trim());

      const optAHindi = manualOptAHindi.trim()
        ? manualOptAHindi.trim()
        : await translateToHindi(manualOptA.trim());

      const optBHindi = manualOptBHindi.trim()
        ? manualOptBHindi.trim()
        : await translateToHindi(manualOptB.trim());

      const optCHindi = manualOptCHindi.trim()
        ? manualOptCHindi.trim()
        : await translateToHindi(manualOptC.trim());

      const optDHindi = manualOptDHindi.trim()
        ? manualOptDHindi.trim()
        : await translateToHindi(manualOptD.trim());

      const newQuestionData = {
        text: manualText.trim(),
        textHindi: qHindi,
        options: {
          A: manualOptA.trim(),
          B: manualOptB.trim(),
          C: manualOptC.trim(),
          D: manualOptD.trim()
        },
        optionsHindi: {
          A: optAHindi,
          B: optBHindi,
          C: optCHindi,
          D: optDHindi
        },
        correctAnswer: manualCorrect,
        courseId: selectedCourse.id,
        semesterId: selectedSemester.id,
        setId: selectedSet.id
      };

      await addQuestion(newQuestionData);
      toast.success("Question manually added successfully!");
      resetManualQuestionForm();

      // Reload questions
      const qs = await getQuestions(
        selectedCourse.id,
        selectedSemester.id,
        selectedSet.id
      );
      setQuestions(qs);

      // Switch back to questions list
      setActiveTab("questions");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add question.");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCourse || !selectedSemester) return;

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    try {
      const backendUrl =
        process.env.REACT_APP_BACKEND_URL ||
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? "http://localhost:5000"
          : "https://aieseci.onrender.com");
      const response = await axios.post(
        `${backendUrl}/api/parse-pdf`,
        formData,
      );
      if (response.data.success) {
        const parsed = response.data.questions;
        console.log("Raw PDF Text extracted by backend:\n", response.data.text);

        if (parsed.length === 0) {
          toast.warn(
            "No questions could be found in the PDF. Please check the format.",
          );
        } else {
          // Translate to Hindi in parallel
          toast.info("Translating questions and choices to Hindi...");
          const translatedQuestions = await Promise.all(
            parsed.map(async (q) => {
              const textHindi = await translateToHindi(q.text);
              const optionsHindi = {};
              if (q.options) {
                for (const [key, val] of Object.entries(q.options)) {
                  optionsHindi[key] = await translateToHindi(val);
                }
              }
              return {
                ...q,
                textHindi,
                optionsHindi,
              };
            })
          );

          await bulkAddQuestions(
            translatedQuestions,
            selectedCourse.id,
            selectedSemester.id,
            selectedSet?.id,
          );
          toast.success(`Successfully uploaded and translated ${parsed.length} questions!`);
          // Refresh questions
          const qs = await getQuestions(
            selectedCourse.id,
            selectedSemester.id,
            selectedSet?.id,
          );
          setQuestions(qs);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error parsing PDF. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExam = async () => {
    if (!selectedCourse || !selectedSemester || !selectedSet) {
      toast.error("Please select a Question Set first.");
      return;
    }
    if (!assignRollNumber.trim()) {
      toast.error("Please enter a student roll number.");
      return;
    }

    try {
      setLoading(true);
      const formattedRoll = assignRollNumber.toUpperCase().includes("AFT-")
        ? assignRollNumber.replace(/\s+/g, "").toUpperCase()
        : `AFT-${assignRollNumber}`.replace(/\s+/g, "").toUpperCase();

      // Check Enrollment and Fees
      const enrollmentsRef = collection(db, "enrollments");
      const q = query(enrollmentsRef, where("rollNo", "==", formattedRoll));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast.error("Student not found in enrollment records.");
        setLoading(false);
        return;
      }

      const studentData = snapshot.docs[0].data();

      // Check Course Match
      if (studentData.course !== selectedCourse.name) {
        toast.error(
          `Cannot assign: Student is enrolled in ${studentData.course}, not ${selectedCourse.name}.`,
        );
        setLoading(false);
        return;
      }

      // Check Fees Match
      if (!studentData.feeBreakdown || !studentData.feeBreakdown.length) {
        toast.error(
          "Student fee ledger not found. Please generate ledger first.",
        );
        setLoading(false);
        return;
      }

      const paid = studentData.feeBreakdown
        .filter((fee) => fee.isPaid)
        .reduce((acc, curr) => acc + curr.amount, 0);

      const partialPaid = studentData.feeBreakdown
        .filter((fee) => !fee.isPaid && fee.partialPaid > 0)
        .reduce((acc, curr) => acc + curr.partialPaid, 0);

      const totalPaidAmount = paid + partialPaid;
      const pending = studentData.totalFee - totalPaidAmount;

      if (pending > 0) {
        toast.error(
          `Cannot assign exam: Student has pending fees of ₹${pending}.`,
        );
        setLoading(false);
        return;
      }

      // Check Duplicate Assignment
      const assignmentsRef = collection(db, "exam_assignments");
      const dupQuery = query(
        assignmentsRef,
        where("rollNo", "==", formattedRoll),
        where("setId", "==", selectedSet.id)
      );
      const dupSnapshot = await getDocs(dupQuery);

      if (!dupSnapshot.empty) {
        toast.error("This exam has already been assigned to this student.");
        setLoading(false);
        return;
      }

      // Fetch all questions in the set if randomize is active
      let questionOrder = null;
      if (randomizeQuestions) {
        const qs = await getQuestions(
          selectedCourse.id,
          selectedSemester.id,
          selectedSet.id
        );
        if (qs.length > 0) {
          const shuffledQs = shuffleArray(qs);
          questionOrder = shuffledQs.map((q) => q.id);
        }
      }

      await assignExam({
        rollNo: formattedRoll,
        studentName: studentData.name || "",
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        semesterId: selectedSemester.id,
        semesterName: selectedSemester.name,
        setId: selectedSet.id,
        setTitle: selectedSet.title,
        duration: parseInt(examDuration) || 90,
        ...(questionOrder && { questionOrder }),
      });

      toast.success(`Exam successfully assigned to ${formattedRoll}`);
      setAssignRollNumber("");
      setExamDuration("90");
      await fetchExamAssignments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign exam.");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <>
        <ToastContainer theme="dark" />
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
          variant="exam"
        />
      </>
    );
  }

  const filteredAssignments = assignments.filter((asg) => {
    const queryStr = searchQuery.toLowerCase().trim();
    const matchesSearch =
      queryStr === "" ||
      (asg.studentName || "").toLowerCase().includes(queryStr) ||
      (asg.rollNo || "").toLowerCase().includes(queryStr);

    const matchesCourse =
      selectedFilterCourse === "" ||
      asg.courseName === selectedFilterCourse;

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-8 font-sans">
      <ToastContainer theme="dark" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Exam Management Portal
          </h1>
          <p className="text-gray-400 mt-2">
            {isAdmin
              ? "Design courses, question sets, and upload assessments with ease."
              : "View your available courses and exam questions."}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 text-white border border-red-500 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.7)]"
        >
          Log Out
        </button>
      </div>

      {isAdmin ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Courses */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <FiBook className="text-blue-400" /> Courses
              </h2>
              <div className="space-y-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleCourseSelect(course)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedCourse?.id === course.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "hover:bg-gray-700/50 text-gray-400"
                    }`}
                  >
                    {course.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedCourse && (
              <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-700 shadow-xl animate-in fade-in slide-in-from-top-4">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <FiFolder className="text-purple-400" /> Semesters
                </h2>
                <div className="space-y-2">
                  {semesters.map((semester) => {
                    const isEditing = editingSemesterId === semester.id;
                    return (
                      <div key={semester.id} className="flex gap-2 items-center w-full">
                        {isEditing ? (
                          <div className="flex gap-1.5 w-full items-center">
                            <input
                              type="text"
                              value={editingSemesterName}
                              onChange={(e) => setEditingSemesterName(e.target.value)}
                              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-purple-500 text-white"
                              onKeyDown={(e) => e.key === "Enter" && handleSaveSemesterRename(semester.id)}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveSemesterRename(semester.id)}
                              className="bg-green-600 hover:bg-green-500 text-white px-2.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSemesterId(null)}
                              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSemesterSelect(semester)}
                              className={`w-full text-left p-3 rounded-xl transition-all overflow-hidden text-ellipsis whitespace-nowrap ${
                                selectedSemester?.id === semester.id
                                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                  : "hover:bg-gray-700/50 text-gray-400"
                              }`}
                            >
                              {semester.name}
                            </button>
                            {isAdmin && (
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={(e) => handleRenameSemesterPrompt(semester, e)}
                                  className="bg-gray-800 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 border border-gray-700 hover:border-blue-500/50 p-2.5 rounded-xl transition-all"
                                  title="Rename Semester"
                                >
                                  <FiEdit2 size={16} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSemesterPrompt(semester, e)}
                                  className="bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 p-2.5 rounded-xl transition-all"
                                  title="Delete Semester"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                {isAdmin && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="New Semester..."
                      className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-purple-500"
                      value={newSemesterName}
                      onChange={(e) => setNewSemesterName(e.target.value)}
                    />
                    <button
                      onClick={handleAddSemester}
                      className="bg-purple-600 p-2 rounded-xl hover:bg-purple-500"
                    >
                      <FiPlus />
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedSemester && (
              <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-700 shadow-xl animate-in fade-in slide-in-from-top-4">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <FiLayers className="text-pink-400" /> Question Sets
                </h2>
                <div className="space-y-2">
                  {questionSets.map((set) => {
                    const isEditing = editingSetId === set.id;
                    return (
                      <div key={set.id} className="flex gap-2 items-center w-full">
                        {isEditing ? (
                          <div className="flex gap-1.5 w-full items-center">
                            <input
                              type="text"
                              value={editingSetName}
                              onChange={(e) => setEditingSetName(e.target.value)}
                              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-pink-500 text-white"
                              onKeyDown={(e) => e.key === "Enter" && handleSaveSetRename(set.id)}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveSetRename(set.id)}
                              className="bg-green-600 hover:bg-green-500 text-white px-2.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSetId(null)}
                              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSetSelect(set)}
                              className={`w-full text-left p-3 rounded-xl transition-all overflow-hidden text-ellipsis whitespace-nowrap ${
                                selectedSet?.id === set.id
                                  ? "bg-pink-600 text-white shadow-lg shadow-pink-500/20"
                                  : "hover:bg-gray-700/50 text-gray-400"
                              }`}
                            >
                              {set.title}
                            </button>
                            {isAdmin && (
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={(e) => handleRenameSetPrompt(set, e)}
                                  className="bg-gray-800 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 border border-gray-700 hover:border-blue-500/50 p-2.5 rounded-xl transition-all"
                                  title="Rename Set"
                                >
                                  <FiEdit2 size={16} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSet(set.id, e)}
                                  className="bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 p-2.5 rounded-xl transition-all"
                                  title="Delete Set"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                {isAdmin && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="New Set..."
                      className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-pink-500"
                      value={newSetName}
                      onChange={(e) => setNewSetName(e.target.value)}
                    />
                    <button
                      onClick={handleAddSet}
                      className="bg-pink-600 p-2 rounded-xl hover:bg-pink-500"
                    >
                      <FiPlus />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PIN Security Settings Card */}
            {isAdmin && (
              <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-700 shadow-xl space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FiLock className="text-red-400" /> Exam Security
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-sm font-semibold text-gray-300">
                      Require Access PIN
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={pinRestrictionEnabled}
                        onChange={(e) => handleTogglePinRestriction(e.target.checked)}
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${pinRestrictionEnabled ? "bg-red-500" : "bg-gray-700"}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${pinRestrictionEnabled ? "translate-x-4" : ""}`}></div>
                    </div>
                  </label>

                  {pinRestrictionEnabled && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        placeholder="Access PIN"
                        value={accessPin}
                        onChange={(e) => setAccessPin(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-red-500 text-white text-center font-bold tracking-widest"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveSecuritySettings}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-lg shadow-red-500/20"
                        >
                          Save Settings
                        </button>
                        <button
                          onClick={handleGenerateRandomPin}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-3 rounded-xl text-xs transition-all"
                          title="Generate a random 6-digit PIN"
                        >
                          Random PIN
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedCourse ? (
              <div className="bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-3xl h-[400px] flex flex-col items-center justify-center text-gray-500">
                <FiBook size={64} className="mb-4 opacity-20" />
                <p className="text-xl">
                  Select a course to start managing questions
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats / Header */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tight">
                        {selectedCourse.name}
                      </h2>
                      <p className="text-blue-100 opacity-80">
                        {selectedSet
                          ? selectedSet.title
                          : "Select a Question Set to view questions"}
                      </p>
                      <div className="mt-6 flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
                          <p className="text-xs font-bold uppercase opacity-60">
                            Total Questions
                          </p>
                          <p className="text-2xl font-black">
                            {questions.length}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isAdmin && selectedSet && questions.length > 0 && (
                      <button
                        onClick={handleDeleteSetQuestions}
                        className="mt-4 sm:mt-0 flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/50 px-4 py-2 rounded-xl transition-all"
                      >
                        <FiTrash2 /> Delete All Questions
                      </button>
                    )}
                  </div>
                  <FiFileText className="absolute -right-4 -bottom-4 text-white/5 w-48 h-48" />
                </div>

                {/* Assign Exam UI */}
                {isAdmin && selectedSet && (
                  <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700 shadow-xl mb-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <FiUsers className="text-blue-400" /> Assign Exam to
                      Student
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center flex-1 bg-gray-900 border border-gray-700 rounded-xl focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
                          <span className="pl-4 pr-1 text-gray-400 font-bold select-none">
                            AFT-
                          </span>
                          <input
                            type="text"
                            placeholder="101"
                            value={assignRollNumber.replace(/^AFT-?/i, "")}
                            onChange={(e) => {
                              const val = e.target.value.replace(/^AFT-?/i, "");
                              setAssignRollNumber(val ? `AFT-${val}` : "");
                            }}
                            className="w-full py-3 pr-3 bg-transparent text-white outline-none"
                          />
                        </div>
                        <div className="flex items-center w-full sm:w-48 bg-gray-900 border border-gray-700 rounded-xl focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
                          <span className="pl-4 pr-1 text-gray-400 font-bold select-none text-sm">
                            Duration:
                          </span>
                          <input
                            type="number"
                            placeholder="90"
                            value={examDuration}
                            onChange={(e) => setExamDuration(e.target.value)}
                            className="w-full py-3 pr-3 bg-transparent text-white outline-none text-sm text-center font-bold"
                            min="1"
                          />
                          <span className="pr-4 text-gray-400 text-sm font-bold select-none">
                            Min
                          </span>
                        </div>
                        <button
                          onClick={handleAssignExam}
                          disabled={loading || !assignRollNumber || !examDuration}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                        >
                          Assign Exam
                        </button>
                      </div>

                      {/* Randomizer Toggle */}
                      <label className="flex items-center gap-3 cursor-pointer group w-fit select-none">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={randomizeQuestions}
                            onChange={(e) => setRandomizeQuestions(e.target.checked)}
                          />
                          <div className={`w-10 h-6 rounded-full transition-colors ${randomizeQuestions ? "bg-blue-500" : "bg-gray-700"}`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${randomizeQuestions ? "translate-x-4" : ""}`}></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                          Randomize question order for this student
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-800/50 rounded-2xl border border-gray-700 w-fit">
                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "questions" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Questions List
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab("upload")}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "upload" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"}`}
                    >
                      Upload PDF
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveTab("add-question");
                        resetManualQuestionForm();
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "add-question" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"}`}
                    >
                      Add Question
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveTab("assignments");
                        fetchExamAssignments();
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "assignments" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"}`}
                    >
                      Assigned Exams
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-blue-400">
                      <FiLoader className="animate-spin mb-4" size={48} />
                      <p>Processing data...</p>
                    </div>
                  ) : activeTab === "questions" ? (
                    <div className="grid grid-cols-1 gap-4">
                      {questions.length === 0 ? (
                        <p className="text-center text-gray-500 py-20">
                          No questions found for this selection.
                        </p>
                      ) : (
                        questions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all group"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md uppercase tracking-wider">
                                Question {idx + 1}
                              </span>
                              <div className="flex gap-3">
                                <FiCheckCircle
                                  className={
                                    q.correctAnswer
                                      ? "text-green-400"
                                      : "text-gray-600"
                                  }
                                />
                                {isAdmin && (
                                  <button
                                    onClick={() =>
                                      handleDeleteSingleQuestion(q.id)
                                    }
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                  >
                                    <FiTrash2 size={18} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-lg font-medium text-gray-100 mb-4">
                              {q.text}
                              {q.textHindi && (
                                <span className="block text-sm text-gray-400 font-semibold italic mt-2 leading-relaxed">
                                  {q.textHindi}
                                </span>
                              )}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Object.entries(q.options || {}).map(
                                ([key, val]) => (
                                  <div
                                    key={key}
                                    className={`p-3 rounded-xl border ${
                                      q.correctAnswer === key
                                        ? "bg-green-500/10 border-green-500/50 text-green-200"
                                        : "bg-gray-900/50 border-gray-700 text-gray-400"
                                    }`}
                                  >
                                    <span className="font-black mr-2">
                                      {key}.
                                    </span>{" "}
                                    <span>{val}</span>
                                    {q.optionsHindi?.[key] && (
                                      <span className="block text-xs text-gray-500 mt-1 italic font-semibold">
                                        {q.optionsHindi[key]}
                                      </span>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : activeTab === "upload" ? (
                    <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                      <FiUpload size={48} className="text-blue-400 mb-6" />
                      <h3 className="text-2xl font-bold mb-2">
                        Upload Question PDF
                      </h3>
                      <p className="text-gray-400 max-w-md mb-8">
                        Upload a PDF file containing MCQs. Our AI will
                        automatically parse the questions, options, and correct
                        answers.
                      </p>
                      <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-2xl cursor-pointer shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        Select PDF File
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={handlePdfUpload}
                        />
                      </label>
                    </div>
                  ) : activeTab === "assignments" ? (
                    <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700 shadow-xl overflow-hidden">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <FiUsers className="text-blue-400" /> Student Exam Assignments
                        </h3>
                        
                        {/* Search and Filters Controls */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                          {/* Search bar */}
                          <div className="flex items-center bg-gray-900 border border-gray-750 rounded-xl px-4 py-2 w-full sm:w-64 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                            <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                              type="text"
                              placeholder="Search student or roll..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-transparent text-white outline-none w-full text-xs"
                            />
                          </div>

                          {/* Course dropdown */}
                          <select
                            value={selectedFilterCourse}
                            onChange={(e) => setSelectedFilterCourse(e.target.value)}
                            className="bg-gray-900 border border-gray-750 text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full sm:w-44"
                          >
                            <option value="">All Courses</option>
                            {courses.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {assignments.length === 0 ? (
                        <p className="text-center text-gray-500 py-20">No active or completed exam assignments found.</p>
                      ) : filteredAssignments.length === 0 ? (
                        <p className="text-center text-gray-500 py-20">No assignments match your search or filter.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-gray-700 text-gray-400 text-sm font-bold">
                                <th className="pb-3 pr-4">Student</th>
                                <th className="pb-3 pr-4">Course & Sem</th>
                                <th className="pb-3 pr-4">Exam Set</th>
                                <th className="pb-3 pr-4 text-center">Duration</th>
                                <th className="pb-3 pr-4 text-center">Status</th>
                                <th className="pb-3 pr-4 text-center">Score</th>
                                <th className="pb-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-sm">
                              {filteredAssignments.map((asg) => (
                                <tr key={asg.id} className="hover:bg-gray-900/30 transition-all">
                                  <td className="py-4 pr-4">
                                    <div className="font-bold text-white">{asg.studentName || "N/A"}</div>
                                    <div className="text-xs text-yellow-500 font-mono mt-0.5">{asg.rollNo}</div>
                                  </td>
                                  <td className="py-4 pr-4">
                                    <div className="text-gray-200">{asg.courseName}</div>
                                    <div className="text-xs text-gray-500">{asg.semesterName}</div>
                                  </td>
                                  <td className="py-4 pr-4">
                                    <div className="text-blue-300 font-semibold">{asg.setTitle}</div>
                                  </td>
                                  <td className="py-4 pr-4 text-center font-medium">{asg.duration || 90} Min</td>
                                  <td className="py-4 pr-4 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                      asg.status === "completed"
                                        ? "bg-green-500/10 text-green-400 border border-green-500/25"
                                        : asg.status === "in_progress"
                                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/25 animate-pulse"
                                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/25"
                                    }`}>
                                      {asg.status === "completed"
                                        ? "Completed"
                                        : asg.status === "in_progress"
                                        ? "In Progress"
                                        : "Pending"}
                                    </span>
                                  </td>
                                  <td className="py-4 pr-4 text-center font-bold text-lg text-white">
                                    {asg.status === "completed" ? asg.score : "-"}
                                  </td>
                                  <td className="py-4 text-right">
                                    <button
                                      onClick={() => handleDeassignExam(asg.id)}
                                      className="bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 font-bold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ml-auto animate-in duration-250"
                                      title="Deassign / Delete Exam Assignment"
                                    >
                                      <FiTrash2 /> Deassign
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : activeTab === "add-question" ? (
                    <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-3xl border border-gray-700 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-250">
                      <div className="border-b border-gray-700 pb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <FiPlus className="text-blue-400" /> Add Question Manually
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Fill in the details below. Missing Hindi fields will be translated automatically using Google Translate.
                        </p>
                      </div>

                      <form onSubmit={handleSaveManualQuestion} className="space-y-6">
                        {/* Question Text */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                              Question Text (English) <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              rows="3"
                              value={manualText}
                              onChange={(e) => setManualText(e.target.value)}
                              placeholder="Type the question in English..."
                              className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                              Question Text (Hindi) <span className="text-gray-500">(Optional - Auto-translated if blank)</span>
                            </label>
                            <textarea
                              rows="3"
                              value={manualTextHindi}
                              onChange={(e) => setManualTextHindi(e.target.value)}
                              placeholder="Type the question in Hindi or leave blank to auto-translate..."
                              className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                          <h4 className="text-md font-bold text-gray-300 border-b border-gray-750 pb-2">Options</h4>
                          
                          {/* Option A */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Option A (English) <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={manualOptA}
                                onChange={(e) => setManualOptA(e.target.value)}
                                placeholder="Option A in English"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Option A (Hindi) <span className="text-gray-500">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                value={manualOptAHindi}
                                onChange={(e) => setManualOptAHindi(e.target.value)}
                                placeholder="Option A in Hindi or leave blank"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>

                          {/* Option B */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Option B (English) <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={manualOptB}
                                onChange={(e) => setManualOptB(e.target.value)}
                                placeholder="Option B in English"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Option B (Hindi) <span className="text-gray-500">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                value={manualOptBHindi}
                                onChange={(e) => setManualOptBHindi(e.target.value)}
                                placeholder="Option B in Hindi or leave blank"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>

                          {/* Option C */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Option C (English) <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={manualOptC}
                                onChange={(e) => setManualOptC(e.target.value)}
                                placeholder="Option C in English"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Option C (Hindi) <span className="text-gray-500">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                value={manualOptCHindi}
                                onChange={(e) => setManualOptCHindi(e.target.value)}
                                placeholder="Option C in Hindi or leave blank"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>

                          {/* Option D */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Option D (English) <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={manualOptD}
                                onChange={(e) => setManualOptD(e.target.value)}
                                placeholder="Option D in English"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Option D (Hindi) <span className="text-gray-500">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                value={manualOptDHindi}
                                onChange={(e) => setManualOptDHindi(e.target.value)}
                                placeholder="Option D in Hindi or leave blank"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Correct Answer & Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                          <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                              Correct Option <span className="text-red-400">*</span>
                            </label>
                            <select
                              value={manualCorrect}
                              onChange={(e) => setManualCorrect(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                              required
                            >
                              <option value="A">Option A</option>
                              <option value="B">Option B</option>
                              <option value="C">Option C</option>
                              <option value="D">Option D</option>
                            </select>
                          </div>
                          
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={resetManualQuestionForm}
                              className="flex-1 bg-gray-750 hover:bg-gray-700 text-gray-200 border border-gray-700 font-bold py-3 px-6 rounded-xl transition-all"
                            >
                              Clear Form
                            </button>
                            <button
                              type="submit"
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                            >
                              Save Question
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <StudentExamPortal rollNumber={studentRollNumber} name={studentName} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-center mb-6">
              <div className="bg-red-500/20 p-4 rounded-full text-red-500">
                <FiTrash2 size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-400 text-center mb-8">
              {deleteModal.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ ...deleteModal, isOpen: false })
                }
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDashboard;
