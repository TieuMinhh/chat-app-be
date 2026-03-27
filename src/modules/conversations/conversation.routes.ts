import { Router } from 'express';
import { conversationController } from './conversation.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createConversationSchema, updateConversationSchema, addMembersSchema } from './conversation.validation';

const router = Router();

router.use(authenticate);

router.post('/', validate(createConversationSchema), (req, res, next) =>
  conversationController.create(req, res, next)
);

router.get('/', (req, res, next) =>
  conversationController.getAll(req, res, next)
);

router.get('/:id', (req, res, next) =>
  conversationController.getById(req, res, next)
);

router.put('/:id', validate(updateConversationSchema), (req, res, next) =>
  conversationController.update(req, res, next)
);

router.post('/:id/members', validate(addMembersSchema), (req, res, next) =>
  conversationController.addMembers(req, res, next)
);

router.delete('/:id/members/:userId', (req, res, next) =>
  conversationController.removeMember(req, res, next)
);

router.post('/:id/leave', (req, res, next) =>
  conversationController.leave(req, res, next)
);

export default router;
