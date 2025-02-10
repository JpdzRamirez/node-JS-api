import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateJWT } from '../middleware/AuthMiddleware';
import { roleMiddleware } from '../middleware/RoleMiddleware';

const router = Router();
const userController = new UserController();

// Rutas protegidas
router.get('/users', authenticateJWT, roleMiddleware(['admin']), userController.getAllUsers.bind(userController));
router.post('/users', authenticateJWT, roleMiddleware(['admin']), userController.createUser.bind(userController));
router.put('/users/:id', authenticateJWT, roleMiddleware(['admin', 'user']), userController.updateUser.bind(userController));
router.delete('/users/:id', authenticateJWT, roleMiddleware(['admin']), userController.deleteUser.bind(userController));

export default router;
