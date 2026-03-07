import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlinePaperAirplane,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi";
import { FaInstagram } from "react-icons/fa";
import { MdOutlineSend } from "react-icons/md";

const Contact = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    rollnumber: "",
    message: "",
  });
  const formRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // eslint-disable-line

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setIsLoading(false);
    setEmailError("");
    if (!isModalOpen) {
      setFormData({
        name: "",
        email: "",
        mobile: "",
        rollnumber: "",
        message: "",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError("");
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/aieseci.anpara@gmail.com",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: new FormData(formRef.current),
        },
      );

      if (response.ok) {
        setIsLoading(false);
        formRef.current.reset();
        setFormData({
          name: "",
          email: "",
          mobile: "",
          rollnumber: "",
          message: "",
        });
        toggleModal();
        toast.success(
          <div className="flex items-center space-x-3">
            <HiOutlineCheckCircle className="text-2xl text-green-400" />
            <div>
              <p className="font-semibold">Message Sent!</p>
              <p className="text-sm text-gray-400">
                We'll get back to you soon
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
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setIsLoading(false);
      toast.error("Failed to send message. Try again.", {
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #ef4444",
          borderRadius: "12px",
        },
      });
    }
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const pulseAnimation = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const contactInfo = [
    {
      icon: HiOutlineLocationMarker,
      title: "Visit Us",
      details: ["Anpara, Sonbhadra", "Uttar Pradesh, India"],
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      icon: HiOutlinePhone,
      title: "Call Us",
      details: [
        "+91 99196 70620",
        "+91 76519 25552",
        "+91 94153 91502",
        "+91 91253 60702",
      ],
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-400",
    },
    {
      icon: HiOutlineMail,
      title: "Email Us",
      details: ["aieseci.anpara@gmail.com"],
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
    {
      icon: HiOutlineClock,
      title: "Working Hours",
      details: ["Mon - Sat: 9:00 AM - 7:00 PM", "Sunday: Closed"],
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-400",
    },
  ];

  const socialLinks = [
    {
      icon: FaInstagram,
      href: "https://www.instagram.com/aieseci_computer",
      label: "Instagram",
      color: "hover:text-pink-400",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
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
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1000),
            }}
            animate={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1000),
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
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp} className="inline-block">
            <span className="px-4 py-2 bg-blue-500/10 rounded-full text-blue-400 text-sm font-semibold mb-4 inline-block">
              Get in Touch
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Let's Connect
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </motion.p>
        </motion.div>

        {/* Contact Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.title}
              variants={scaleIn}
              whileHover={{
                y: -5,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${info.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
              />

              <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300">
                <div
                  className={`w-14 h-14 ${info.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <info.icon className={`text-2xl ${info.iconColor}`} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {info.title}
                </h3>

                <div className="space-y-1">
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-gray-400 text-sm">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Contact Section */}
        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Contact Form Preview */}
          <motion.div
            variants={slideInLeft}
            className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Send a Message
            </h2>

            <div className="space-y-4">
              <motion.button
                onClick={toggleModal}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Open Contact Form</span>
                <MdOutlineSend className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column - Map & Social */}
          <motion.div variants={slideInRight} className="space-y-6">
            {/* Map */}
            <motion.div
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 h-64 relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29114.592912892836!2d82.75925439264869!3d24.19542564296271!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398f253a3cedbf09%3A0x6df8402aa1b510d5!2sAIESECI%20COMPUTER!5e0!3m2!1sen!2sin!4v1732431368946!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "1rem" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AIESECI Computer Location"
                className="w-full h-full"
              />

              <motion.div
                className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <HiOutlineLocationMarker className="text-red-400" />
                <span className="text-sm">AIESECI Computer Institute</span>
              </motion.div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
              variants={fadeInUp}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Connect With Us
              </h3>

              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center text-gray-400 ${social.color} transition-colors duration-300`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon className="text-xl" />
                  </motion.a>
                ))}
              </div>

              <motion.p
                className="text-gray-500 text-sm mt-4"
                animate={pulseAnimation}
              >
                ⚡ Usually replies within an hour
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={toggleModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 w-full max-w-2xl"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="relative p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">
                  Send Your Query
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  We'll get back to you within 24 hours
                </p>

                <motion.button
                  className="absolute top-6 right-6 w-10 h-10 bg-gray-700/50 hover:bg-red-500/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-300"
                  onClick={toggleModal}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <HiOutlineX className="text-xl" />
                </motion.button>
              </div>

              {/* Modal Body */}
              <form ref={formRef} onSubmit={handleSubmit} className="p-6">
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <input
                  type="hidden"
                  name="_next"
                  value="https://aiesecianpara.netlify.app/"
                />

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full p-3 bg-gray-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
                        emailError
                          ? "border-red-400 focus:ring-red-400/20"
                          : "border-gray-600 focus:border-blue-400 focus:ring-blue-400/20"
                      }`}
                      placeholder="john@example.com"
                    />
                    {emailError && (
                      <p className="text-red-400 text-sm mt-1">{emailError}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      placeholder="9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Roll Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="rollnumber"
                      value={formData.rollnumber}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      placeholder="AFT-000"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 font-semibold mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 resize-none"
                    placeholder="Write your message here..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <motion.button
                    type="button"
                    onClick={toggleModal}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <HiOutlinePaperAirplane />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Contact;
