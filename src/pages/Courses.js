import React, { useState } from "react";
import { Link } from "react-router-dom";
import { courseList } from "../components/CoursesData";

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-12 animate-fade-in">
        Our Courses
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl w-full">
        {courseList.map((course, index) => (
          <div
            key={index}
            onClick={() => setSelectedCourse(course)}
            className="cursor-pointer relative p-6 bg-gray-800 rounded-xl shadow-lg border-2 border-transparent transition-transform transform hover:scale-105 hover:border-cyan-400 hover:shadow-cyan-400 animate-slide-up"
          >
            <div className="absolute inset-0 blur-sm opacity-50 bg-gradient-to-br from-blue-800 to-indigo-400 rounded-xl -z-10"></div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {course.title}
            </h3>
            <p className="text-gray-300 mb-3">{course.short}</p>
            <Link
              to={`/enroll?course=${encodeURIComponent(course.title)}`}
              className="block text-center bg-blue-500 font-black hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md"
              onClick={() => setSelectedCourse(null)}
            >
              Proceed to Enroll
            </Link>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
          <div className="bg-white max-w-2xl w-full rounded-lg shadow-2xl p-6 relative max-h-[90vh] overflow-hidden">
            <button
              className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-2xl font-bold"
              onClick={() => setSelectedCourse(null)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4 text-indigo-700 border-b pb-2">
              {selectedCourse.title}
            </h2>

            {/* Course description */}
            <div className="overflow-y-auto pr-2 mb-4 max-h-[60vh] custom-scroll">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {selectedCourse.full}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
