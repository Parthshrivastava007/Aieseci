import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { db } from "../Backend/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineUserGroup,
  HiOutlineCreditCard,
} from "react-icons/hi";
import { FaRegIdCard, FaRegAddressCard } from "react-icons/fa"; // eslint-disable-line

const CourseForm = () => {
  const [searchParams] = useSearchParams();
  const courseName = searchParams.get("course");

  const todayDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    email: "",
    rollNo: "",
    phone: "",
    aadhaar: "",
    address: "",
    dob: "",
    course: courseName || "",
    dateOfEnrollment: todayDate,
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const [activeField, setActiveField] = useState(null); // eslint-disable-line
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate form progress
  useEffect(() => {
    const requiredFields = ["name", "dob", "fatherName", "phone", "address"];
    const filledFields = requiredFields.filter(
      (field) => formData[field]?.trim() !== "",
    ).length;
    setFormProgress((filledFields / requiredFields) * 100);
  }, [formData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docId = `${formData.rollNo || "noRoll"}_${formData.phone}`;

      const q = query(
        collection(db, "enrollments"),
        where("phone", "==", formData.phone),
        ...(formData.rollNo
          ? [where("rollNo", "==", `AFT-${formData.rollNo}`)]
          : []),
      );

      const snapshot = await getDocs(q);

      const rollNoWithPrefix =
        !["CCC", "O-Level"].includes(courseName) && formData.rollNo
          ? `AFT-${formData.rollNo}`
          : "";

      const enrollmentData = {
        ...formData,
        rollNo: rollNoWithPrefix,
        [snapshot.empty ? "createdAt" : "updatedAt"]: new Date(),
      };

      await setDoc(doc(db, "enrollments", docId), enrollmentData);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      toast.success(
        <div className="flex items-center space-x-3">
          <HiOutlineCheckCircle className="text-2xl text-green-400" />
          <div>
            <p className="font-semibold">
              {snapshot.empty
                ? "Enrollment Successful!"
                : "Enrollment Updated!"}
            </p>
            <p className="text-sm text-gray-400">
              {snapshot.empty
                ? "Welcome to AIESECI!"
                : "Your information has been updated"}
            </p>
          </div>
        </div>,
        {
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #10b981",
            borderRadius: "12px",
          },
          duration: 4000,
        },
      );

      setFormData({
        name: "",
        fatherName: "",
        email: "",
        rollNo: "",
        phone: "",
        aadhaar: "",
        address: "",
        dob: "",
        course: courseName || "",
        dateOfEnrollment: todayDate,
      });
      setCurrentStep(1);
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Something went wrong. Please try again.", {
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #ef4444",
          borderRadius: "12px",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.dob || !formData.fatherName) {
        toast.error("Please fill in all required fields", {
          style: { background: "#1f2937", color: "#fff" },
        });
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  };

  const stepVariants = {
    enter: {
      x: 50,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      x: -50,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    }),
    focus: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const steps = [
    { number: 1, title: "Personal Info", icon: HiOutlineUser },
    { number: 2, title: "Contact Details", icon: HiOutlinePhone },
    { number: 3, title: "Additional Info", icon: HiOutlineDocumentText },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <ToastContainer position="top-right" />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <motion.div
          className="w-full max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            variants={fieldVariants}
            custom={0}
          >
            <motion.div className="inline-block mb-4" animate={pulseAnimation}>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-blue-400 text-sm font-semibold">
                Course Enrollment
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-2"
              variants={floatAnimation}
              initial="initial"
              animate="animate"
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {courseName}
              </span>
            </motion.h1>

            <motion.p className="text-gray-400">
              Fill in your details to enroll in this course
            </motion.p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div className="mb-8" variants={fieldVariants} custom={1}>
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1 text-center">
                  <motion.div
                    className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                      currentStep >= step.number
                        ? "bg-gradient-to-r from-blue-500 to-purple-500"
                        : "bg-gray-700"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <step.icon className="text-white text-lg" />
                    {index < steps.length - 1 && (
                      <motion.div
                        className="absolute left-full w-full h-0.5 bg-gray-700"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: currentStep > step.number ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ originX: 0 }}
                      >
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500" />
                      </motion.div>
                    )}
                  </motion.div>
                  <p className="text-sm text-gray-400">{step.title}</p>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${formProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={formVariants}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                    <HiOutlineUser className="text-blue-400" />
                    <span>Personal Information</span>
                  </h3>

                  <motion.div
                    variants={fieldVariants}
                    custom={0}
                    whileHover="focus"
                    className="space-y-2"
                  >
                    <label className="block text-gray-300 font-semibold flex items-center space-x-2">
                      <HiOutlineUser className="text-blue-400" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      required
                      onChange={handleChange}
                      onFocus={() => setActiveField("name")}
                      onBlur={() => setActiveField(null)}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </motion.div>

                  <motion.div
                    variants={fieldVariants}
                    custom={1}
                    whileHover="focus"
                    className="space-y-2"
                  >
                    <label className="block text-gray-300 font-semibold flex items-center space-x-2">
                      <HiOutlineCalendar className="text-blue-400" />
                      <span>Date of Birth *</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      required
                      onChange={handleChange}
                      onFocus={() => setActiveField("dob")}
                      onBlur={() => setActiveField(null)}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div
                    variants={fieldVariants}
                    custom={2}
                    whileHover="focus"
                    className="space-y-2"
                  >
                    <label className="block text-gray-300 font-semibold flex items-center space-x-2">
                      <HiOutlineUserGroup className="text-blue-400" />
                      <span>Father's Name *</span>
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      required
                      onChange={handleChange}
                      onFocus={() => setActiveField("fatherName")}
                      onBlur={() => setActiveField(null)}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      placeholder="Enter father's name"
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                    <HiOutlinePhone className="text-blue-400" />
                    <span>Contact Details</span>
                  </h3>

                  <motion.div
                    variants={fieldVariants}
                    custom={0}
                    whileHover="focus"
                    className="space-y-2"
                  >
                    <label className="block text-gray-300 font-semibold flex items-center space-x-2">
                      <HiOutlineMail className="text-blue-400" />
                      <span>Email (Optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setActiveField("email")}
                      onBlur={() => setActiveField(null)}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </motion.div>

                  <motion.div
                    variants={fieldVariants}
                    custom={1}
                    whileHover="focus"
                    className="space-y-2"
                  >
                    <label className="block text-gray-300 font-semibold flex items-center space-x-2">
                      <HiOutlinePhone className="text-blue-400" />
                      <span>Mobile Number *</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, "");
                        setFormData((prev) => ({
                          ...prev,
                          phone: onlyNums,
                        }));
                      }}
                      onFocus={() => setActiveField("phone")}
                      onBlur={() => setActiveField(null)}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      placeholder="Enter your mobile number"
                    />
                  </motion.div>

                  <motion.div
                    variants={fieldVariants}
                    custom={2}
                    whileHover="focus"
                    className="space-y-2"
                  >
                    <label className="block text-gray-300 font-semibold flex items-center space-x-2">
                      <HiOutlineLocationMarker className="text-blue-400" />
                      <span>Address *</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      required
                      onChange={handleChange}
                      onFocus={() => setActiveField("address")}
                      onBlur={() => setActiveField(null)}
                      rows="3"
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 resize-none"
                      placeholder="Enter your full address"
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Step 3: Additional Information */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                    <HiOutlineDocumentText className="text-blue-400" />
                    <span>Additional Information</span>
                  </h3>

                  {!["CCC", "O-Level"].includes(courseName) && (
                    <motion.div
                      variants={fieldVariants}
                      custom={0}
                      whileHover="focus"
                      className="space-y-2"
                    >
                      <label className="block text-gray-300 font-semibold flex items-center space-x-2">
                        <FaRegIdCard className="text-blue-400" />
                        <span>Roll Number</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-600 text-gray-300 rounded-l-xl border border-r-0 border-gray-600">
                          AFT-
                        </span>
                        <input
                          type="text"
                          name="rollNo"
                          value={formData.rollNo}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              rollNo: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          onFocus={() => setActiveField("rollNo")}
                          onBlur={() => setActiveField(null)}
                          className="flex-1 p-3 bg-gray-700/50 border border-gray-600 rounded-r-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                          placeholder="Enter roll number"
                        />
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    variants={fieldVariants}
                    custom={1}
                    whileHover="focus"
                    className="space-y-2"
                  >
                    <label className="block text-gray-300 font-semibold flex items-center space-x-2">
                      <HiOutlineCreditCard className="text-blue-400" />
                      <span>Aadhaar Number (Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="aadhaar"
                      value={formData.aadhaar}
                      pattern="\d{12}"
                      maxLength={12}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, "");
                        setFormData((prev) => ({
                          ...prev,
                          aadhaar: onlyNums,
                        }));
                      }}
                      onFocus={() => setActiveField("aadhaar")}
                      onBlur={() => setActiveField(null)}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      placeholder="Enter 12-digit Aadhaar number"
                    />
                  </motion.div>

                  <motion.div
                    variants={fieldVariants}
                    custom={2}
                    className="space-y-2"
                  >
                    <label className="block text-gray-300 font-semibold flex items-center space-x-2">
                      <HiOutlineCalendar className="text-blue-400" />
                      <span>Date of Enrollment</span>
                    </label>
                    <input
                      type="text"
                      name="dateOfEnrollment"
                      value={formData.dateOfEnrollment}
                      disabled
                      className="w-full p-3 bg-gray-600/50 border border-gray-600 rounded-xl text-gray-300 cursor-not-allowed"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <motion.div
              className="flex justify-between mt-8"
              variants={fieldVariants}
              custom={3}
            >
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors duration-300 flex items-center space-x-2"
                >
                  <HiOutlineArrowRight className="rotate-180" />
                  <span>Previous</span>
                </motion.button>
              )}

              {currentStep < 3 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ml-auto"
                >
                  <span>Next</span>
                  <HiOutlineArrowRight />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={loading}
                  variants={buttonVariants}
                  whileHover={!loading ? "hover" : {}}
                  whileTap={!loading ? "tap" : {}}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Enrollment</span>
                      <HiOutlineCheckCircle />
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          </motion.form>

          {/* Success Animation */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3"
              >
                <HiOutlineCheckCircle className="text-2xl" />
                <div>
                  <p className="font-semibold">Enrollment Successful!</p>
                  <p className="text-sm opacity-90">Welcome to AIESECI</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CourseForm;
