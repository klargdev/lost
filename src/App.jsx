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

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div 
        className="min-h-screen text-[#eedab3]"
        style={{
          backgroundImage: 'linear-gradient(rgba(247, 155, 155, 0.72), rgba(27, 40, 66, 0.86)), url(/5594016.jpg)',
          backgroundSize: 'contain, cover, cover', // 'contain' ensures the design stays clear and neat
          backgroundPosition: 'center top, center, center',
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat'
        }}
      >
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tribute" element={<Tribute />} />
            <Route path="/program" element={<Program />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/guestbook" element={<Guestbook />} />
            <Route path="/donate" element={<Donate />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}


export default App;
