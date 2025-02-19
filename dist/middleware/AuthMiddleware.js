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
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        req.authToken = token;
        // Verificar token con Supabase
        const { data: authData, error: authError } = yield SupabaseClient_1.supabaseAdmin.auth.getUser(token);
        if (authError || !authData.user) {
            res.status(401).json({ message: 'Usuario no autenticado o token inválido' });
            return;
        }
        // Obtener el ID del usuario autenticado
        const userId = authData.user.id;
        // Buscar el rol en la tabla `public.users`
        const { data, error } = yield SupabaseClient_1.supabaseAdmin
            .from('users')
            .select('*, roles:roles!users_role_id_fkey(id, name)') // Usamos el alias correcto
            .eq('uuid_authSupa', userId)
            .single();
        if (error) {
            throw new Error("No se encontraron roles para este usuario.");
        }
        // Mapear los datos a la interfaz `APPUser`
        const user = {
            id: data.id,
            uuid_authSupa: data.uuid_authSupa,
            document: data.document,
            email: data.email,
            name: data.name,
            lastname: data.lastname,
            role_id: data.role_id,
            phone: data.phone,
            mobile: data.mobile,
            address: data.address,
            created_at: data.created_at,
            updated_at: data.updated_at,
            roles: data.roles ? { id: data.roles.id, name: data.roles.name } : null,
        };
        // Guardar el usuario autenticado en `req.user`
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(401).json({ message: error });
    }
});
exports.authenticateJWT = authenticateJWT;
//# sourceMappingURL=AuthMiddleware.js.map