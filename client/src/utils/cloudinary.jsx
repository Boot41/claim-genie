// utils/cloudinary.js

export async function uploadFileToCloudinary(file) {
  const cloudName = 'dyzl2p5ik';
  // Using 'ml_default' as a common Cloudinary preset that allows uploading without signing
  const uploadPreset = 'health';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    // For PDFs, set specific flags
    if (file.type === 'application/pdf') {
      formData.append('resource_type', 'auto');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary API error:', errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', data);
    return data.secure_url;
  } catch (error) {
    console.error('Error in uploadFileToCloudinary:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
}