import multer from 'multer';
import { AppError } from './errorHandler';

// Use memory storage to process stream to Cloudinary directly
const storage = multer.memoryStorage();

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-rar-compressed',
  'text/plain',
];

const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only images are allowed (jpg, png, gif, webp)', 'UPLOAD_002', 400));
  }
};

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Unsupported file type', 'UPLOAD_002', 400));
  }
};

// For avatar upload (2MB, images only)
export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// For chat image upload (5MB, images only)
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// For chat file upload (25MB, all supported types)
export const uploadFile = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: fileFilter,
});
