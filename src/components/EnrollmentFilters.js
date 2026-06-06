import React from "react";

const EnrollmentFilters = ({
  searchRollNo,
  setSearchRollNo,
  selectedCourse,
  setSelectedCourse,
  courseOptions,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => (
  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        Search Student
      </label>
      <input
        type="text"
        placeholder="Search by Roll No or Name"
        value={searchRollNo}
        onChange={(e) => setSearchRollNo(e.target.value)}
        className="p-2 text-black rounded w-full border border-gray-700 bg-white"
      />
    </div>

    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        Course Filter
      </label>
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="p-2 text-black rounded w-full border border-gray-700 bg-white"
      >
        <option value="">All Courses</option>
        {courseOptions.map((course, idx) => (
          <option key={idx} value={course}>
            {course}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        Enrollment Start Date
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="p-2 text-black rounded w-full border border-gray-700 bg-white"
      />
    </div>

    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        Enrollment End Date
      </label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="p-2 text-black rounded w-full border border-gray-700 bg-white"
      />
    </div>

    <button
      onClick={() => {
        setSearchRollNo("");
        setSelectedCourse("");
        setStartDate("");
        setEndDate("");
      }}
      className="bg-gray-600 hover:bg-gray-700 px-4 py-2.5 rounded text-white w-full font-bold transition-all h-[42px] flex items-center justify-center"
    >
      Clear Filters
    </button>
  </div>
);

export default EnrollmentFilters;
