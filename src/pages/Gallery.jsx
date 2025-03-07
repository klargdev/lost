import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

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
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [activeBucket, setActiveBucket] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      setLoading(true);
      setError(null);
      
      // Try both buckets and combine results
      const allImages = [];
      let foundBucket = '';
      
      // Try 'gallary_images' bucket first (note the spelling in the original code)
      const gallaryResult = await supabase.storage.from('gallary_images').list();
      if (!gallaryResult.error && gallaryResult.data && gallaryResult.data.length > 0) {
        foundBucket = 'gallary_images';
        setActiveBucket('gallary_images');
        
        const gallaryImages = gallaryResult.data.map(file => ({
          url: supabase.storage.from('gallary_images').getPublicUrl(file.name).data.publicUrl,
          name: file.name,
          bucket: 'gallary_images'
        }));
        
        allImages.push(...gallaryImages);
        console.log('Found images in gallary_images bucket:', gallaryImages.length);
      }
      
      // Try 'images' bucket
      const imagesResult = await supabase.storage.from('images').list();
      if (!imagesResult.error && imagesResult.data && imagesResult.data.length > 0) {
        if (!foundBucket) {
          foundBucket = 'images';
          setActiveBucket('images');
        }
        
        const regularImages = imagesResult.data.map(file => ({
          url: supabase.storage.from('images').getPublicUrl(file.name).data.publicUrl,
          name: file.name,
          bucket: 'images'
        }));
        
        allImages.push(...regularImages);
        console.log('Found images in images bucket:', regularImages.length);
      }
      
      console.log('Combined images from all buckets:', allImages.length);
      
      if (allImages.length === 0) {
        if (!foundBucket) {
          setError('No images found in any storage bucket. Try uploading some photos.');
        }
      }
      
      // Sort images by name (which includes timestamp) to show newest first
      allImages.sort((a, b) => {
        const aTime = parseInt(a.name.split('_')[0] || '0');
        const bTime = parseInt(b.name.split('_')[0] || '0');
        return bTime - aTime; // Descending order (newest first)
      });
      
      setImages(allImages);
  
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images. Please try again later.');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleUpload(e) {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select an image to upload');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create a unique file name to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${caption.replace(/\s+/g, '_') || 'memorial'}.${fileExt}`;
      
      // Determine which bucket to use - prefer the one that already has images
      const bucketToUse = activeBucket || 'gallary_images';
      console.log(`Uploading to bucket: ${bucketToUse}`);
      
      const { error: uploadError, data } = await supabase.storage
        .from(bucketToUse)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        
        // Try the other bucket if the first one failed
        const altBucket = bucketToUse === 'gallary_images' ? 'images' : 'gallary_images';
        console.log(`First upload failed. Trying alternative bucket: ${altBucket}`);
        
        const altResult = await supabase.storage
          .from(altBucket)
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
        
        if (altResult.error) {
          console.error('Alternative upload error:', altResult.error);
          
          // Provide more specific error messages based on the error
          if (altResult.error.statusCode === '403') {
            throw new Error('Permission denied. You may need to sign in or request access to upload images.');
          } else {
            throw altResult.error;
          }
        } else {
          // Alternative upload succeeded
          setActiveBucket(altBucket);
          
          // Add the new image to the list immediately
          const newImageUrl = supabase.storage.from(altBucket).getPublicUrl(fileName).data.publicUrl;
          setImages(prev => [{
            url: newImageUrl,
            name: fileName,
            bucket: altBucket
          }, ...prev]);
        }
      } else {
        // Primary upload succeeded
        // Add the new image to the list immediately
        const newImageUrl = supabase.storage.from(bucketToUse).getPublicUrl(fileName).data.publicUrl;
        setImages(prev => [{
          url: newImageUrl,
          name: fileName,
          bucket: bucketToUse
        }, ...prev]);
      }
      
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
    return <div className="flex justify-center items-center min-h-screen text-gray-300">Loading gallery...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center text-white mb-6">Gallery</h1>
      
      {/* Upload button and form */}
      <div className="mb-8 relative">
        {!showUploadForm ? (
          <div className="flex justify-center">
            <button 
              onClick={() => setShowUploadForm(true)}
              className="bg-funeral-accent text-white px-6 py-3 rounded-lg hover:bg-funeral-medium transition-all text-lg font-medium shadow-lg border border-funeral-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Memorial Photo
            </button>
          </div>
        ) : (
          <div className="bg-funeral-darkest border border-funeral-dark rounded-lg shadow-lg p-6 mb-6 relative max-w-2xl mx-auto">
            <FlowerDecoration className="absolute -top-4 -right-4 w-16 h-16 text-funeral-accent transform rotate-45" />
            
            <h2 className="text-xl font-bold text-white mb-4">Upload a Memorial Photo</h2>
            
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
                  Select Image
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-gray-300 bg-funeral-darkest border border-funeral-dark rounded p-2"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="caption" className="block text-sm font-medium text-gray-300 mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-funeral-accent"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setFile(null);
                    setCaption('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-funeral-accent text-white rounded-md hover:bg-funeral-medium transition-colors"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                <p>Note: If you encounter permission issues, please contact the site administrator.</p>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-funeral-accent text-center mb-6">{error}</div>
      )}
      
      {/* Refresh button */}
      <div className="flex justify-center mb-6">
        <button 
          onClick={() => fetchImages()}
          className="bg-funeral-dark text-white px-4 py-2 rounded-lg hover:bg-funeral-medium transition-all text-sm font-medium shadow-lg border border-funeral-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh Gallery
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto h-[600px]">
        {images.length === 0 && !error ? (
          <div className="flex justify-center items-center col-span-3 text-xl text-gray-300">
            No images available in the gallery. Add your first photo above.
          </div>
        ) : (
          images.map((image, index) => (
            <div key={index} className="bg-funeral-darkest border border-funeral-dark rounded-lg shadow-lg overflow-hidden group relative">
              <img 
                src={image.url} 
                alt={image.name} 
                className="w-full h-72 object-cover group-hover:opacity-90 transition-opacity" 
                onError={(e) => {
                  console.error(`Failed to load image: ${image.url}`);
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjIzLTUuMzc3IDEyLTEyIDEycy0xMi01LjM3Ny0xMi0xMiA1LjM3Ny0xMiAxMi0xMiAxMiA1LjM3NyAxMiAxMnptLTEgMGMwIDYuMDcxLTQuOTI5IDExLTExIDExcy0xMS00LjkyOS0xMS0xMSA0LjkyOS0xMSAxMS0xMSAxMSA0LjkyOSAxMSAxMXptLTExLjUgNC4wMDFoMXYtOC4wMDJoLTF2OC4wMDJ6bS0xLjE2Ni0xMS4wMDFjMC0uNTUyLjQ0OC0xIDEtMSAuNTUzIDAgMSAuNDQ4IDEgMSAwIC41NTMtLjQ0NyAxLTEgMS0uNTUyIDAtMS0uNDQ3LTEtMXoiLz48L3N2Zz4=';
                  e.target.className = 'w-full h-72 object-contain p-4';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm truncate">
                  {image.name.split('_').slice(1).join(' ').replace(/\.[^/.]+$/, "").replace(/_/g, " ") || 'Memorial Photo'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Gallery;
