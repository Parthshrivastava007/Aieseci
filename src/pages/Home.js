import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import image1 from "../assets/Images/image1.jpg";
import image2 from "../assets/Images/image2.jpg";
import image3 from "../assets/Images/image3.jpg";
import image4 from "../assets/Images/image4.jpg";
import image5 from "../assets/Images/image5.jpg";

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration
      easing: "ease-in-out", // Smooth easing effect
      once: true, // Trigger animation only once
    });
  }, []);

  const images = [image1, image2, image3, image4, image5];

  return (
    <div className="bg-gray-800 w-full min-h-screen h-full text-white flex flex-col items-center justify-center px-4 text-center">
      {/* Hamburger Icon (Visible on Small Screens) */}
      <div
        className="sm:hidden fixed top-5 right-5 z-50 cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div
          className={`w-8 h-1 bg-white rounded transition-transform duration-300 ${
            menuOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <div
          className={`w-8 h-1 bg-white rounded my-1 transition-opacity duration-300 ${
            menuOpen ? "opacity-0" : ""
          }`}
        />
        <div
          className={`w-8 h-1 bg-white rounded transition-transform duration-300 ${
            menuOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center transition-transform duration-500 sm:hidden ${
          menuOpen ? "scale-100" : "scale-0"
        }`}
      >
        <ul className="text-white text-2xl space-y-6">
          <li className="hover:text-blue-400 transition duration-300">Home</li>
          <li className="hover:text-blue-400 transition duration-300">About</li>
          <li className="hover:text-blue-400 transition duration-300">Courses</li>
          <li className="hover:text-blue-400 transition duration-300">Contact</li>
        </ul>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
        Welcome to <span className="text-blue-400">AIESECI</span>
      </h1>
      <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl">
        Empowering Students with the Best Computer Education in Sonbhadra
      </p>

      {/* Non-overlapping Image Cards with alternate transitions */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 relative max-w-6xl">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative bg-gray-900 rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 ${
              index % 2 === 0 ? "animate-up" : "animate-down"
            }`}
            data-aos="fade-up"
            data-aos-delay={index * 300} // Staggered animation
          >
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg transform transition-transform duration-500 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
