import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import image1 from "../assets/Images/image1.jpg";
import image2 from "../assets/Images/image2.jpg";
import image3 from "../assets/Images/image3.jpg";
import image4 from "../assets/Images/image4.jpg";
import image5 from "../assets/Images/image5.jpg";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const images = [image1, image2, image3, image4, image5];

  return (
    <div className="bg-gray-800 w-full min-h-screen h-full text-white flex flex-col items-center justify-center px-4 text-center">
      {/* Hamburger Icon (Visible on Small Screens) */}

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
            data-aos-delay={index * 300}
          >
            <img
              src={image}
              alt={`Timeline ${index + 1}`}
              className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg transform transition-transform duration-500 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
