import React from 'react';

// Flower Corner Decoration
const FlowerCorner = ({ className }) => (
  <div className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor" className="opacity-20">
      <path d="M10,10 C20,5 30,15 25,25 C20,35 30,45 40,40 C50,35 60,45 55,55 C50,65 60,75 70,70 C80,65 90,75 85,85 C80,95 70,85 75,75 C80,65 70,55 60,60 C50,65 40,55 45,45 C50,35 40,25 30,30 C20,35 10,25 15,15 C20,5 10,5 10,10 Z" />
    </svg>
  </div>
);

// Flower Divider
const FlowerDivider = () => (
  <div className="flex items-center justify-center my-8">
    <div className="h-px bg-funeral-medium w-16 md:w-24"></div>
    <div className="mx-3 text-funeral-accent">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24" fill="currentColor">
        <path d="M50,20 C55,30 65,30 70,20 C75,10 85,10 90,20 C95,30 85,40 75,40 C65,40 55,30 50,40 C45,30 35,40 25,40 C15,40 5,30 10,20 C15,10 25,10 30,20 C35,30 45,30 50,20 Z" />
        <circle cx="50" cy="50" r="8" />
      </svg>
    </div>
    <div className="h-px bg-funeral-medium w-16 md:w-24"></div>
  </div>
);

function Tribute() {
  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Corner decorations */}
      <FlowerCorner className="absolute top-0 left-0 w-20 h-20 text-funeral-accent transform -translate-x-1/4 -translate-y-1/4 hidden md:block" />
      <FlowerCorner className="absolute top-0 right-0 w-20 h-20 text-funeral-accent transform translate-x-1/4 -translate-y-1/4 rotate-90 hidden md:block" />
      
      <div className="relative">
        <h1 className="text-3xl font-bold mb-2 text-white text-center">Tribute</h1>
        
        <FlowerDivider />

        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            Our beloved Head of Department was more than just a leader; they were a mentor, 
            friend, and inspiration to all who had the privilege of working with them.
          </p>
          
          <div className="p-6 bg-funeral-darkest bg-opacity-50 border-l-4 border-funeral-accent rounded-r-lg mb-8 relative">
            {/* Small flower decoration */}
            <div className="absolute -top-3 -left-3 text-funeral-accent">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24" fill="currentColor">
                <path d="M50,30 C55,20 65,20 70,30 C75,40 85,40 90,30 C95,20 85,10 75,10 C65,10 55,20 50,10 C45,20 35,10 25,10 C15,10 5,20 10,30 C15,40 25,40 30,30 C35,20 45,20 50,30 Z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-white">Biography</h2>
            <p className="text-gray-300 text-lg mb-0 leading-relaxed">
              With over two decades of dedicated service in academia, they shaped the lives 
              of countless students and colleagues. Their commitment to excellence and 
              innovative teaching methods set new standards in our department.
            </p>
          </div>
          
          <div className="p-6 bg-funeral-darkest bg-opacity-50 border-l-4 border-funeral-accent rounded-r-lg relative">
            {/* Small flower decoration */}
            <div className="absolute -top-3 -left-3 text-funeral-accent">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24" fill="currentColor">
                <path d="M50,30 C55,20 65,20 70,30 C75,40 85,40 90,30 C95,20 85,10 75,10 C65,10 55,20 50,10 C45,20 35,10 25,10 C15,10 5,20 10,30 C15,40 25,40 30,30 C35,20 45,20 50,30 Z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-white">Legacy</h2>
            <p className="text-gray-300 text-lg mb-0 leading-relaxed">
              Their legacy lives on through the numerous initiatives they started, the 
              research programs they established, and most importantly, through the lives 
              they touched and the minds they inspired.
            </p>
          </div>
        </div>
        
        {/* Bottom decoration */}
        <div className="flex justify-center mt-10">
          <div className="text-funeral-accent opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" width="80" height="40" fill="currentColor">
              <path d="M10,25 C20,15 30,15 40,25 C50,35 60,35 70,25 C80,15 90,15 100,25 C90,40 60,50 50,40 C40,50 10,40 0,25 C0,25 5,30 10,25 Z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Bottom corner decorations */}
      <FlowerCorner className="absolute bottom-0 left-0 w-20 h-20 text-funeral-accent transform -translate-x-1/4 translate-y-1/4 -rotate-90 hidden md:block" />
      <FlowerCorner className="absolute bottom-0 right-0 w-20 h-20 text-funeral-accent transform translate-x-1/4 translate-y-1/4 rotate-180 hidden md:block" />
    </div>
  );
}

export default Tribute;