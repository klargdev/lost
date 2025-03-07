import React, { useState, useEffect } from 'react';
import { supabase, content } from '../../lib/supabase';
import toast from 'react-hot-toast';

function GuestbookModeration() {
  const [tributes, setTributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    fetchTributes();
  }, []);

  async function fetchTributes() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tributes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tributes:', error);
        toast.error('Failed to load guestbook entries');
        return;
      }
      
      // Process tributes and fetch comments for each
      if (data && data.length > 0) {
        // Initialize comments for each tribute
        const tributesWithComments = await Promise.all(data.map(async (tribute) => {
          // Fetch comments for this tribute
          const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('tribute_id', tribute.id)
            .order('created_at', { ascending: true });
          
          if (commentsError) {
            console.error('Error fetching comments:', commentsError);
            return { ...tribute, comments: [] };
          }
          
          return { ...tribute, comments: comments || [] };
        }));
        
        setTributes(tributesWithComments);
      } else {
        setTributes([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching guestbook entries');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTribute(tribute) {
    if (window.confirm(`Are you sure you want to delete this tribute from ${tribute.author_name}?`)) {
      try {
        setDeleting(prev => ({ ...prev, [tribute.id]: true }));
        
        // First delete all comments associated with this tribute
        if (tribute.comments && tribute.comments.length > 0) {
          const { error: commentsError } = await supabase
            .from('comments')
            .delete()
            .eq('tribute_id', tribute.id);
          
          if (commentsError) {
            console.error('Error deleting comments:', commentsError);
            toast.error('Failed to delete associated comments');
            return;
          }
        }
        
        // Then delete the tribute itself
        const { error } = await content.deleteGuestbookPost(tribute.id);
        
        if (error) {
          console.error('Delete error:', error);
          toast.error('Failed to delete tribute');
          return;
        }
        
        toast.success('Tribute deleted successfully');
        
        // Remove the deleted tribute from the list
        setTributes(prev => prev.filter(t => t.id !== tribute.id));
        
      } catch (error) {
        console.error('Error deleting tribute:', error);
        toast.error('An error occurred while deleting the tribute');
      } finally {
        setDeleting(prev => ({ ...prev, [tribute.id]: false }));
      }
    }
  }

  async function handleDeleteComment(tributeId, commentId) {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        setDeleting(prev => ({ ...prev, [`comment-${commentId}`]: true }));
        
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);
        
        if (error) {
          console.error('Delete comment error:', error);
          toast.error('Failed to delete comment');
          return;
        }
        
        toast.success('Comment deleted successfully');
        
        // Update the tribute's comments in the state
        setTributes(prev => prev.map(tribute => {
          if (tribute.id === tributeId) {
            return {
              ...tribute,
              comments: tribute.comments.filter(comment => comment.id !== commentId)
            };
          }
          return tribute;
        }));
        
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('An error occurred while deleting the comment');
      } finally {
        setDeleting(prev => ({ ...prev, [`comment-${commentId}`]: false }));
      }
    }
  }

  function toggleComments(tributeId) {
    setExpandedComments(prev => ({
      ...prev,
      [tributeId]: !prev[tributeId]
    }));
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-funeral-dark rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Guestbook Moderation</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-funeral-accent mx-auto mb-4"></div>
            <p>Loading guestbook entries...</p>
          </div>
        ) : tributes.length === 0 ? (
          <div className="text-center py-8 bg-funeral-darkest rounded-lg">
            <p>No guestbook entries found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tributes.map((tribute) => (
              <div key={tribute.id} className="bg-funeral-darkest rounded-lg overflow-hidden shadow-md">
                <div className="p-4 border-b border-funeral-dark">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{tribute.author_name}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(tribute.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTribute(tribute)}
                      disabled={deleting[tribute.id]}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {deleting[tribute.id] ? 'Deleting...' : 'Delete Tribute'}
                    </button>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{tribute.message}</p>
                  
                  {tribute.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={tribute.imageUrl} 
                        alt="Tribute" 
                        className="max-h-48 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxMmMwIDYuNjIzLTUuMzc3IDEyLTEyIDEycy0xMi01LjM3Ny0xMi0xMiA1LjM3Ny0xMiAxMi0xMiAxMiA1LjM3NyAxMiAxMnptLTEgMGMwIDYuMDcxLTQuOTI5IDExLTExIDExcy0xMS00LjkyOS0xMS0xMSA0LjkyOS0xMSAxMS0xMSAxMSA0LjkyOSAxMSAxMXptLTExLjUgNC4wMDFoMXYtOC4wMDJoLTF2OC4wMDJ6bS0xLjE2Ni0xMS4wMDFjMC0uNTUyLjQ0OC0xIDEtMSAuNTUzIDAgMSAuNDQ4IDEgMSAwIC41NTMtLjQ0NyAxLTEgMS0uNTUyIDAtMS0uNDQ3LTEtMXoiLz48L3N2Zz4=';
                          e.target.className = 'max-h-48 rounded-lg object-contain p-4';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <button
                      onClick={() => toggleComments(tribute.id)}
                      className="text-sm text-funeral-accent hover:text-funeral-medium transition-colors"
                    >
                      {expandedComments[tribute.id] ? 'Hide Comments' : `Show Comments (${tribute.comments?.length || 0})`}
                    </button>
                  </div>
                </div>
                
                {expandedComments[tribute.id] && (
                  <div className="p-4 bg-[#0a0707]">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Comments</h4>
                    
                    {tribute.comments && tribute.comments.length > 0 ? (
                      <div className="space-y-3">
                        {tribute.comments.map((comment) => (
                          <div key={comment.id} className="bg-funeral-darkest p-3 rounded border-l-2 border-funeral-medium">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <span className="text-sm font-medium text-white">{comment.author_name}</span>
                                <span className="text-xs text-gray-400 ml-2">
                                  {new Date(comment.created_at).toLocaleString()}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteComment(tribute.id, comment.id)}
                                disabled={deleting[`comment-${comment.id}`]}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                              >
                                {deleting[`comment-${comment.id}`] ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                            <p className="text-gray-300 text-sm">{comment.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No comments on this tribute.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GuestbookModeration; 