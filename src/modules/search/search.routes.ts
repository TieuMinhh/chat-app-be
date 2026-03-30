import { Router } from 'express';
import { searchController } from './search.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/users', (req, res, next) =>
  searchController.searchUsers(req, res, next)
);

router.get('/conversations', (req, res, next) =>
  searchController.searchConversations(req, res, next)
);

router.get('/messages', (req, res, next) =>
  searchController.searchMessages(req, res, next)
);

export default router;
