import React, { useState, useEffect } from 'react';
import { supabase, content } from '../lib/supabase';
import { Spinner } from '../components/Spinner';
import { toast } from 'react-hot-toast';
import '../styles/Gallery.css';

function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages(activeFilter);
    fetchGroups();
  }, [activeFilter]);

  async function fetchGroups() {
    try {
      const { data, error } = await supabase.from('image_groups').select('*').order('name');
      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }

  async function fetchImages(groupId = null) {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await content.gallery.listImages(groupId);
      if (error) throw error;
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gallery-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white text-center mb-4">Memorial Gallery</h1>
      <p className="text-gray-300 text-center mb-8">A collection of cherished memories.</p>

      {groups.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button onClick={() => setActiveFilter(null)} className={`px-4 py-2 rounded-md ${activeFilter === null ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>All</button>
          {groups.map(group => (
            <button key={group.id} onClick={() => setActiveFilter(group.id)} className={`px-4 py-2 rounded-md ${activeFilter === group.id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{group.name}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center"><Spinner size="lg" /></div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : images.length === 0 ? (
        <p className="text-center text-gray-300">No images available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div key={index} className="relative cursor-pointer overflow-hidden rounded-lg shadow-lg" onClick={() => setSelectedImage(image)}>
              <img src={image.url} alt={image.caption || 'Memorial image'} className="w-full h-60 object-cover rounded-lg" />
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 p-2 text-white text-center">{image.caption}</div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl w-full p-4">
            <button className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full" onClick={() => setSelectedImage(null)}>✕</button>
            <img src={selectedImage.url} alt={selectedImage.caption} className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            <p className="text-white text-center mt-2">{selectedImage.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
