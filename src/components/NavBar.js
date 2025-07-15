import React, { useState } from "react";
import { Link } from "react-router-dom";
import LogoAiseci from "../assets/Images/LogoAiseci.png";

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Tagline */}
        <div>
          <Link to="/">
            <img
              src={LogoAiseci}
              alt="AISECI Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <Link
              to="/"
              className="hover:text-yellow-400 transition-colors duration-300"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="hover:text-yellow-400 transition-colors duration-300"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/courses"
              className="hover:text-yellow-400 transition-colors duration-300"
            >
              Courses
            </Link>
          </li>
          <li>
            <Link
              to="/enrollementtable"
              className="hover:text-yellow-400 transition-colors duration-300"
            >
              Enrollement-Table
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="hover:text-yellow-400 transition-colors duration-300"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Toggle Button */}
        <button
          className="md:hidden text-xl focus:outline-none"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800">
          <ul className="flex flex-col space-y-2 py-4 px-6">
            <li>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block hover:text-yellow-400 transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block hover:text-yellow-400 transition-colors duration-300"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="block hover:text-yellow-400 transition-colors duration-300"
              >
                Courses
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block hover:text-yellow-400 transition-colors duration-300"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
