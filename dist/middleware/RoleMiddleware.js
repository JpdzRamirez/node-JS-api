"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Acceso no autorizado' });
            return;
        }
        // Validar que el usuario tenga uno de los roles permitidos
        if (!roles.includes(req.user.role_id)) {
            res.status(403).json({ message: 'Permisos no concedidos para esta transacción' });
            return;
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
//# sourceMappingURL=RoleMiddleware.js.map