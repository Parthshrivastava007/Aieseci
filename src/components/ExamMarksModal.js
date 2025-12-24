import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../Backend/firebase";
import { toast } from "react-toastify";

const ExamMarksModal = ({ student, onClose }) => {
  const [semester, setSemester] = useState("semester1");
  const [marks, setMarks] = useState({
    maths: "",
    physics: "",
    chemistry: "",
  });

  const handleChange = (e) => {
    setMarks({ ...marks, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await updateDoc(doc(db, "enrollments", student.id), {
      [`marks.${semester}`]: {
        maths: Number(marks.maths),
        physics: Number(marks.physics),
        chemistry: Number(marks.chemistry),
      },
    });

    toast.success("Marks uploaded");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded w-80">
        <h2 className="text-xl font-bold mb-4">
          Upload Marks – {student.name}
        </h2>

        <select
          className="w-full mb-2 p-2 text-black"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="semester1">Semester 1</option>
          <option value="semester2">Semester 2</option>
        </select>

        <input
          name="maths"
          placeholder="Maths"
          onChange={handleChange}
          className="w-full mb-2 p-2 text-black"
        />
        <input
          name="physics"
          placeholder="Physics"
          onChange={handleChange}
          className="w-full mb-2 p-2 text-black"
        />
        <input
          name="chemistry"
          placeholder="Chemistry"
          onChange={handleChange}
          className="w-full mb-4 p-2 text-black"
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
