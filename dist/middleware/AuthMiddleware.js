"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const SupabaseClient_1 = require("../config/SupabaseClient");
const authenticateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        // Verificar token con Supabase
        const { data: authData, error: authError } = yield SupabaseClient_1.supabaseAdmin.auth.getUser(token);
        if (authError || !authData.user) {
            res.status(401).json({ message: 'Usuario no autenticado o token inválido' });
            return;
        }
        // Obtener el ID del usuario autenticado
        const userId = authData.user.id;
        // Buscar el rol en la tabla `public.users`
        const { data: data, error: roleError } = yield SupabaseClient_1.supabaseAdmin
            .from('users')
            .select('id, roles(id)')
            .eq('uuid_authSupa', userId)
            .single();
        if (roleError || !data || !data.roles) {
            res.status(403).json({ message: 'No se pudo obtener el rol del usuario' });
            return;
        }
        if (!data || !data.roles || data.roles.length === 0) {
            throw new Error("No se encontraron roles para este usuario.");
        }
        const roleId = (_a = data.roles) === null || _a === void 0 ? void 0 : _a.id;
        if (!roleId) {
            res.status(403).json({ message: 'El usuario no tiene un rol asignado' });
            return;
        }
        req.user = { id: userId, role_id: roleId };
        next();
    }
    catch (err) {
        console.error('Error en la autenticación:', err);
        res.status(401).json({ message: 'Token inválido' });
    }
});
exports.authenticateJWT = authenticateJWT;
//# sourceMappingURL=AuthMiddleware.js.map