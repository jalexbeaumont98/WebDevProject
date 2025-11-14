// server/routes/authRoutes.js
import { Router } from 'express';
import { signup, signin, signout } from '../controllers/authController.js';

const router = Router();

// all mounted under `/api/auth` in server.js/express.js
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/signout', signout);

export default router;