const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Support multiple environment variable names for the Cloudinary cloud name.
const CLOUDINARY_CLOUD_NAME = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD || process.env.CLOUDINARY_NAME;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const createStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `serviqo/${folder}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      // Use the preset if configured, otherwise Cloudinary defaults are used
      upload_preset: 'serviqo_preset', 
    },
  });
};

const uploadProfile = multer({ storage: createStorage('profiles') });
const uploadCnic = multer({ storage: createStorage('cnic') });
const uploadPortfolio = multer({ storage: createStorage('portfolio') });
const uploadJobImages = multer({ storage: createStorage('jobs') });

/**
 * Deletes an image from Cloudinary given its URL.
 * @param {string} imageUrl - The full secure_url from Cloudinary.
 */
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    let publicId = null;

    try {
      // Try to parse as a URL and extract the public_id after /upload/ (remove version)
      const urlObj = new URL(imageUrl);
      let pathname = urlObj.pathname || imageUrl;
      const uploadIdx = pathname.indexOf('/upload/');
      if (uploadIdx !== -1) {
        let afterUpload = pathname.substring(uploadIdx + '/upload/'.length);
        // strip version prefix like v12345/
        const vMatch = afterUpload.match(/^v[0-9]+\/(.+)$/);
        if (vMatch) afterUpload = vMatch[1];
        if (afterUpload.startsWith('/')) afterUpload = afterUpload.slice(1);
        // remove extension if present
        publicId = afterUpload.replace(/\.[^/.]+$/, '');
      } else {
        // Fallback: look for serviqo/ in the path
        const idx = imageUrl.indexOf('serviqo/');
        if (idx !== -1) {
          const publicIdWithExt = imageUrl.slice(idx);
          publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
        } else {
          // As a last resort, use the last path segment without extension
          const parts = pathname.split('/');
          const last = parts[parts.length - 1] || pathname;
          publicId = last.replace(/\.[^/.]+$/, '');
        }
      }
    } catch (err) {
      // Not a full URL — could already be a public_id or a path
      const idx = imageUrl.indexOf('serviqo/');
      if (idx !== -1) {
        publicId = imageUrl.slice(idx).replace(/\.[^/.]+$/, '');
      } else {
        publicId = imageUrl.replace(/\.[^/.]+$/, '');
      }
    }

    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary deletion failed:', err);
  }
};

module.exports = { 
  uploadProfile, 
  uploadCnic, 
  uploadPortfolio, 
  uploadJobImages,
  deleteFromCloudinary 
};
