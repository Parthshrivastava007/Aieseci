import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineClock,
} from "react-icons/hi";
import { FaInstagram } from "react-icons/fa";
import LogoAiseci from "../assets/Images/LogoAiseci.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const popularCourses = [
    { name: "ADCA (Adv. Diploma in Comp. Applications)", path: "/courses" },
    { name: "DCA+ (Diploma in Comp. Applications)", path: "/courses" },
    { name: "O-Level Certification", path: "/courses" },
    { name: "CCC (Course on Comp. Concepts)", path: "/courses" },
    { name: "DFA (Diploma in Financial Accounting)", path: "/courses" },
    { name: "DTP (Desktop Publishing)", path: "/courses" },
    { name: "English & Hindi Typing", path: "/courses" },
  ];

  const quickLinks = [
    { name: "Home Dashboard", path: "/" },
    { name: "Explore Courses", path: "/courses" },
    { name: "Admissions (Enrollment)", path: "/enrollementtable" },
    { name: "Fee Ledger Tracker", path: "/feetracker" },
    { name: "Student Exam Portal", path: "/exams" },
    { name: "Contact & Support", path: "/contact" },
  ];

  return (
    <footer className="w-full bg-[#0a0f1d] border-t border-gray-800/60 relative overflow-hidden mt-auto">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {/* Column 1: Info & Legacy */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <motion.img
                src={LogoAiseci}
                alt="AIESECI Logo"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-14 h-14 object-contain"
              />
              <div>
                <h3 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AIESECI
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                  Computer Institute
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering students with the finest computer education in Sonbhadra since 2008. Shaping careers through hands-on practical learning.
            </p>

            <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <p className="text-xs text-gray-400 italic leading-relaxed">
                "Founded by <strong className="text-gray-300">Sanjeev Shrivastava</strong>, carrying forward the visionary legacy under the guidance of <strong className="text-gray-300">Iti Shrivastava</strong>."
              </p>
            </div>
          </motion.div>

          {/* Column 2: Popular Courses */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-bold text-white relative w-fit">
              Our Courses
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-yellow-400 rounded-full"></span>
            </h4>
            <ul className="space-y-2">
              {popularCourses.map((course) => (
                <li key={course.name}>
                  <Link
                    to={course.path}
                    className="text-gray-400 hover:text-yellow-400 text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-yellow-400">
                      →
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {course.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Quick Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-bold text-white relative w-fit">
              Quick Links
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-purple-500 rounded-full"></span>
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-purple-400">
                      →
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Contact details */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-bold text-white relative w-fit">
              Reach Us
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-blue-500 rounded-full"></span>
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-400 border border-blue-500/20">
                  <HiOutlineLocationMarker className="text-xl" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Address
                  </h5>
                  <p className="text-gray-300 text-sm">
                    Anpara, Sonbhadra,
                    <br />
                    Uttar Pradesh, India - 231225
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 text-green-400 border border-green-500/20">
                  <HiOutlinePhone className="text-xl" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Phone Numbers
                  </h5>
                  <p className="text-gray-300 text-sm">
                    +91 99196 70620
                    <br />
                    +91 76519 25552
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-400 border border-purple-500/20">
                  <HiOutlineMail className="text-xl" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Email
                  </h5>
                  <p className="text-gray-300 text-sm">
                    aieseci.anpara@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-400 border border-orange-500/20">
                  <HiOutlineClock className="text-xl" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Class Hours
                  </h5>
                  <p className="text-gray-300 text-sm">
                    Mon - Sat: 9:00 AM - 7:00 PM
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent my-12" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs text-center md:text-left">
            © {currentYear} AIESECI Computer Institute. All rights reserved.
          </p>

          {/* Socials & Policies */}
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/aieseci_computer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-400 text-sm flex items-center gap-2 group transition-colors"
              aria-label="Instagram"
            >
              <span className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:border-pink-500/30 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all">
                <FaInstagram className="text-lg" />
              </span>
              <span className="text-xs font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                @aieseci_computer
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
