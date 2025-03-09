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
  const [selectedImage, setSelectedImage] = useState(null); // New: State for full-view image

  useEffect(() => {
    fetchImages(activeFilter);
    fetchGroups();
  }, [activeFilter]);

  async function fetchGroups() {
    try {
      const { data, error } = await supabase
        .from('image_groups')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching image groups:', error);
        return;
      }
      
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }

  async function fetchImages(groupId = null) {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching images using content.gallery.listImages()');

      const { data, error } = await content.gallery.listImages(groupId);

      if (error) {
        throw error;
      }

      console.log('Fetched images:', data);
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images: ' + (error.message || 'Unknown error'));
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="gallery-container flex justify-center items-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-300">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="gallery-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Memorial Gallery</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          A collection of cherished memories and moments that we hold dear.
        </p>
      </div>

      {groups.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveFilter(null)}
            className={`filter-button px-4 py-2 rounded-md ${
              activeFilter === null
                ? 'bg-funeral-accent text-white'
                : 'bg-funeral-darkest text-gray-300 hover:bg-funeral-medium hover:text-white'
            } transition-colors`}
          >
            All Photos
          </button>
          
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setActiveFilter(group.id)}
              className={`filter-button px-4 py-2 rounded-md ${
                activeFilter === group.id
                  ? 'bg-funeral-accent text-white'
                  : 'bg-funeral-darkest text-gray-300 hover:bg-funeral-medium hover:text-white'
              } transition-colors`}
            >
              {group.name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="text-funeral-accent text-center mb-8 p-4 bg-funeral-darkest rounded-lg">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-12 bg-funeral-darkest rounded-lg">
          <p className="text-gray-300 text-lg mb-2">No images available</p>
          <p className="text-gray-400">
            {activeFilter 
              ? "No images found in this category. Please check another category."
              : "The gallery will be updated with memorial photos soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={image.name + index}
              className="relative cursor-pointer overflow-hidden rounded-lg"
              onClick={() => setSelectedImage(image.url)} // Open full view on click
            >
              <img
                src={image.url}
                alt={image.caption || 'Memorial image'}
                className="w-full h-full object-cover aspect-square"
              />
            </div>
          ))}
        </div>
      )}

      {/* Full Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-3xl w-full p-4 relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Full view"
              className="w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
