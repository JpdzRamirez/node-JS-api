"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const HandleValidationErrors_1 = require("../middleware/HandleValidationErrors");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const UserValidator_1 = require("../validators/UserValidator");
const router = (0, express_1.Router)();
router.post('/register', UserValidator_1.validateCreateUser, HandleValidationErrors_1.handleValidationErrors, AuthController_1.AuthController.register.bind(AuthController_1.AuthController));
router.post('/login', UserValidator_1.validateLoginUser, HandleValidationErrors_1.handleValidationErrors, AuthController_1.AuthController.login.bind(AuthController_1.AuthController));
router.post('/logout', UserValidator_1.validateLoginUser, AuthMiddleware_1.authenticateJWT, HandleValidationErrors_1.handleValidationErrors, AuthController_1.AuthController.logout.bind(AuthController_1.AuthController));
exports.default = router;
//# sourceMappingURL=AuthRouters.js.map