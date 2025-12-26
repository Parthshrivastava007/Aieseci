import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../Backend/firebase";
import { toast } from "react-toastify";

const ExamMarksModal = ({ student, onClose }) => {
  const [semester, setSemester] = useState("semester1");
  const [totalMarks, setTotalMarks] = useState("");
  const [obtainedMarks, setObtainedMarks] = useState("");

  const handleSubmit = async () => {
    if (!totalMarks || !obtainedMarks) {
      toast.error("Please fill all fields");
      return;
    }

    if (Number(obtainedMarks) > Number(totalMarks)) {
      toast.error("Obtained marks cannot be greater than total marks");
      return;
    }

    try {
      await updateDoc(doc(db, "enrollments", student.id), {
        [`marks.${semester}`]: {
          totalMarks: Number(totalMarks),
          obtainedMarks: Number(obtainedMarks),
        },
      });

      toast.success("Marks uploaded successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to upload marks");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded w-80 text-white">
        <h2 className="text-xl font-bold mb-4">
          Upload Marks – {student.name}
        </h2>

        {/* Semester Select */}
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

        {/* Marks Obtained */}
        <input
          type="number"
          placeholder="Marks Obtained"
          value={obtainedMarks}
          onChange={(e) => setObtainedMarks(e.target.value)}
          className="w-full mb-4 p-2 text-black rounded"
        />

        <div className="flex justify-between">
          <button
            onClick={handleSubmit}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Save
          </button>
          <button onClick={onClose} className="bg-red-600 px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamMarksModal;
