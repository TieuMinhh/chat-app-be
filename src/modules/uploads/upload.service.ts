import { uploadToCloudinary } from '../../shared/utils/cloudinaryUploader';
import { AppError } from '../../middleware/errorHandler';

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export class UploadService {
  async uploadFiles(files: Express.Multer.File[]): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new AppError('No files provided', 'UPLOAD_001', 400);
    }

    if (files.length > 5) {
      throw new AppError('Maximum 5 files per upload', 'UPLOAD_001', 400);
    }

    const results: UploadResult[] = [];

    for (const file of files) {
      const isImage = file.mimetype.startsWith('image/');
      const folder = isImage ? 'messenger-clone/images' : 'messenger-clone/files';
      const format = isImage ? 'webp' : undefined;

      try {
        const url = await uploadToCloudinary(file.buffer, folder, format);
        results.push({
          url,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        });
      } catch (error) {
        console.error('Upload failed for file:', file.originalname, error);
        throw new AppError(`Failed to upload ${file.originalname}`, 'UPLOAD_001', 500);
      }
    }

    return results;
  }
}

export const uploadService = new UploadService();
