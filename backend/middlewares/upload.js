const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
    // Extract public_id from URL: e.g., serviqo/profiles/filename
    const parts = imageUrl.split('/');
    const folderIndex = parts.indexOf('serviqo');
    if (folderIndex === -1) return;
    
    const publicIdWithExtension = parts.slice(folderIndex).join('/');
    const publicId = publicIdWithExtension.split('.')[0];
    
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
