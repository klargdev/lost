import React, { useState, useEffect } from 'react';

const ImageCarousel = () => {
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

  // UseEffect hook to automatically change image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // 3 seconds interval

    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <img
      src={images[currentImage]} // Dynamically set the current image
      alt="Memorial"
      className="rounded-lg shadow-lg object-contain w-full max-h-[500px] sm:h-[300px] md:h-[400px] lg:h-[500px]"
    />
  );
};

export default ImageCarousel;
