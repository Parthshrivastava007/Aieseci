import React, { useState } from "react";

const Contact = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle opening and closing of the modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-8 md:px-8 animate__animated animate__fadeIn">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Section: Contact Information */}
        <div className="p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex flex-col justify-center hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-2 hover:opacity-90">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-yellow-300 animate__animated animate__fadeIn animate__delay-1s">
            Contact Us
          </h1>
          <p className="text-lg mb-6">
            <span className="font-semibold text-yellow-400">Location:</span> Anpara, Sonbhadra, Uttar Pradesh <br />
            <span className="font-semibold text-yellow-400">Phone:</span> +91-9919670620, +91-7651925552, +91-9415391502 <br />
            <span className="font-semibold text-yellow-400">Email:</span> aieseci.anpara@gmail.com
          </p>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-6 rounded-md text-lg font-semibold transition duration-300 transform hover:scale-110 shadow-md hover:shadow-xl"
            onClick={toggleModal}
          >
            Get in Touch
          </button>
        </div>

        {/* Right Section: Map */}
        <div className="relative w-full h-80 sm:h-96 shadow-md rounded-lg overflow-hidden transition-transform duration-500 transform hover:scale-105 hover:shadow-xl hover:translate-y-4">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29114.592912892836!2d82.75925439264869!3d24.19542564296271!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398f253a3cedbf09%3A0x6df8402aa1b510d5!2sAIESECI%20COMPUTER!5e0!3m2!1sen!2sin!4v1732431368946!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="AIESECI Computer Location"
          ></iframe>
        </div>
      </div>

      {/* Modal for "Get in Touch" */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 animate__animated animate__fadeIn animate__delay-0.5s">
          <div className="bg-white p-8 rounded-lg w-full sm:w-96 transform transition-all duration-500 animate__animated animate__zoomIn">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Send Your Query</h2>
            <form
              action="aieseci.anpara@gmail.com"
              method="post"
              encType="text/plain"
              className="flex flex-col space-y-4"
            >
              <div className="flex flex-col">
                <label htmlFor="name" className="text-gray-600 font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="text-gray-600 font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="message" className="text-gray-600 font-semibold">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                ></textarea>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-6 rounded-md text-lg font-semibold"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={toggleModal}
                  className="text-red-500 hover:text-red-600 font-semibold"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
