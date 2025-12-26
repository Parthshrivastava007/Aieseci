import React from "react";

const StudentExamMarksModal = ({ student, onClose }) => {
  const marks = student?.marks;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded w-[380px] text-white">
        <h2 className="text-xl font-bold mb-4 text-center">📊 Exam Marks</h2>

        {/* If marks not uploaded */}
        {!marks ? (
          <p className="text-center text-yellow-400">Marks not uploaded yet.</p>
        ) : (
          Object.keys(marks).map((semester) => (
            <div key={semester} className="mb-4 border-b border-gray-600 pb-3">
              <h3 className="font-semibold mb-2">
                {semester.replace("semester", "Semester ")}
              </h3>

              <div className="flex justify-between mb-1">
                <span>Total Marks</span>
                <span>{marks[semester].totalMarks}</span>
              </div>

              <div className="flex justify-between mb-1">
                <span>Marks Obtained</span>
                <span>{marks[semester].obtainedMarks}</span>
              </div>

              <div className="flex justify-between font-semibold text-green-400">
                <span>Percentage</span>
                <span>
                  {(
                    (marks[semester].obtainedMarks /
                      marks[semester].totalMarks) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
            </div>
          ))
        )}

        <button
          onClick={onClose}
          className="bg-red-600 w-full mt-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StudentExamMarksModal;
