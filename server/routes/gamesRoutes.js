import { Router } from 'express';
import { requireSignin } from '../controllers/authController.js';
import { listMine, createOne, getById, updateById, removeById } from '../controllers/gamesController.js';

const router = Router();
router.get('/', requireSignin, listMine);
router.post('/', requireSignin, createOne);
router.get('/:id', requireSignin, getById);
router.put('/:id', requireSignin, updateById);
router.delete('/:id', requireSignin, removeById);

export default router;