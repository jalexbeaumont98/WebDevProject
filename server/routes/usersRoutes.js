import { Router } from 'express';
import {
  getAll,
  getById,
  createOne,
  updateById,
  removeById,
  removeAll,
  // auth-aware helpers:
  create as registerUser,   // optional “signup” endpoint
  userByID,
  read
} from '../controllers/usersController.js';
import { requireSignin, hasAuthorization } from '../controllers/authController.js';

const router = Router();

/**
 * CRUD endpoints (assignment spec)
 * Mount path in server.js: app.use('/api/users', usersRoutes)
 */
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createOne);
router.put('/:id', updateById);
router.delete('/:id', removeById);
router.delete('/', removeAll);

/**
 * Auth-friendly endpoints
 * - POST /api/users/signup  → hashed-password creation (registerUser)
 * - GET  /api/users/profile/:userId → protected read of own profile
 */
router.post('/signup', registerUser);
router.get('/profile/:userId', requireSignin, hasAuthorization, read);

/** Bind :userId for the profile route */
router.param('userId', userByID);

export default router;