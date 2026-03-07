import React from "react";

const StudentExamMarksModal = ({ student, onClose }) => {
  const marks = student?.marks;

  const instituteName = "AIESECI";
  const instituteAddress = "Anpara, Auri More";

  // Calculate total statistics
  const totalSemesters = marks ? Object.keys(marks).length : 0;
  const passedSemesters = marks
    ? Object.values(marks).filter((sem) => {
        const percentage = (sem.obtainedMarks / sem.totalMarks) * 100;
        return percentage >= 30;
      }).length
    : 0;
  const overallPercentage = marks
    ? (
        (Object.values(marks).reduce((acc, sem) => acc + sem.obtainedMarks, 0) /
          Object.values(marks).reduce((acc, sem) => acc + sem.totalMarks, 0)) *
        100
      ).toFixed(2)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
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

        {/* Student Profile Card */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {student?.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{student?.name}</h3>
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

        {/* Summary Stats (if marks exist) */}
        {marks && (
          <div className="grid grid-cols-3 gap-3 p-5 bg-gray-800/50">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Total Semesters</p>
              <p className="text-2xl font-bold text-white">{totalSemesters}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Semesters Passed</p>
              <p className="text-2xl font-bold text-green-400">
                {passedSemesters}
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

          {!marks ? (
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
            <div className="space-y-4">
              {Object.keys(marks).map((semester, index) => {
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
        </div>
      </div>
    </div>
  );
};

export default StudentExamMarksModal;
