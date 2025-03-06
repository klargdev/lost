import React from 'react';
import { Link } from 'react-router-dom';
import ImageCarousel from "./ImageCarousel.jsx";; // Import the ImageCarousel 

function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          In Loving Memory
        </h1>
        <p className="text-black text-xl font-bold mb-6">
          A Tribute to Our Beloved Head of Department
        </p>

        {/* Replace the static image with the ImageCarousel component */}
        <div className="mb-6">
          <ImageCarousel /> {/* Image Carousel will be displayed here */}
        </div>

        <p className="text-black text-xl font-bold mb-6">
          This memorial website is dedicated to honoring the life and legacy of our
          beloved Head of Department. His wisdom, leadership, and compassion
          continue to inspire us all.
        </p>

        <div className="grid grid-cols-1 gap-4">
  <Link
    to="/tribute"
    className="bg-[#1e2e4f] text-[#eedab3] px-6 py-4 rounded-xl hover:bg-[#1a2130] transition-all text-lg font-semibold shadow-lg"
  >
    Read Tribute
  </Link>
  <Link
    to="/guestbook"
    className="bg-[#1e2e4f] text-[#eedab3] px-6 py-4 rounded-xl hover:bg-[#1a2130] transition-all text-lg font-semibold shadow-lg"
  >
    Sign Guestbook
  </Link>
  <Link
    to="/donate"
    className="bg-[#1e2e4f] text-[#eedab3] px-6 py-4 rounded-xl hover:bg-[#1a2130] transition-all text-lg font-semibold shadow-lg"
  >
    Make a Donation
  </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
