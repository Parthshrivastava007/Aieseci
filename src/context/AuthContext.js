import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../Backend/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Cookie helper functions
const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax; Secure";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const eraseCookie = (name) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const allowedAdminEmail = "aieseci.anpara@gmail.com";
  const allowedAdminPassword = "Aieseci@220471";

  const fetchStudentEnrollment = async (rollNo, name) => {
    const formattedRoll = `AFT-${rollNo}`.replace(/\s+/g, "").toUpperCase();
    let q = query(
      collection(db, "enrollments"),
      where("rollNo", "==", formattedRoll)
    );
    let snapshot = await getDocs(q);

    // Fallback for legacy roll number formats
    if (snapshot.empty) {
      q = query(
        collection(db, "enrollments"),
        where("rollNo", "==", rollNo.trim())
      );
      snapshot = await getDocs(q);
    }

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    data.id = snapshot.docs[0].id;

    if (data.name?.trim().toLowerCase() !== name.trim().toLowerCase()) {
      return null;
    }

    return data;
  };

  const login = async (role, credentials) => {
    if (role === "admin") {
      const { email, password } = credentials;
      if (
        email.trim().toLowerCase() === allowedAdminEmail.toLowerCase() &&
        password === allowedAdminPassword
      ) {
        const adminData = { role: "admin", email: email.trim() };
        setUser(adminData);
        // Save to cookie (valid for 7 days)
        const token = btoa(JSON.stringify(adminData));
        setCookie("aieseci_token", token, 7);
        toast.success("Admin login successful");
        return { success: true };
      } else {
        toast.error("Invalid admin credentials");
        return { success: false, error: "Invalid admin credentials" };
      }
    } else if (role === "student") {
      const { name, rollNo } = credentials;
      try {
        const studentEnrollment = await fetchStudentEnrollment(rollNo, name);
        if (!studentEnrollment) {
          toast.error("Student roll number and name do not match or record not found");
          return { success: false, error: "Credentials do not match" };
        }

        const studentData = {
          role: "student",
          name: studentEnrollment.name,
          rollNo: rollNo.trim(),
        };
        
        setUser({
          ...studentData,
          enrollment: studentEnrollment,
        });

        // Save token to cookie (btoa encodes it to look like a session token)
        const token = btoa(JSON.stringify(studentData));
        setCookie("aieseci_token", token, 7);
        toast.success("Student login successful");
        return { success: true };
      } catch (err) {
        console.error(err);
        toast.error("Login failed due to an error");
        return { success: false, error: "Something went wrong" };
      }
    }
  };

  const logout = () => {
    setUser(null);
    eraseCookie("aieseci_token");
    toast("Logged out successfully");
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getCookie("aieseci_token");
        if (token) {
          const parsed = JSON.parse(atob(token));
          if (parsed.role === "admin") {
            setUser(parsed);
          } else if (parsed.role === "student") {
            // Re-fetch enrollment to ensure it is up-to-date and still exists
            const enrollment = await fetchStudentEnrollment(parsed.rollNo, parsed.name);
            if (enrollment) {
              setUser({
                ...parsed,
                enrollment,
              });
            } else {
              // enrollment no longer valid
              eraseCookie("aieseci_token");
            }
          }
        }
      } catch (err) {
        console.error("Auth initialization failed", err);
        eraseCookie("aieseci_token");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
