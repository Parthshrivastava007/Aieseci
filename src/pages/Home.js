import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import image1 from "../assets/Images/image1.jpg";
import image2 from "../assets/Images/image2.jpg";
import image3 from "../assets/Images/image3.jpg";
import image4 from "../assets/Images/image4.jpg";
import image5 from "../assets/Images/image5.jpg";
import image6 from "../assets/Images/image6.png";
import image7 from "../assets/Images/image7.jpg";
import image8 from "../assets/Images/image8.jpg";
import image9 from "../assets/Images/image9.jpg";
import image10 from "../assets/Images/image10.jpg";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const images = [
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
    image7,
    image8,
    image9,
    image10,
  ];

  return (
    <main className="bg-gray-800 w-full min-h-screen text-white px-4 py-16 flex flex-col items-center">
      {/* Header Section */}
      <header className="text-center max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
          Welcome to <span className="text-blue-400">AIESECI</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-300">
          Empowering Students with the Best Computer Education in Sonbhadra
        </p>
      </header>

      {/* Gallery Section */}
      <section
        className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-6xl"
        aria-label="Photo Gallery"
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="relative bg-gray-900 rounded-lg shadow-lg overflow-hidden transform transition-all duration-500"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <img
              src={image}
              alt={`AIESECI Event ${index + 1}`}
              className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg transform transition-transform duration-500 hover:scale-110"
            />
          </div>
        ))}
      </section>
    </main>
  );
};

export default Home;
