import React, { useState, useEffect } from 'react';

const ImageCarousel = ({ overlayText }) => {
  // Array containing paths to your images
  const images = [
    "/1.jpg", // Path to first image
    "/bg_image.jpg", // Path to second image
    "/torgby.png", // Path to third image
    "/image.png", // Path to fourth image
    // Add more images as needed
  ];

  // State to track the current image index
  const [currentImage, setCurrentImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // UseEffect hook to automatically change image every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Start transition
      setIsTransitioning(true);
      
      // Change image after transition starts
      setTimeout(() => {
        setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
        
        // End transition after image changes
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }, 500);
      
    }, 6000); // 6 seconds interval for a more dignified pace

    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden shadow-lg">
      {/* Image with zoom effect */}
      <img
        src={images[currentImage]} // Dynamically set the current image
        alt="Memorial"
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-10000 ${
          isTransitioning ? 'scale-110' : 'scale-100'
        }`}
        style={{ 
          filter: 'grayscale(20%) brightness(0.7)',
          transition: 'transform 10s ease-in-out, filter 1s ease',
          objectPosition: 'center center'
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-funeral-darkest/70 via-funeral-darkest/40 to-funeral-darkest/60"></div>
      
      {/* Overlay text - positioned at the top */}
      {overlayText && (
        <div className="absolute inset-x-0 top-0 pt-8 sm:pt-12 md:pt-16 lg:pt-20 flex flex-col items-center text-center p-4 sm:p-6">
          {typeof overlayText === 'string' ? (
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {overlayText}
            </h2>
          ) : (
            overlayText
          )}
        </div>
      )}
      
      {/* Navigation dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentImage(index);
                setTimeout(() => setIsTransitioning(false), 500);
              }, 500);
            }}
            className={`w-2 h-2 rounded-full ${
              currentImage === index ? 'bg-funeral-accent' : 'bg-gray-400 bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
