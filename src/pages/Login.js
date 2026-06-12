import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AccessCard from "../components/AccessCard";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [studentName, setStudentName] = useState("");
  const [studentRollNumber, setStudentRollNumber] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleAccess = async (role) => {
    setErrorMessage("");
    let result;
    if (role === "admin") {
      result = await login("admin", { email: adminEmail, password: adminPassword });
    } else {
      if (!studentName.trim() || !studentRollNumber.trim()) {
        setErrorMessage("Name and Roll Number are required");
        return;
      }
      result = await login("student", { name: studentName, rollNo: studentRollNumber });
    }

    if (result && !result.success) {
      setErrorMessage(result.error || "Authentication failed");
    }
  };

  return (
    <AccessCard
      studentName={studentName}
      setStudentName={setStudentName}
      studentRollNumber={studentRollNumber}
      setStudentRollNumber={setStudentRollNumber}
      adminEmail={adminEmail}
      setAdminEmail={setAdminEmail}
      adminPassword={adminPassword}
      setAdminPassword={setAdminPassword}
      handleAccess={handleAccess}
      errorMessage={errorMessage}
      variant="dashboard"
    />
  );
};

export default Login;
