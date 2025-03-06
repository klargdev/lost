import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

function Guestbook() {
  const [tributes, setTributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ author_name: "", message: "" });
  const [file, setFile] = useState(null);
  const firstTributeRef = useRef(null);
  const formRef = useRef(null);

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

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Guestbook</h1>

      <div className="space-y-6 flex-grow">
        {loading ? (
          <div className="text-center text-gray-600">Loading tributes...</div>
        ) : tributes.length > 0 ? (
          tributes.map((tribute, index) => (
            <div
              key={tribute.id}
              ref={index === 0 ? firstTributeRef : null}  // Set the ref to the first post
              className="bg-white rounded-lg shadow-md p-6"
            >
              {tribute.imageUrl && (
                <img
                  src={tribute.imageUrl}
                  alt="Tribute"
                  className="w-full h-auto mb-4 rounded-lg object-cover"
                />
              )}
              <p className="text-gray-700 mb-4">{tribute.message}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>- {tribute.author_name}</span>
                <span>{new Date(tribute.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600">No tributes yet.</div>
        )}
      </div>

      {/* Form at the bottom */}
      <form
        ref={formRef} // Reference to the form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <div className="mb-4">
          <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="author_name"
            value={form.author_name}
            onChange={(e) => setForm((prev) => ({ ...prev, author_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Your Message
          </label>
          <textarea
            id="message"
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full" />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Tribute"}
        </button>
      </form>
    </div>
  );
}

export default Guestbook;
