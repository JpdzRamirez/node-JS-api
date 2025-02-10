"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
// Rutas protegidas
router.get('/users/profile/:id', AuthMiddleware_1.authenticateJWT, (0, RoleMiddleware_1.roleMiddleware)(['user']), userController.getProfile.bind(userController));
router.get('/users', AuthMiddleware_1.authenticateJWT, (0, RoleMiddleware_1.roleMiddleware)(['admin']), userController.getAllUsers.bind(userController));
router.post('/users', AuthMiddleware_1.authenticateJWT, (0, RoleMiddleware_1.roleMiddleware)(['admin']), userController.createUser.bind(userController));
router.put('/users/:id', AuthMiddleware_1.authenticateJWT, (0, RoleMiddleware_1.roleMiddleware)(['admin', 'user']), userController.updateUser.bind(userController));
router.delete('/users/:id', AuthMiddleware_1.authenticateJWT, (0, RoleMiddleware_1.roleMiddleware)(['admin']), userController.deleteUser.bind(userController));
exports.default = router;
//# sourceMappingURL=UserRouters.js.map