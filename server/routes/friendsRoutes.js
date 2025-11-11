// server/routes/friendsRoutes.js
import { Router } from 'express';
import { requireSignin } from '../controllers/authController.js';
import { listFriends } from '../controllers/friendRequestsController.js';

const router = Router();

// GET /api/friends
router.get('/', requireSignin, listFriends);

export default router;