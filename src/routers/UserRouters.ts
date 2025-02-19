import { Router } from 'express';

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
router.use('/', authenticateJWT,handleValidationErrors,);

/*
  Agrupación de rutas admin
*/
// Subgrupo para rutas de administrador (admin)
router.use('/admin', roleMiddleware([1]));
router.get('/admin/get-users', userController.getAllUsers.bind(userController));
router.post('/admin/create-user', validateCreateUser, AuthController.register.bind(AuthController));
router.get('/admin/get-profile/:id', validateGetUser, userController.getProfile.bind(userController));
router.patch('/admin/update-user/:id', validateUpdateUser,userController.updateUser.bind(userController));
router.delete('/admin/delete-user/:id', validateDeleteUser,userController.deleteUser.bind(userController));

//****************************************************************** */

/*
  Agrupación rutas user
*/
// Subgrupo para rutas de usuario (user)
router.use('/profile', roleMiddleware([2]));
router.get('/profile/my-profile/:id', validateGetUser, userController.getProfile.bind(userController));
router.patch('/profile/update-my-profile/:id', validateUpdateUser, roleMiddleware([2]), userController.updateUser.bind(userController));
//****************************************************************** */

/*
  Agrupación rutas compartidas
*/
// Rutas compartidas (admin y user)


//****************************************************************** */

export default router;
