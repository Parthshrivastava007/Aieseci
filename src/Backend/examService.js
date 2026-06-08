import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

// Collection Names
const COLLECTIONS = {
  COURSES: "exam_courses",
  SEMESTERS: "exam_semesters",
  SETS: "exam_question_sets",
  QUESTIONS: "exam_questions",
  ASSIGNMENTS: "exam_assignments"
};

// Course Logic
export const createCourse = async (courseData) => {
  return await addDoc(collection(db, COLLECTIONS.COURSES), {
    ...courseData,
    createdAt: serverTimestamp()
  });
};

export const getCourses = async () => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

// Semester Logic
export const createSemester = async (semesterData) => {
  return await addDoc(collection(db, COLLECTIONS.SEMESTERS), {
    ...semesterData,
    createdAt: serverTimestamp()
  });
};

export const getSemesters = async (courseId) => {
  const q = query(collection(db, COLLECTIONS.SEMESTERS), where("courseId", "==", courseId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

// Question Set Logic
export const createQuestionSet = async (setData) => {
  return await addDoc(collection(db, COLLECTIONS.SETS), {
    ...setData,
    createdAt: serverTimestamp()
  });
};

export const getQuestionSets = async (semesterId) => {
  const q = query(collection(db, COLLECTIONS.SETS), where("semesterId", "==", semesterId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

// Question Logic
export const addQuestion = async (questionData) => {
  return await addDoc(collection(db, COLLECTIONS.QUESTIONS), {
    ...questionData,
    createdAt: serverTimestamp()
  });
};

export const bulkAddQuestions = async (questions, courseId, semesterId, setId = null) => {
  const promises = questions.map(q => addQuestion({
    ...q,
    courseId,
    semesterId,
    setId,
  }));
  return Promise.all(promises);
};

export const getQuestions = async (courseId, semesterId = null, setId = null) => {
  let q;
  if (setId) {
    q = query(
      collection(db, COLLECTIONS.QUESTIONS), 
      where("courseId", "==", courseId),
      where("semesterId", "==", semesterId),
      where("setId", "==", setId)
    );
  } else if (semesterId) {
    q = query(
      collection(db, COLLECTIONS.QUESTIONS), 
      where("courseId", "==", courseId),
      where("semesterId", "==", semesterId)
    );
  } else {
    q = query(collection(db, COLLECTIONS.QUESTIONS), where("courseId", "==", courseId));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const deleteQuestion = async (questionId) => {
  await deleteDoc(doc(db, COLLECTIONS.QUESTIONS, questionId));
};

export const deleteQuestionsInSet = async (setId) => {
  const q = query(collection(db, COLLECTIONS.QUESTIONS), where("setId", "==", setId));
  const snapshot = await getDocs(q);
  
  const promises = snapshot.docs.map(document => deleteDoc(doc(db, COLLECTIONS.QUESTIONS, document.id)));
  return Promise.all(promises);
};

export const deleteQuestionSet = async (setId) => {
  // First delete all questions in the set
  await deleteQuestionsInSet(setId);
  // Then delete the set itself
  await deleteDoc(doc(db, COLLECTIONS.SETS, setId));
};

// Exam Assignment Logic
export const assignExam = async (assignmentData) => {
  return await addDoc(collection(db, COLLECTIONS.ASSIGNMENTS), {
    ...assignmentData,
    status: "pending",
    score: null,
    createdAt: serverTimestamp()
  });
};

export const getStudentAssignments = async (rollNo) => {
  const q = query(
    collection(db, COLLECTIONS.ASSIGNMENTS), 
    where("rollNo", "==", rollNo)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const getAssignment = async (assignmentId) => {
  const ref = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { ...snap.data(), id: snap.id };
  }
  return null;
};

export const submitExam = async (assignmentId, score) => {
  const ref = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
  await updateDoc(ref, {
    status: "completed",
    score: score,
    submittedAt: serverTimestamp()
  });
};

export const saveExamProgress = async (assignmentId, savedAnswers, timeLeft) => {
  const ref = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
  await updateDoc(ref, {
    status: "in_progress",
    savedAnswers,
    timeLeft
  });
};

export const getAllAssignments = async () => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.ASSIGNMENTS));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const deassignExam = async (assignmentId) => {
  const ref = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
  await deleteDoc(ref);
};

// Exam PIN Security Logic
export const getSecuritySettings = async () => {
  const docRef = doc(db, "exam_settings", "security");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      accessPin: docSnap.data().accessPin || "",
      isEnabled: docSnap.data().isEnabled === true,
    };
  }
  return { accessPin: "", isEnabled: false };
};

export const setSecuritySettings = async (accessPin, isEnabled) => {
  const docRef = doc(db, "exam_settings", "security");
  await setDoc(docRef, { accessPin, isEnabled });
};
