import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as usersRoutes from './routes/users.routes.js';

const router = Router();

router.post('/login', simpleRateLimit(10, 15 * 60 * 1000), usersRoutes.login);
router.post('/', simpleRateLimit(10, 60 * 60 * 1000), usersRoutes.createUser);
router.get('/', simpleRateLimit(100, 15 * 60 * 1000), usersRoutes.getAllUsers);
router.get('/count', simpleRateLimit(100, 15 * 60 * 1000), usersRoutes.getUsersCount);
router.get('/:id', simpleRateLimit(100, 15 * 60 * 1000), usersRoutes.getUserById);
router.put('/:id', simpleRateLimit(50, 15 * 60 * 1000), usersRoutes.updateUser);
router.put('/:id/password', simpleRateLimit(10, 60 * 60 * 1000), usersRoutes.updateUserPassword);
router.delete('/:id', simpleRateLimit(10, 60 * 60 * 1000), usersRoutes.deactivateUser);

export default router;
