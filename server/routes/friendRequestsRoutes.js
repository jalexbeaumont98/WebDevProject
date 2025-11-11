import { Router } from 'express';
import { listMine, createOne, updateStatus, removeById } from '../controllers/friendRequestsController.js';
import { requireSignin } from '../controllers/authController.js';

const router = Router();
router.get('/', requireSignin, listMine);
router.post('/', requireSignin, createOne);
router.post('/:id', requireSignin, updateStatus);   // body: { action: 'accept' | 'decline' }
router.delete('/:id', requireSignin, removeById);
export default router;