export const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_unsigned_preset"); // Set up in Cloudinary

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        return data.secure_url; // Return the Cloudinary URL
    } catch (error) {
        console.error("Upload failed:", error);
        return null;
    }
};