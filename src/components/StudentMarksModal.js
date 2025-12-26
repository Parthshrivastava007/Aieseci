import React from "react";

const StudentExamMarksModal = ({ student, onClose }) => {
  const marks = student?.marks;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded w-[420px] text-white">
        <h2 className="text-xl font-bold mb-4 text-center">📊 Exam Marks</h2>

        {/* ================= STUDENT DETAILS ================= */}
        <div className="mb-4 border-b border-gray-600 pb-3 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Name</span>
            <span>{student?.name}</span>
          </div>

          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Father Name</span>
            <span>{student?.fatherName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Date of Birth</span>
            <span>{student?.dob}</span>
          </div>
        </div>

        {/* ================= MARKS SECTION ================= */}
        {!marks ? (
          <p className="text-center text-yellow-400">Marks not uploaded yet.</p>
        ) : (
          Object.keys(marks).map((semester) => {
            const total = marks[semester].totalMarks;
            const obtained = marks[semester].obtainedMarks;

            const percentage = ((obtained / total) * 100).toFixed(2);
            const isFail = percentage < 30;

            return (
              <div
                key={semester}
                className="mb-4 border-b border-gray-600 pb-3"
              >
                <h3 className="font-semibold mb-2">
                  {semester.replace("semester", "Semester ")}
                </h3>

                <div className="flex justify-between mb-1">
                  <span>Total Marks</span>
                  <span>{total}</span>
                </div>

                <div className="flex justify-between mb-1">
                  <span>Marks Obtained</span>
                  <span>{obtained}</span>
                </div>

                <div className="flex justify-between mb-1">
                  <span>Percentage</span>
                  <span>{percentage}%</span>
                </div>

                {/* PASS / FAIL STATUS */}
                <div className="flex justify-between font-semibold">
                  <span>Status</span>
                  <span className={isFail ? "text-red-500" : "text-green-500"}>
                    {isFail ? "FAIL" : "PASS"}
                  </span>
                </div>
              </div>
            );
          })
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
