import { Router } from 'express';
import { uploadController } from './upload.controller';
import { authenticate } from '../../middleware/authenticate';
import { uploadFile } from '../../middleware/upload';

const router = Router();

router.use(authenticate);

// Upload up to 5 files at once
router.post('/', uploadFile.array('files', 5), (req, res, next) =>
  uploadController.upload(req, res, next)
);

export default router;
