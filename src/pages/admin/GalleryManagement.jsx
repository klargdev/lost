import React, { useState, useEffect } from 'react';
import { supabase, content, ensureStorageBucketExists, testRLSPolicies } from '../../lib/supabase';
import { Spinner } from '../../components/Spinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

// Flower decoration for the upload section
const FlowerDecoration = ({ className }) => (
  <div className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor" className="opacity-20">
      <path d="M50,20 C55,30 65,30 70,20 C75,10 85,10 90,20 C95,30 85,40 75,40 C65,40 55,30 50,40 C45,30 35,40 25,40 C15,40 5,30 10,20 C15,10 25,10 30,20 C35,30 45,30 50,20 Z" />
    </svg>
  </div>
);

function GalleryManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [bucketName] = useState('gallary_images'); // Fixed bucket name
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Group management state
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [imageMetadata, setImageMetadata] = useState({});

  useEffect(() => {
    checkAdmin();
    initializeGallery();
  }, []);

  useEffect(() => {
    fetchImages();
    fetchGroups();
  }, [refreshKey, activeFilter]); // Refetch when refreshKey changes or filter changes

  async function checkAdmin() {
    try {
      // Use the auth context to check admin status
      if (!isAdmin) {
        toast.error('Unauthorized access');
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast.error('Error checking permissions');
      navigate('/admin/login');
    }
  }

  async function initializeGallery() {
    try {
      console.log('Initializing gallery...');
      
      // First, ensure the storage bucket exists using content.gallery.initializeBucket
      const { error } = await content.gallery.initializeBucket();
      
      if (error) {
        throw error || new Error('Failed to initialize storage bucket');
      }
      
      // Then check if the tables exist
      const { count, error: checkError } = await supabase
        .from('image_groups')
        .select('*', { count: 'exact', head: true });
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking image_groups table:', checkError);
        
        // Create the table if it doesn't exist
        if (checkError.code === '42P01') { // Table doesn't exist
          await createImageGroupsTable();
        } else {
          throw checkError;
        }
      }
      
      console.log('Gallery initialized successfully');
    } catch (error) {
      console.error('Error initializing gallery:', error);
      toast.error('Failed to initialize gallery: ' + (error.message || 'Unknown error'));
    }
  }

  async function fetchGroups() {
    try {
      // First check if the table exists
      const { count, error: checkError } = await supabase
        .from('image_groups')
        .select('*', { count: 'exact', head: true });
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking image_groups table:', checkError);
        
        // Create the table if it doesn't exist
        if (checkError.code === '42P01') { // Table doesn't exist
          await createImageGroupsTable();
        } else {
          throw checkError;
        }
      }
      
      // Fetch groups
      const { data, error } = await supabase
        .from('image_groups')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load image groups');
      
      // Use default groups if there's an error
      setGroups([
        { id: 'family', name: 'Family', description: 'Family photos' },
        { id: 'friends', name: 'Friends', description: 'Photos with friends' },
        { id: 'memories', name: 'Memories', description: 'Special memories' }
      ]);
    }
  }

  async function createImageGroupsTable() {
    try {
      // Create the image_groups table
      const { error: createError } = await supabase.rpc('create_image_groups_table');
      
      if (createError) {
        console.error('Error creating image_groups table:', createError);
        return;
      }
      
      // Insert default groups
      const defaultGroups = [
        { name: 'Family', description: 'Family photos' },
        { name: 'Friends', description: 'Photos with friends' },
        { name: 'Memories', description: 'Special memories' }
      ];
      
      for (const group of defaultGroups) {
        await createGroup(group.name, group.description);
      }
    } catch (error) {
      console.error('Error creating image_groups table:', error);
    }
  }

  async function fetchImages() {
    try {
      setLoading(true);
      console.log('Fetching images using content.gallery.listImages()');

      const { data, error } = await content.gallery.listImages(activeFilter);

      if (error) {
        throw error;
      }

      console.log('Fetched images:', data);
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images: ' + (error.message || 'Unknown error'));
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    
    try {
      setCreatingGroup(true);
      const result = await createGroup(newGroupName, newGroupDescription);
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success(`Group "${newGroupName}" created successfully`);
      setNewGroupName('');
      setNewGroupDescription('');
      setShowNewGroupForm(false);
      
      // Refresh groups
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group: ' + (error.message || 'Unknown error'));
    } finally {
      setCreatingGroup(false);
    }
  }
  
  async function createGroup(name, description = '') {
    try {
      const { data, error } = await supabase
        .from('image_groups')
        .insert([{ name, description }])
        .select();
        
      return { group: data?.[0] || null, error };
    } catch (error) {
      return { group: null, error };
    }
  }

  async function handleDeleteGroup(groupId, groupName) {
    if (!window.confirm(`Are you sure you want to delete the group "${groupName}"? Images in this group will not be deleted but will no longer be categorized.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('image_groups')
        .delete()
        .eq('id', groupId);
      
      if (error) {
        throw error;
      }
      
      // Update any images that were in this group
      const { error: updateError } = await supabase
        .from('image_metadata')
        .update({ group_id: null })
        .eq('group_id', groupId);
      
      if (updateError) {
        console.error('Error updating images after group deletion:', updateError);
      }
      
      toast.success(`Group "${groupName}" deleted successfully`);
      
      // Reset active filter if it was the deleted group
      if (activeFilter === groupId) {
        setActiveFilter(null);
      }
      
      // Refresh groups and images
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group: ' + (error.message || 'Unknown error'));
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      
      // Use the new uploadImage function
      await content.gallery.uploadImage(
        file, 
        caption, 
        selectedGroupId
      );
      
      toast.success('Image uploaded successfully');
      
      // Reset form
      setFile(null);
      setCaption('');
      setSelectedGroupId('');
      
      // Reset file input
      const fileInput = document.getElementById('image-upload');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Refresh the gallery
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageName) {
    if (!window.confirm(`Are you sure you want to delete ${imageName}?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Use the new deleteImage function
      await content.gallery.deleteImage(imageName);
      
      toast.success('Image deleted successfully');
      // Refresh the gallery
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }
  
  async function handleUpdateImageMetadata(imageName, newCaption, newGroupId) {
    try {
      // Check if metadata exists for this image
      const { data: existingData, error: checkError } = await supabase
        .from('image_metadata')
        .select('*')
        .eq('filename', imageName)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing metadata:', checkError);
        throw checkError;
      }
      
      // Prepare update data
      const updateData = {
        caption: newCaption,
        group_id: newGroupId === '' ? null : newGroupId
      };
      
      let result;
      
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('image_metadata')
          .update(updateData)
          .eq('filename', imageName);
      } else {
        // Insert new record
        result = await supabase
          .from('image_metadata')
          .insert([{
            filename: imageName,
            ...updateData
          }]);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success('Image updated successfully');
      setEditingImage(null);
      
      // Refresh the image list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image: ' + (error.message || 'Unknown error'));
    }
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
        e.target.value = ''; // Reset file input
        return;
      }
      
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        e.target.value = ''; // Reset file input
        return;
      }
      
      setFile(selectedFile);
      
      // Auto-fill caption from filename
      const fileName = selectedFile.name.split('.')[0].replace(/_/g, ' ');
      setCaption(fileName);
    }
  }
  
  // Component for editing an image's metadata
  function ImageEditor({ image, onSave, onCancel }) {
    const [editCaption, setEditCaption] = useState(image.caption || '');
    const [editGroupId, setEditGroupId] = useState(image.group_id || '');
    
    return (
      <div className="bg-funeral-darkest p-4 rounded-lg">
        <h4 className="text-white font-medium mb-3">Edit Image</h4>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Caption
          </label>
          <input
            type="text"
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md"
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Group
          </label>
          <select
            value={editGroupId}
            onChange={(e) => setEditGroupId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md"
          >
            <option value="">No Group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-funeral-dark text-white rounded-md hover:bg-funeral-medium transition-colors border border-funeral-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(image.name, editCaption, editGroupId)}
            className="px-3 py-1 bg-funeral-accent text-white rounded-md hover:bg-funeral-medium transition-colors text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  async function handleTestRLSPolicies() {
    try {
      toast.loading('Testing RLS policies...');
      const results = await testRLSPolicies();
      toast.dismiss();
      
      console.log('RLS policy test results:', results);
      
      if (results.groupsSelect && results.groupsInsert && 
          results.metadataSelect && results.metadataInsert) {
        toast.success('All RLS policy tests passed!');
      } else {
        let message = 'RLS policy tests failed: ';
        if (!results.groupsSelect) message += 'Cannot read groups. ';
        if (!results.groupsInsert) message += 'Cannot insert groups. ';
        if (!results.metadataSelect) message += 'Cannot read metadata. ';
        if (!results.metadataInsert) message += 'Cannot insert metadata. ';
        
        toast.error(message);
      }
    } catch (error) {
      console.error('Error testing RLS policies:', error);
      toast.error('Error testing RLS policies: ' + (error.message || 'Unknown error'));
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-funeral-dark rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Gallery Management</h2>

        {/* Group management section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Image Groups</h3>
            <button
              onClick={() => setShowNewGroupForm(!showNewGroupForm)}
              className="px-3 py-1 bg-funeral-accent text-white rounded-md hover:bg-funeral-medium transition-colors text-sm"
            >
              {showNewGroupForm ? 'Cancel' : 'Create New Group'}
            </button>
          </div>
          
          {showNewGroupForm && (
            <form onSubmit={handleCreateGroup} className="mb-4 bg-funeral-darkest p-4 rounded-lg">
              <div className="space-y-3">
                <div>
                  <label htmlFor="group-name" className="block text-sm font-medium text-gray-300 mb-1">
                    Group Name *
                  </label>
                  <input
                    id="group-name"
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md"
                    placeholder="e.g., Family, Friends, Events"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="group-description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    id="group-description"
                    type="text"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md"
                    placeholder="Brief description of this group"
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={creatingGroup || !newGroupName.trim()}
                    className="px-4 py-2 bg-funeral-accent text-white rounded-md hover:bg-funeral-medium disabled:opacity-50 transition-colors"
                  >
                    {creatingGroup ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </div>
            </form>
          )}
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-1 rounded-md text-sm ${
                activeFilter === null
                  ? 'bg-funeral-accent text-white'
                  : 'bg-funeral-darkest text-gray-300 hover:bg-funeral-medium hover:text-white'
              } transition-colors`}
            >
              All Images
            </button>
            
            {groups.map(group => (
              <div key={group.id} className="relative group">
                <button
                  onClick={() => setActiveFilter(group.id)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    activeFilter === group.id
                      ? 'bg-funeral-accent text-white'
                      : 'bg-funeral-darkest text-gray-300 hover:bg-funeral-medium hover:text-white'
                  } transition-colors`}
                >
                  {group.name}
                </button>
                
                <button
                  onClick={() => handleDeleteGroup(group.id, group.name)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title={`Delete ${group.name} group`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload form */}
        <form onSubmit={handleUpload} className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Upload New Image</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-1">
                Select Image
              </label>
              <input
                id="image-upload"
                type="file"
                onChange={handleFileChange}
                className="w-full text-gray-300 bg-funeral-darkest border border-funeral-dark rounded p-2"
                accept="image/*"
                disabled={uploading}
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
                placeholder="Enter a caption for the image"
                disabled={uploading}
              />
            </div>
            
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-300 mb-1">
                Group (Optional)
              </label>
              <select
                id="group"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-funeral-accent"
                disabled={uploading}
              >
                <option value="">No Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full bg-funeral-accent text-white py-2 px-4 rounded-md hover:bg-funeral-medium focus:outline-none focus:ring-2 focus:ring-funeral-accent disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>
        </form>

        {/* Image gallery */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">
              {activeFilter 
                ? `Images in "${groups.find(g => g.id === activeFilter)?.name || 'Group'}"` 
                : 'All Images'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleTestRLSPolicies}
                className="px-3 py-1 bg-purple-700 text-white rounded-md hover:bg-purple-600 transition-colors border border-purple-600 text-sm"
              >
                Test RLS Policies
              </button>
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="px-3 py-1 bg-funeral-dark text-white rounded-md hover:bg-funeral-medium transition-colors border border-funeral-medium text-sm"
              >
                Refresh Gallery
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Spinner size="lg" className="mb-4" />
              <p className="text-gray-300">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 bg-funeral-darkest rounded-lg">
              <p className="text-gray-300">No images found in the gallery.</p>
              <p className="text-gray-400 text-sm mt-2">Upload some images to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.name} className="bg-funeral-darkest rounded-lg overflow-hidden shadow-md">
                  {editingImage === image.name ? (
                    <ImageEditor 
                      image={image} 
                      onSave={handleUpdateImageMetadata}
                      onCancel={() => setEditingImage(null)}
                    />
                  ) : (
                    <>
                      <div className="relative h-48">
                        <img
                          src={image.url}
                          alt={image.caption || image.name.split('_').slice(1).join(' ').replace(/\.[^/.]+$/, "")}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjIzLTUuMzc3IDEyLTEyIDEycy0xMi01LjM3Ny0xMi0xMiA1LjM3Ny0xMiAxMi0xMiAxMiA1LjM3NyAxMiAxMnptLTEgMGMwIDYuMDcxLTQuOTI5IDExLTExIDExcy0xMS00LjkyOS0xMS0xMSA0LjkyOS0xMSAxMS0xMSAxMSA0LjkyOSAxMSAxMXptLTExLjUgNC4wMDFoMXYtOC4wMDJoLTF2OC4wMDJ6bS0xLjE2Ni0xMS4wMDFjMC0uNTUyLjQ0OC0xIDEtMSAuNTUzIDAgMSAuNDQ4IDEgMSAwIC41NTMtLjQ0NyAxLTEgMS0uNTUyIDAtMS0uNDQ3LTEtMXoiLz48L3N2Zz4=';
                            e.target.className = 'w-full h-full object-contain p-4';
                          }}
                        />
                        
                        {image.group && (
                          <div className="absolute top-2 right-2 bg-funeral-accent text-white text-xs px-2 py-1 rounded">
                            {image.group.name}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-300 truncate mb-2">
                          {image.caption || image.name.split('_').slice(1).join(' ').replace(/\.[^/.]+$/, "")}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            {new Date(image.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingImage(image.name)}
                              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(image.name)}
                              className="text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
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