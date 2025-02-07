const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinaryConfig');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tiffin-service', // Folder in your Cloudinary account
    allowed_formats: ['jpeg', 'png', 'jpg'], // Allowed file formats
  },
});

const upload = multer({ storage: storage });

module.exports = upload;