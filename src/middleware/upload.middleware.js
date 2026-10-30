const multer = require('multer');

const storage = multer.memoryStorage(); // store in memory, not disk

const fileFilter = (req, file, cb) => {
    console.log('Uploaded filename:', file.originalname);
    console.log('Uploaded mimetype:', file.mimetype);
    const allowedTypes = ['image/jpeg', 'image/jpg','image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid image format. Only JPEG, JPG, PNG, WEBP allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;