import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { updateProfileSchema } from './user.validation';

const router = Router();

import { upload } from '../../middleware/upload';

// All user routes require authentication
router.use(authenticate);

router.get('/me', (req, res, next) => userController.getMe(req, res, next));
router.get('/search', (req, res, next) => userController.searchUsers(req, res, next));
router.get('/blocked', (req, res, next) => userController.getBlockedUsers(req, res, next));
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
router.put('/profile', upload.single('avatarFile'), validate(updateProfileSchema), (req, res, next) =>
  userController.updateProfile(req, res, next)
);
router.post('/:id/block', (req, res, next) => userController.blockUser(req, res, next));
router.delete('/:id/block', (req, res, next) => userController.unblockUser(req, res, next));
router.get('/:id/block-status', (req, res, next) => userController.checkBlockStatus(req, res, next));

export default router;
