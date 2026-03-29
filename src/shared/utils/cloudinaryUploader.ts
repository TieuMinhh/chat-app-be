import cloudinary from '../../config/cloudinary';

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'messenger-clone',
  format: string = 'webp'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        format: format,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Unknown Cloudinary upload error'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};
