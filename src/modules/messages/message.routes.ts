import { Router } from 'express';
import { messageController } from './message.controller';
import { authenticate } from '../../middleware/authenticate';
import { messageLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.post('/', messageLimiter, (req, res, next) =>
  messageController.send(req, res, next)
);

router.get('/', (req, res, next) =>
  messageController.getMessages(req, res, next)
);

export default router;
