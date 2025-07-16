import React from "react";

const EnrollmentFilters = ({
  searchRollNo,
  setSearchRollNo,
  selectedCourse,
  setSelectedCourse,
  courseOptions,
}) => (
  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
    <input
      type="text"
      placeholder="Search by Roll No or Name"
      value={searchRollNo}
      onChange={(e) => setSearchRollNo(e.target.value)}
      className="p-2 text-black rounded w-full"
    />
    <select
      value={selectedCourse}
      onChange={(e) => setSelectedCourse(e.target.value)}
      className="p-2 text-black rounded w-full"
    >
      <option value="">All Courses</option>
      {courseOptions.map((course, idx) => (
        <option key={idx} value={course}>
          {course}
        </option>
      ))}
    </select>
    <button
      onClick={() => {
        setSearchRollNo("");
        setSelectedCourse("");
      }}
      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white w-full"
    >
      Clear Filters
    </button>
  </div>
);

export default EnrollmentFilters;
