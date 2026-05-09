const User = require('../models/User');

async function getProfile(req, res) {
  const user = await User.findById(req.user._id).select('-password -otp -otpExpiry');
  if (!user) {
    // Hardcoded admin path: no DB record exists yet, return a synthetic admin profile
    // so the navbar/session UI can render correctly.
    if (req.user.role === 'admin') {
      return res.json({
        user: {
          _id: req.user._id,
          name: 'System Admin',
          phone: req.user.phone || '0000000000',
          email: 'admin@serviqo.com',
          role: 'admin',
        },
      });
    }
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user });
}

async function updateProfile(req, res) {
  const { name, email, city, address, bio, experience, hourlyRate, serviceCategory } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (city) updates.city = city;
  if (address) updates.address = address;
  if (bio !== undefined) updates.bio = bio;
  if (experience !== undefined) updates.experience = Number(experience);
  if (hourlyRate !== undefined) updates.hourlyRate = Number(hourlyRate);
  if (serviceCategory) updates.serviceCategory = serviceCategory;
  
  if (req.file) {
    // If user already had a profile picture, delete it from Cloudinary
    const currentUser = await User.findById(req.user._id);
    if (currentUser.profilePicture) {
      const { deleteFromCloudinary } = require('../middlewares/upload');
      await deleteFromCloudinary(currentUser.profilePicture);
    }
    updates.profilePicture = req.file.path; // Multer-storage-cloudinary provides the secure_url in req.file.path
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, select: '-password -otp -otpExpiry' }
  );

  return res.json({ message: 'Profile updated', user });
}

module.exports = { getProfile, updateProfile };
