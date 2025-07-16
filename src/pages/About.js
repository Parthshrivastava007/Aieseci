import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import papa from "../assets/Images/papa.jpg";
import { Link } from "react-router-dom";

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  return (
    <div className="bg-gray-800 text-white min-h-screen">
      {/* Hero Section */}
      <section
        className="py-20 px-6 bg-gradient-to-r from-blue-900 to-gray-900 text-center"
        data-aos="fade-in"
      >
        <div className="relative inline-block rounded-xl p-8 bg-gray-900 glow-card text-sky-200 border-2 border-sky-200 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] transition-transform duration-300 hover:scale-105">
          <h1 className="text-4xl md:text-5xl font-bold">About AIESECI</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Empowering students with the best computer education in Sonbhadra,
            AISECI blends practical and theoretical learning to shape the future
            of the digital world.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 px-6 md:px-20 grid md:grid-cols-2 gap-8">
        {[
          {
            title: "Our Mission",
            content:
              "To empower individuals with advanced computer knowledge and foster digital literacy in Sonbhadra and beyond. AISECI strives to prepare students for real-world challenges by providing industry-relevant skills.",
          },
          {
            title: "Our Vision",
            content:
              "To be a leading educational institute, transforming lives by delivering excellence in IT education, fostering innovation, and building a skilled workforce for tomorrow.",
          },
        ].map((section, index) => (
          <div
            key={index}
            className="space-y-4 glow-card p-8 bg-gray-900 rounded-xl text-sky-200 border-2 border-purple-400 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] transition-transform duration-300 hover:scale-105"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <h2 className="text-3xl font-semibold">{section.title}</h2>
            <p className="text-gray-300">{section.content}</p>
          </div>
        ))}
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-700" data-aos="fade-in">
        <h2 className="text-3xl font-semibold text-center">Our Timeline</h2>
        <div className="mt-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="space-y-8 flex-1">
            {[
              {
                year: "2008",
                text: "AIESECI Computer Institute was founded by Sanjeev Shrivastava, bringing quality computer education to Sonbhadra.",
              },
              {
                year: "2010",
                text: "Launched foundational courses like DCA and CCC to make IT education more accessible.",
              },
              {
                year: "2015",
                text: "Expanded with advanced certifications like O LEVEL and CCO to cater to industry demands.",
              },
              {
                year: "2018",
                text: "Introduced a hybrid teaching model, offering online and offline classes for flexible learning.",
              },
              {
                year: "2024",
                text: "The legacy of Sanjeev Shrivastava continues under the guidance of Iti Shrivastava, fostering innovation and growth.",
              },
            ].map((entry, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-400 pl-4 glow-card p-6 transition-transform duration-300 hover:scale-105"
                data-aos="fade-right"
                data-aos-delay={index * 100}
              >
                <h3 className="text-2xl font-bold">{entry.year}</h3>
                <p className="text-gray-300">{entry.text}</p>
              </div>
            ))}
          </div>

          <div
            className="flex justify-center items-center gap-4 flex-1"
            data-aos="zoom-in"
          >
            <img
              src={papa}
              alt="Timeline 1"
              className="w-64 h-64 rounded-lg shadow-lg glow-card transition-transform duration-300 hover:scale-110"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900" data-aos="fade-in">
        <h2 className="text-3xl font-semibold text-center">Our Achievements</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-10">
          {[
            { stat: "1000+", text: "Students Trained" },
            { stat: "95%", text: "Certification Success" },
            { stat: "10+", text: "Courses Offered" },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center glow-card p-8 bg-gray-900 rounded-xl shadow-xl transition-transform duration-300 hover:scale-110"
              data-aos="flip-up"
              data-aos-delay={index * 100}
            >
              <h3 className="text-5xl font-bold text-blue-400">{item.stat}</h3>
              <p className="text-gray-300 mt-2">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <Link to="/courses">
        <section
          className="cursor-pointer bg-gradient-to-r from-blue-900 to-gray-900 py-16 text-center"
          data-aos="fade-up"
        >
          <div className="relative inline-block rounded-xl p-8 bg-gray-900 text-sky-200 border-2 border-yellow-400 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] transition-transform duration-300 hover:scale-105">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Join AIESECI Today
            </h2>
            <p className="text-gray-300 mt-4">
              Start your journey towards a successful career in the digital
              world. Explore our wide range of courses and enroll now.
            </p>
          </div>
        </section>
      </Link>
    </div>
  );
};

export default About;
