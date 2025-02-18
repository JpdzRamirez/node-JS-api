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
const UserController_1 = require("../controllers/UserController");
const SupabaseClient_1 = require("../config/SupabaseClient");
class AuthService {
    static userBuilder(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userController.createUser(data);
                if (!user) {
                    throw new Error("No se pudo crear el usuario");
                }
                return user;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    static logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 🔍 Buscar las sesiones activas del usuario en `auth.sessions`      
                const { error } = yield SupabaseClient_1.supabaseAdmin.auth.admin.signOut(userId);
                if (error) {
                    throw new Error(error.message);
                }
                return true;
            }
            catch (error) {
                console.error("❌ Error interno en logout:", error);
                return false;
            }
        });
    }
    static login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Iniciar sesión con Supabase
                const { data: authData, error } = yield SupabaseClient_1.supabaseAdmin.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                });
                if (error) {
                    throw new Error(error.message);
                }
                // Obtener el token de sesión
                const token = (_a = authData.session) === null || _a === void 0 ? void 0 : _a.access_token;
                if (!token) {
                    throw new Error("Error de Integracion: Error generar token");
                }
                // Cerrar sesiónes anteriores a la actual del usuario autenticado
                yield SupabaseClient_1.supabaseAdmin.auth.signOut({ scope: "others" });
                // 🔹 Buscar al usuario en `users` por email para traer datos complementarios
                const complementaryDataUser = yield this.userController.getUserByEmail(authData.user.email);
                if (!complementaryDataUser) {
                    throw new Error("Usuario no encontrado en users.auth");
                }
                // Devolver el token y la información del usuario
                return {
                    token,
                    user: {
                        id: complementaryDataUser.id,
                        uuid_authSupa: authData.user.id,
                        document: complementaryDataUser.document,
                        email: authData.user.email || "",
                        name: complementaryDataUser.name,
                        lastname: complementaryDataUser.lastname,
                        role_id: complementaryDataUser.role_id,
                        phone: complementaryDataUser.phone,
                        mobile: complementaryDataUser.mobile,
                        created_at: complementaryDataUser.created_at,
                        updated_at: complementaryDataUser.updated_at,
                        roles: complementaryDataUser.roles
                            ? {
                                // Verifica si la relación existe antes de acceder
                                id: complementaryDataUser.roles.id,
                                name: complementaryDataUser.roles.name,
                            }
                            : null,
                    },
                };
            }
            catch (error) {
                throw error;
            }
        });
    }
}
/*
    Global repositorys query
*/
AuthService.userController = new UserController_1.UserController();
exports.default = AuthService;
//# sourceMappingURL=AuthService.js.map