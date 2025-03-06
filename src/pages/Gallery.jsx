import React from 'react';
import { supabase } from '../lib/supabase';

function Gallery() {
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const { data, error } = await supabase.storage.from('images').list();  // Ensure the correct bucket name "images"
  
      if (error) throw error;
  
      console.log('Supabase Response:', data);  // Log the raw response from Supabase
      
      if (data.length === 0) {
        setError('No images found in the bucket.');
      }
  
      const imageUrls = data.map((file) => ({
        url: supabase.storage.from('images').getPublicUrl(file.name).publicURL.replace(/\/\//g, '/'),  // Correct usage of .publicURL and remove double slashes
        name: file.name,
      }));
  
      console.log('Generated Image URLs:', imageUrls);  // Log the generated URLs
  
      setImages(imageUrls);
  
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images. Please try again later.');
    } finally {
      setLoading(false);
    }
  }
  

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-600">Loading gallery...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto h-[600px]">
        {images.length === 0 ? (
          <div className="flex justify-center items-center col-span-3 text-xl text-gray-500">
            No images available in the gallery.
          </div>
        ) : (
          images.map((image, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={image.url} alt={image.name} className="w-full h-72 object-cover" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Gallery;
