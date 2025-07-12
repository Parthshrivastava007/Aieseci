import React from "react";

const Courses = () => {
  const courseList = [
    {
      title: "DCA+",
      description:
        "Advanced computer applications course designed for professionals aiming to enhance their IT skills.",
    },
    {
      title: "CCC",
      description:
        "A basic course for computer literacy and essential digital skills suitable for everyone.",
    },
    {
      title: "O-Level",
      description:
        "Foundation-level IT course to help you start your career in the IT industry.",
    },
    {
      title: "DFA",
      description:
        "Diploma in Financial Accounting, focusing on accounting software and financial management.",
    },
    {
      title: "CCO",
      description:
        "Certificate in Computer Operations, emphasizing office tools and basic computer knowledge.",
    },
    {
      title: "ADCA",
      description:
        "Advanced Diploma in Computer Applications, offering in-depth knowledge of computer fundamentals, programming, and IT tools.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-12 animate-fade-in">
        Our Courses
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl w-full">
        {courseList.map((course, index) => (
          <div
            key={index}
            className="relative p-6 bg-gray-800 rounded-xl shadow-lg border-2 border-transparent transition-transform transform hover:scale-105 hover:border-cyan-400 hover:shadow-cyan-400 animate-slide-up"
          >
            <div className="absolute inset-0 blur-sm opacity-50 bg-gradient-to-br from-blue-800 to-indigo-400 rounded-xl -z-10"></div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {course.title}
            </h3>
            <p className="text-gray-300">{course.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
