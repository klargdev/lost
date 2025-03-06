import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { UserCircleIcon } from "@heroicons/react/24/solid";

function Guestbook() {
  const [tributes, setTributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ author_name: "", message: "" });
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState({}); // Store comments for each tribute
  const [commentForms, setCommentForms] = useState({}); // Store comment form state for each tribute
  const [showCommentForm, setShowCommentForm] = useState({}); // Track which comment forms are visible
  const firstTributeRef = useRef(null);
  const formRef = useRef(null);

  // Function to generate a color based on a string (name)
  const getProfileColor = (name) => {
    // Simple hash function to generate a consistent color for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use our funeral color palette
    const colors = ['#461111', '#A13333', '#B3541E'];
    return colors[Math.abs(hash) % colors.length];
  };

  // Function to get initials from a name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  useEffect(() => {
    fetchTributes();
    // Scroll to the form on the initial page load
    if (formRef.current) {
      window.scrollTo({
        top: formRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, []);

  async function fetchTributes() {
    try {
      const { data, error } = await supabase
        .from("tributes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Initialize comments and comment forms for each tribute
      const initialComments = {};
      const initialCommentForms = {};
      const initialShowCommentForm = {};
      
      (data || []).forEach(tribute => {
        initialComments[tribute.id] = initialComments[tribute.id] || [];
        initialCommentForms[tribute.id] = { author_name: "", message: "" };
        initialShowCommentForm[tribute.id] = false;
      });
      
      setComments(initialComments);
      setCommentForms(initialCommentForms);
      setShowCommentForm(initialShowCommentForm);
      setTributes(data || []);
    } catch (error) {
      console.error("Error fetching tributes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.author_name || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    let imageUrl = "";

    try {
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `tributes/${fileName}`;

        const { data, error } = await supabase.storage
          .from("gallary_images")
          .upload(filePath, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        imageUrl = supabase.storage.from("gallary_images").getPublicUrl(filePath).data.publicUrl;
      }

      const { error } = await supabase
        .from("tributes")
        .insert([{ ...form, imageUrl }]);

      if (error) throw error;

      toast.success("Your tribute has been added");
      setForm({ author_name: "", message: "" });
      setFile(null);
      fetchTributes();
      
      // Scroll to the top post after submission
      if (firstTributeRef.current) {
        window.scrollTo({
          top: firstTributeRef.current.offsetTop,
          behavior: "smooth",
        });
      }
    } catch (error) {
      console.error("Error submitting tribute:", error);
      toast.error("Failed to submit tribute");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle comment form input changes
  const handleCommentFormChange = (tributeId, field, value) => {
    setCommentForms(prev => ({
      ...prev,
      [tributeId]: {
        ...prev[tributeId],
        [field]: value
      }
    }));
  };

  // Toggle comment form visibility
  const toggleCommentForm = (tributeId) => {
    setShowCommentForm(prev => ({
      ...prev,
      [tributeId]: !prev[tributeId]
    }));
  };

  // Add a comment to a tribute
  const addComment = (tributeId) => {
    const commentForm = commentForms[tributeId];
    
    if (!commentForm.author_name || !commentForm.message) {
      toast.error("Please fill in all comment fields");
      return;
    }
    
    const newComment = {
      id: Date.now(), // Use timestamp as unique ID
      author_name: commentForm.author_name,
      message: commentForm.message,
      created_at: new Date().toISOString()
    };
    
    setComments(prev => ({
      ...prev,
      [tributeId]: [...(prev[tributeId] || []), newComment]
    }));
    
    // Reset the comment form
    setCommentForms(prev => ({
      ...prev,
      [tributeId]: { author_name: "", message: "" }
    }));
    
    // Hide the comment form
    setShowCommentForm(prev => ({
      ...prev,
      [tributeId]: false
    }));
    
    toast.success("Comment added successfully");
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Guestbook</h1>

      <div className="space-y-6 flex-grow">
        {loading ? (
          <div className="text-center text-gray-300">Loading tributes...</div>
        ) : tributes.length > 0 ? (
          tributes.map((tribute, index) => (
            <div
              key={tribute.id}
              ref={index === 0 ? firstTributeRef : null}  // Set the ref to the first post
              className="bg-funeral-darkest border border-funeral-dark rounded-lg shadow-lg p-6"
            >
              {tribute.imageUrl && (
                <img
                  src={tribute.imageUrl}
                  alt="Tribute"
                  className="w-full h-auto mb-4 rounded-lg object-cover border border-funeral-dark"
                />
              )}
              <p className="text-gray-300 mb-4">{tribute.message}</p>
              <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-white text-xs font-medium"
                    style={{ backgroundColor: getProfileColor(tribute.author_name) }}
                  >
                    {getInitials(tribute.author_name)}
                  </div>
                  <span>- {tribute.author_name}</span>
                </div>
                <span>{new Date(tribute.created_at).toLocaleDateString()}</span>
              </div>
              
              {/* Comments section */}
              <div className="mt-4 border-t border-funeral-dark pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-300">
                    Comments ({(comments[tribute.id] || []).length})
                  </h3>
                  <button 
                    onClick={() => toggleCommentForm(tribute.id)}
                    className="text-sm text-funeral-accent hover:text-funeral-medium transition-colors"
                  >
                    {showCommentForm[tribute.id] ? 'Cancel' : 'Add Comment'}
                  </button>
                </div>
                
                {/* Comment form */}
                {showCommentForm[tribute.id] && (
                  <div className="bg-[#0a0707] rounded p-3 mb-3 border border-funeral-dark">
                    <div className="mb-2">
                      <label htmlFor={`comment-name-${tribute.id}`} className="block text-xs font-medium text-gray-300 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id={`comment-name-${tribute.id}`}
                        value={commentForms[tribute.id]?.author_name || ''}
                        onChange={(e) => handleCommentFormChange(tribute.id, 'author_name', e.target.value)}
                        className="w-full px-2 py-1 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-funeral-accent text-sm"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label htmlFor={`comment-message-${tribute.id}`} className="block text-xs font-medium text-gray-300 mb-1">
                        Your Comment
                      </label>
                      <textarea
                        id={`comment-message-${tribute.id}`}
                        value={commentForms[tribute.id]?.message || ''}
                        onChange={(e) => handleCommentFormChange(tribute.id, 'message', e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-funeral-accent text-sm"
                        required
                      />
                    </div>
                    <button
                      onClick={() => addComment(tribute.id)}
                      className="w-full bg-funeral-dark text-white py-1 px-3 rounded-md hover:bg-funeral-medium focus:outline-none focus:ring-1 focus:ring-funeral-accent text-sm transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                )}
                
                {/* Comments list */}
                <div className="space-y-2">
                  {(comments[tribute.id] || []).length > 0 ? (
                    (comments[tribute.id] || []).map(comment => (
                      <div key={comment.id} className="bg-[#0a0707] p-3 rounded border-l-2 border-funeral-medium">
                        <p className="text-gray-300 text-sm mb-1">{comment.message}</p>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <div className="flex items-center">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center mr-1 text-white text-xs font-medium"
                              style={{ backgroundColor: getProfileColor(comment.author_name) }}
                            >
                              {getInitials(comment.author_name)}
                            </div>
                            <span>- {comment.author_name}</span>
                          </div>
                          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-xs italic">No comments yet</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-300">No tributes yet.</div>
        )}
      </div>

      {/* Form at the bottom */}
      <form
        ref={formRef} // Reference to the form
        onSubmit={handleSubmit}
        className="bg-funeral-darkest border border-funeral-dark rounded-lg shadow-lg p-6 mb-8 mt-8"
      >
        <h2 className="text-xl font-bold text-white mb-4">Leave a Tribute</h2>
        
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-funeral-dark flex items-center justify-center mr-3 text-white">
            {form.author_name ? getInitials(form.author_name) : "?"}
          </div>
          <div className="flex-1">
            <label htmlFor="author_name" className="block text-sm font-medium text-gray-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="author_name"
              value={form.author_name}
              onChange={(e) => setForm((prev) => ({ ...prev, author_name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-funeral-accent"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
            Your Message
          </label>
          <textarea
            id="message"
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-funeral-accent"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Upload Image (Optional)</label>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
            className="w-full text-gray-300 bg-funeral-darkest border border-funeral-dark rounded p-2" 
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-funeral-accent text-white py-2 px-4 rounded-md hover:bg-funeral-medium focus:outline-none focus:ring-2 focus:ring-funeral-accent focus:ring-offset-2 focus:ring-offset-funeral-darkest disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Tribute"}
        </button>
      </form>
    </div>
  );
}

export default Guestbook;
