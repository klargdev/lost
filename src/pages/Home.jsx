import React from 'react';
import { Link } from 'react-router-dom';
import ImageCarousel from "./ImageCarousel.jsx"; // Import the ImageCarousel 

// SVG Flower decorative element
const FlowerDecoration = ({ className }) => (
  <div className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor" className="opacity-20">
      <path d="M50,15 C55,25 65,25 70,15 C75,5 85,5 90,15 C95,25 85,35 75,35 C65,35 55,25 50,35 C45,25 35,35 25,35 C15,35 5,25 10,15 C15,5 25,5 30,15 C35,25 45,25 50,15 Z" />
      <path d="M50,50 C55,60 65,60 70,50 C75,40 85,40 90,50 C95,60 85,70 75,70 C65,70 55,60 50,70 C45,60 35,70 25,70 C15,70 5,60 10,50 C15,40 25,40 30,50 C35,60 45,60 50,50 Z" />
    </svg>
  </div>
);

function Home() {
  return (
    <div className="w-full">
      <div className="text-center">
        {/* Image Carousel with overlay text - full width and moved up */}
        <div className="-mt-4 mb-10">
          <ImageCarousel 
            overlayText={
              <>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  In Loving Memory
                </h1>
                <p className="text-xl md:text-2xl text-white font-medium drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] bg-funeral-darkest/30 inline-block px-4 py-2 rounded">
                  A Tribute to Our Beloved Head of Department
                </p>
              </>
            } 
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 relative">
          {/* Left floral decoration */}
          <FlowerDecoration className="absolute left-0 top-0 w-24 h-24 text-funeral-accent transform -translate-y-1/2 -translate-x-1/2 rotate-45 hidden md:block" />
          
          {/* Right floral decoration */}
          <FlowerDecoration className="absolute right-0 top-0 w-24 h-24 text-funeral-accent transform -translate-y-1/2 translate-x-1/2 -rotate-45 hidden md:block" />
          
          <div className="relative">
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              This memorial website is dedicated to honoring the life and legacy of our
              beloved Head of Department. His wisdom, leadership, and compassion
              continue to inspire us all.
            </p>
            
            {/* Decorative line with flower */}
            <div className="flex items-center justify-center mb-10">
              <div className="h-px bg-funeral-medium w-16 md:w-32"></div>
              <div className="mx-4 text-funeral-accent">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="30" height="30" fill="currentColor">
                  <path d="M50,20 C55,30 65,30 70,20 C75,10 85,10 90,20 C95,30 85,40 75,40 C65,40 55,30 50,40 C45,30 35,40 25,40 C15,40 5,30 10,20 C15,10 25,10 30,20 C35,30 45,30 50,20 Z" />
                  <circle cx="50" cy="50" r="10" />
                </svg>
              </div>
              <div className="h-px bg-funeral-medium w-16 md:w-32"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 relative">
            <Link
              to="/tribute"
              className="bg-funeral-dark text-white px-6 py-4 rounded-lg hover:bg-funeral-medium transition-all text-lg font-medium shadow-lg border border-funeral-medium"
            >
              Read Tribute
            </Link>
            <Link
              to="/guestbook"
              className="bg-funeral-dark text-white px-6 py-4 rounded-lg hover:bg-funeral-medium transition-all text-lg font-medium shadow-lg border border-funeral-medium"
            >
              Sign Guestbook
            </Link>
            <Link
              to="/donate"
              className="bg-funeral-accent text-white px-6 py-4 rounded-lg hover:bg-funeral-medium transition-all text-lg font-medium shadow-lg border border-funeral-medium"
            >
              Make a Donation
            </Link>
          </div>
          
          {/* Bottom floral decorations */}
          <div className="flex justify-center mb-8">
            <div className="text-funeral-accent opacity-30 transform rotate-90">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" width="100" height="50" fill="currentColor">
                <path d="M20,25 C25,15 35,15 40,25 C45,35 55,35 60,25 C65,15 75,15 80,25 C70,40 30,40 20,25 Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
