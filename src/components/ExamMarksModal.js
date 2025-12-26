import { useState, useEffect } from "react";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../Backend/firebase";
import { toast } from "react-toastify";

const ExamMarksModal = ({ student, onClose }) => {
  const [semester, setSemester] = useState("semester1");
  const [totalMarks, setTotalMarks] = useState("");
  const [obtainedMarks, setObtainedMarks] = useState("");

  // 🔹 Load existing marks when semester changes
  useEffect(() => {
    const semData = student?.marks?.[semester];
    if (semData) {
      setTotalMarks(semData.totalMarks);
      setObtainedMarks(semData.obtainedMarks);
    } else {
      setTotalMarks("");
      setObtainedMarks("");
    }
  }, [semester, student]);

  // 🔹 Save / Update Marks
  const handleSaveOrUpdate = async () => {
    if (!totalMarks || !obtainedMarks) {
      toast.error("Please fill all fields");
      return;
    }

    if (Number(obtainedMarks) > Number(totalMarks)) {
      toast.error("Obtained marks cannot exceed total marks");
      return;
    }

    try {
      await updateDoc(doc(db, "enrollments", student.id), {
        [`marks.${semester}`]: {
          totalMarks: Number(totalMarks),
          obtainedMarks: Number(obtainedMarks),
        },
      });

      toast.success("Marks saved successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save marks");
      console.error(error);
    }
  };

  // 🔹 Delete Marks
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${semester} marks?`
    );
    if (!confirmDelete) return;

    try {
      await updateDoc(doc(db, "enrollments", student.id), {
        [`marks.${semester}`]: deleteField(),
      });

      toast.success("Marks deleted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to delete marks");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded w-80 text-white">
        <h2 className="text-xl font-bold mb-4">Exam Marks – {student.name}</h2>

        {/* Semester Selector */}
        <select
          className="w-full mb-3 p-2 text-black rounded"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="semester1">Semester 1</option>
          <option value="semester2">Semester 2</option>
        </select>

        {/* Total Marks */}
        <input
          type="number"
          placeholder="Total Marks"
          value={totalMarks}
          onChange={(e) => setTotalMarks(e.target.value)}
          className="w-full mb-3 p-2 text-black rounded"
        />

        {/* Obtained Marks */}
        <input
          type="number"
          placeholder="Marks Obtained"
          value={obtainedMarks}
          onChange={(e) => setObtainedMarks(e.target.value)}
          className="w-full mb-4 p-2 text-black rounded"
        />

        <div className="flex justify-between gap-x-2">
          <button
            onClick={handleSaveOrUpdate}
            className="bg-green-600 px-2 py-2 rounded"
          >
            Save/Update
          </button>

          {student?.marks?.[semester] && (
            <button
              onClick={handleDelete}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Delete
            </button>
          )}

          <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamMarksModal;
