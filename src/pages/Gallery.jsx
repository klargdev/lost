import React, { useState, useEffect } from 'react';
import { supabase, content } from '../lib/supabase';
import { Spinner } from '../components/Spinner';
import { toast } from 'react-hot-toast';
import '../styles/Gallery.css';

// Flower decoration for the upload section
const FlowerDecoration = ({ className }) => (
  <div className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor" className="opacity-20">
      <path d="M50,20 C55,30 65,30 70,20 C75,10 85,10 90,20 C95,30 85,40 75,40 C65,40 55,30 50,40 C45,30 35,40 25,40 C15,40 5,30 10,20 C15,10 25,10 30,20 C35,30 45,30 50,20 Z" />
    </svg>
  </div>
);

function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    initializeGallery();
  }, []);

  useEffect(() => {
    fetchImages(activeFilter);
    fetchGroups();
  }, [activeFilter]);

  async function initializeGallery() {
    try {
      console.log('Initializing gallery...');
      
      // Use the gallery initialization function from content.gallery
      const { error } = await content.gallery.initializeBucket();
      
      if (error) {
        console.error('Error initializing gallery:', error);
        throw error;
      }
      
      console.log('Gallery initialized successfully');
    } catch (error) {
      console.error('Error initializing gallery:', error);
      setError('Failed to initialize gallery: ' + (error.message || 'Unknown error'));
    }
  }

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
  
  // Generate demo images
  function generateDemoImages() {
    return [
      {
        url: 'https://placehold.co/800x600/461111/ffffff?text=Memorial+Photo+1',
        name: 'memorial_service.jpg',
        caption: 'Memorial Service',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        group: { name: 'Family' }
      },
      {
        url: 'https://placehold.co/800x600/A13333/ffffff?text=Memorial+Photo+2',
        name: 'family_photo.jpg',
        caption: 'Family Photo',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        group: { name: 'Family' }
      },
      {
        url: 'https://placehold.co/800x600/B3541E/ffffff?text=Memorial+Photo+3',
        name: 'ceremony.jpg',
        caption: 'Ceremony',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        group: { name: 'Memories' }
      },
      {
        url: 'https://placehold.co/800x600/461111/ffffff?text=Memorial+Photo+4',
        name: 'tribute.jpg',
        caption: 'Tribute',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        group: { name: 'Memories' }
      },
      {
        url: 'https://placehold.co/800x600/A13333/ffffff?text=Memorial+Photo+5',
        name: 'remembrance.jpg',
        caption: 'Remembrance',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        group: { name: 'Friends' }
      },
      {
        url: 'https://placehold.co/800x600/B3541E/ffffff?text=Memorial+Photo+6',
        name: 'legacy.jpg',
        caption: 'Legacy',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        group: { name: 'Friends' }
      }
    ];
  }

  async function handleUpload(e) {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select an image to upload');
      return;
    }
    
    try {
      setUploading(true);
      
      // Use the gallery upload function
      const result = await content.gallery.uploadImage(file, caption);
      
      if (result.error) {
        throw result.error;
      }
      
      // Add the new image to the list immediately
      setImages(prev => [result, ...prev]);
      
      toast.success('Image uploaded successfully');
      
      // Reset form
      setFile(null);
      setCaption('');
      setShowUploadForm(false);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }
  
  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    
    // Basic validation
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
    }
  }

  if (loading) {
    return (
      <div className="gallery-container flex justify-center items-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-300">Loading gallery...</p>
        </div>
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

      {/* Group filters */}
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
        <div className="grid gap-8">
          {images.map((image, index) => (
            <div
              key={image.name + index}
              className="group relative bg-funeral-darkest rounded-lg overflow-hidden shadow-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="aspect-w-4">
                <img
                  src={image.url}
                  alt={image.caption || image.name.split('_').slice(1).join(' ').replace(/\.[^/.]+$/, "") || "Memorial image"}
                  className="gallery-image w-full h-full object-cover"
                  onLoad={(e) => e.target.classList.add('loaded')}
                  onError={(e) => {
                    console.error(`Failed to load image: ${image.url}`);
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjIzLTUuMzc3IDEyLTEyIDEycy0xMi01LjM3Ny0xMi0xMiA1LjM3Ny0xMiAxMi0xMiAxMiA1LjM3NyAxMiAxMnptLTEgMGMwIDYuMDcxLTQuOTI5IDExLTExIDExcy0xMS00LjkyOS0xMS0xMSA0LjkyOS0xMSAxMS0xMSAxMSA0LjkyOSAxMSAxMXptLTExLjUgNC4wMDFoMXYtOC4wMDJoLTF2OC4wMDJ6bS0xLjE2Ni0xMS4wMDFjMC0uNTUyLjQ0OC0xIDEtMSAuNTUzIDAgMSAuNDQ4IDEgMSAwIC41NTMtLjQ0NyAxLTEgMS0uNTUyIDAtMS0uNDQ3LTEtMXoiLz48L3N2Zz4=';
                    e.target.className = 'image-error w-full h-full object-contain p-8 opacity-50';
                  }}
                />
                
                {image.group && (
                  <div className="absolute top-2 right-2 bg-funeral-accent text-white text-xs px-2 py-1 rounded">
                    {image.group.name}
                  </div>
                )}
              </div>
              <div className="p-4 bg-funeral-darkest bg-opacity-90">
                <h3 className="image-caption text-lg font-medium text-white">
                  {image.caption || image.name.split('_').slice(1).join(' ').replace(/\.[^/.]+$/, "") || "Memorial image"}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(image.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="absolute inset-0 bg-funeral-accent bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Gallery;
