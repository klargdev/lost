import React, { useState, useEffect } from 'react';
import { supabase, content } from '../../lib/supabase';
import toast from 'react-hot-toast';

function GalleryManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState('');
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    fetchBuckets();
  }, []);

  useEffect(() => {
    if (selectedBucket) {
      fetchImages(selectedBucket);
    }
  }, [selectedBucket]);

  async function fetchBuckets() {
    try {
      setLoading(true);
      
      // Try to get available buckets
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error fetching buckets:', error);
        toast.error('Failed to load storage buckets');
        return;
      }
      
      if (data && data.length > 0) {
        setBuckets(data);
        setSelectedBucket(data[0].name);
      } else {
        toast.error('No storage buckets found');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching buckets');
    } finally {
      setLoading(false);
    }
  }

  async function fetchImages(bucketName) {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.storage.from(bucketName).list();
      
      if (error) {
        console.error('Error fetching images:', error);
        toast.error(`Failed to load images from ${bucketName}`);
        return;
      }
      
      if (data && data.length > 0) {
        const imageUrls = data.map(file => ({
          url: supabase.storage.from(bucketName).getPublicUrl(file.name).data.publicUrl,
          name: file.name,
          bucket: bucketName,
          created_at: file.created_at || new Date().toISOString()
        }));
        
        // Sort by name (which includes timestamp) to show newest first
        imageUrls.sort((a, b) => {
          const aTime = parseInt(a.name.split('_')[0] || '0');
          const bTime = parseInt(b.name.split('_')[0] || '0');
          return bTime - aTime; // Descending order (newest first)
        });
        
        setImages(imageUrls);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching images');
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
    
    if (!selectedBucket) {
      toast.error('Please select a storage bucket');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create a unique file name to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${caption.replace(/\s+/g, '_') || 'memorial'}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from(selectedBucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      
      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        return;
      }
      
      toast.success('Image uploaded successfully');
      
      // Add the new image to the list immediately
      const newImageUrl = supabase.storage.from(selectedBucket).getPublicUrl(fileName).data.publicUrl;
      setImages(prev => [{
        url: newImageUrl,
        name: fileName,
        bucket: selectedBucket,
        created_at: new Date().toISOString()
      }, ...prev]);
      
      // Reset form
      setFile(null);
      setCaption('');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(image) {
    if (window.confirm(`Are you sure you want to delete this image: ${image.name}?`)) {
      try {
        setDeleting(prev => ({ ...prev, [image.name]: true }));
        
        const { error } = await content.deleteImage(image.bucket, image.name);
        
        if (error) {
          console.error('Delete error:', error);
          toast.error('Failed to delete image');
          return;
        }
        
        toast.success('Image deleted successfully');
        
        // Remove the deleted image from the list
        setImages(prev => prev.filter(img => img.name !== image.name));
        
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('An error occurred while deleting the image');
      } finally {
        setDeleting(prev => ({ ...prev, [image.name]: false }));
      }
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-funeral-dark rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Gallery Management</h2>
        
        {/* Bucket selection */}
        <div className="mb-6">
          <label htmlFor="bucket" className="block text-sm font-medium text-gray-300 mb-1">
            Storage Bucket
          </label>
          <select
            id="bucket"
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-funeral-accent"
          >
            <option value="">Select a bucket</option>
            {buckets.map(bucket => (
              <option key={bucket.id} value={bucket.name}>
                {bucket.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Upload form */}
        <form onSubmit={handleUpload} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Upload New Image</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
            
            <div>
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
          </div>
          
          <div className="mt-4">
            <button
              type="submit"
              disabled={uploading || !selectedBucket}
              className="px-4 py-2 bg-funeral-accent text-white rounded-md hover:bg-funeral-medium transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </form>
        
        {/* Image gallery */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Manage Images</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-funeral-accent mx-auto mb-4"></div>
              <p>Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 bg-funeral-darkest rounded-lg">
              <p>No images found in this bucket.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="bg-funeral-darkest rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-48">
                    <img 
                      src={image.url} 
                      alt={image.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjIzLTUuMzc3IDEyLTEyIDEycy0xMi01LjM3Ny0xMi0xMiA1LjM3Ny0xMiAxMi0xMiAxMiA1LjM3NyAxMiAxMnptLTEgMGMwIDYuMDcxLTQuOTI5IDExLTExIDExcy0xMS00LjkyOS0xMS0xMSA0LjkyOS0xMSAxMS0xMSAxMSA0LjkyOSAxMSAxMXptLTExLjUgNC4wMDFoMXYtOC4wMDJoLTF2OC4wMDJ6bS0xLjE2Ni0xMS4wMDFjMC0uNTUyLjQ0OC0xIDEtMSAuNTUzIDAgMSAuNDQ4IDEgMSAwIC41NTMtLjQ0NyAxLTEgMS0uNTUyIDAtMS0uNDQ3LTEtMXoiLz48L3N2Zz4=';
                        e.target.className = 'w-full h-full object-contain p-4';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-300 truncate mb-2">
                      {image.name.split('_').slice(1).join(' ').replace(/\.[^/.]+$/, "").replace(/_/g, " ") || 'Memorial Photo'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(parseInt(image.name.split('_')[0]) || Date.now()).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(image)}
                        disabled={deleting[image.name]}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        {deleting[image.name] ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GalleryManagement; 