import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Contact from "./pages/Contact";
import { Toaster } from "react-hot-toast";
import CourseForm from "./components/CourseFrom";
import EnrollmentTable from "./pages/EnrollementTable";
import StudentFeeTracker from "./components/StudentFeeTracker";
import ExamDashboard from "./components/ExamDashboard";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/enroll" element={<CourseForm />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/enrollementtable" element={<EnrollmentTable />} />
          <Route path="/feetracker" element={<StudentFeeTracker />} />
          <Route path="/exams" element={<ExamDashboard />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
