import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tribute from "./pages/Tribute";
import Program from "./pages/Program";
import Gallery from "./pages/Gallery";
import Guestbook from "./pages/Guestbook";
import Donate from "./pages/Donate";

// Subtle floral background pattern
const FloralPattern = () => (
  <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
    <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-16 p-8">
      {Array.from({ length: 48 }).map((_, i) => (
        <div key={i} className="text-funeral-accent">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor">
            <path d="M50,20 C55,30 65,30 70,20 C75,10 85,10 90,20 C95,30 85,40 75,40 C65,40 55,30 50,40 C45,30 35,40 25,40 C15,40 5,30 10,20 C15,10 25,10 30,20 C35,30 45,30 50,20 Z" />
          </svg>
        </div>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div 
        className="min-h-screen text-gray-100 relative"
        style={{
          backgroundColor: '#040303',
          backgroundImage: 'linear-gradient(rgba(70, 17, 17, 0.9), rgba(4, 3, 3, 0.95))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Floral background pattern */}
        <FloralPattern />
        
        {/* Content */}
        <div className="relative z-10">
          <Navbar />
          <main className="w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tribute" element={
                <div className="container mx-auto px-4 py-8">
                  <Tribute />
                </div>
              } />
              <Route path="/program" element={
                <div className="container mx-auto px-4 py-8">
                  <Program />
                </div>
              } />
              <Route path="/gallery" element={
                <div className="container mx-auto px-4 py-8">
                  <Gallery />
                </div>
              } />
              <Route path="/guestbook" element={
                <div className="container mx-auto px-4 py-8">
                  <Guestbook />
                </div>
              } />
              <Route path="/donate" element={
                <div className="container mx-auto px-4 py-8">
                  <Donate />
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
        
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#040303',
              color: '#fff',
              border: '1px solid #461111'
            }
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
