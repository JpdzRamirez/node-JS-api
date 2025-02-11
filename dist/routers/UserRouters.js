"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const AuthController_1 = require("../controllers/AuthController");
const HandleValidationErrors_1 = require("../middleware/HandleValidationErrors");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
/*
    Validators
*/
const UserValidator_1 = require("../validators/UserValidator");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
// Middleware común para todas las rutas de usuarios
router.use('/users', AuthMiddleware_1.authenticateJWT, HandleValidationErrors_1.handleValidationErrors);
/*
  Agrupación de rutas admin
*/
// Subgrupo para rutas de administrador (admin)
router.use('/users/admin', (0, RoleMiddleware_1.roleMiddleware)(['admin']));
router.get('/users/admin', userController.getAllUsers.bind(userController));
router.post('/users/admin', UserValidator_1.validateCreateUser, AuthController_1.AuthController.register.bind(AuthController_1.AuthController));
router.delete('/users/admin/:id', UserValidator_1.validateDeleteUser, userController.deleteUser.bind(userController));
//****************************************************************** */
/*
  Agrupación rutas user
*/
// Subgrupo para rutas de usuario (user)
router.use('/users/profile', (0, RoleMiddleware_1.roleMiddleware)(['user']));
router.get('/users/profile/:id', UserValidator_1.validateGetUser, userController.getProfile.bind(userController));
//****************************************************************** */
/*
  Agrupación rutas compartidas
*/
// Rutas compartidas (admin y user)
router.put('/users/:id', UserValidator_1.validateUpdateUser, (0, RoleMiddleware_1.roleMiddleware)(['admin', 'user']), userController.updateUser.bind(userController));
//****************************************************************** */
exports.default = router;
//# sourceMappingURL=UserRouters.js.map