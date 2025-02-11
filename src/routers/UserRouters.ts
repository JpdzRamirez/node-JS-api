import { Router,Request, Response } from 'express';

import { UserController } from '../controllers/UserController';
import { AuthController } from '../controllers/AuthController';

import { handleValidationErrors } from '../middleware/HandleValidationErrors';
import { authenticateJWT } from '../middleware/AuthMiddleware';
import { roleMiddleware } from '../middleware/RoleMiddleware';


/*
    Validators
*/
import {
    validateCreateUser,
    validateUpdateUser,
    validateGetUser,
    validateDeleteUser,
  } from "../validators/UserValidator";

const router = Router();
const userController = new UserController();

// Middleware común para todas las rutas de usuarios
router.use('/users', authenticateJWT,handleValidationErrors,);


/*
  Agrupación de rutas admin
*/
// Subgrupo para rutas de administrador (admin)
router.use('/users/admin', roleMiddleware(['admin']));
router.get('/users/admin', userController.getAllUsers.bind(userController));

router.post('/users/admin', validateCreateUser, AuthController.register.bind(AuthController));

router.delete('/users/admin/:id', validateDeleteUser,userController.deleteUser.bind(userController));

//****************************************************************** */

/*
  Agrupación rutas user
*/
// Subgrupo para rutas de usuario (user)
router.use('/users/profile', roleMiddleware(['user']));
router.get('/users/profile/:id', validateGetUser, userController.getProfile.bind(userController));

//****************************************************************** */

/*
  Agrupación rutas compartidas
*/
// Rutas compartidas (admin y user)
router.put('/users/:id', validateUpdateUser, roleMiddleware(['admin', 'user']), userController.updateUser.bind(userController));

//****************************************************************** */

export default router;
