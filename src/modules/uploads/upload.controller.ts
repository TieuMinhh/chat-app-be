import { Response, NextFunction } from 'express';
import { uploadService } from './upload.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { AuthRequest } from '../../shared/types';

export class UploadController {
  async upload(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const results = await uploadService.uploadFiles(files);
      ApiResponse.created(res, results, 'Files uploaded successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
