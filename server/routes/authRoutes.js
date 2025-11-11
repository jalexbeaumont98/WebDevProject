import { Router } from 'express';
import { signin, signout } from '../controllers/authController.js';

const router = Router();
router.post('/signin', signin);
router.get('/signout', signout);
export default router;