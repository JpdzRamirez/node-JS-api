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
const UserRepository_1 = require("../repository/UserRepository");
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
                const { data: sessions, error: sessionError } = yield SupabaseClient_1.supabaseAdmin
                    .from('auth.sessions')
                    .select('id')
                    .eq('user_id', userId);
                if (sessionError) {
                    console.error("❌ Error al obtener sesiones:", sessionError);
                    return false;
                }
                if (!sessions || sessions.length === 0) {
                    console.warn("⚠️ No hay sesiones activas para cerrar.");
                    return true;
                }
                // ❌ Eliminar todas las sesiones activas del usuario
                const { error: deleteError } = yield SupabaseClient_1.supabaseAdmin
                    .from('auth.sessions')
                    .delete()
                    .eq('user_id', userId);
                if (deleteError) {
                    console.error("❌ Error al cerrar sesión en Supabase:", deleteError);
                    return false;
                }
                return true;
            }
            catch (error) {
                console.error("❌ Error interno en logout:", error);
                return false;
            }
        });
    }
    ;
    static login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // 🔹 Buscar al usuario en `auth.users` por email
                const { data: userAuth, error: userAuthError } = yield SupabaseClient_1.supabaseAdmin
                    .from("auth.users")
                    .select("id, email")
                    .eq("email", data.email)
                    .single();
                if (userAuthError || !userAuth) {
                    throw new Error("Usuario no encontrado en Supabase Auth");
                }
                const userId = userAuth.id;
                // Eliminar todas las sesiones previas del usuario
                yield SupabaseClient_1.supabaseAdmin.from('auth.sessions').delete().eq('user_id', userId);
                // Iniciar sesión con Supabase
                const { data: authData, error } = yield SupabaseClient_1.supabaseAdmin.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                });
                if (error) {
                    throw new Error(error.message);
                }
                // Obtener el usuario autenticado
                const user = authData.user;
                if (!user) {
                    throw new Error("Usuario no encontrado");
                }
                // Obtener el token de sesión
                const token = (_a = authData.session) === null || _a === void 0 ? void 0 : _a.access_token;
                if (!token) {
                    throw new Error("No se pudo generar el token");
                }
                // Obtener información adicional del usuario desde la tabla `users`
                const userTable = yield this.userRepository
                    .findByEmail(user.email)
                    .then((user) => {
                    console.log("🟢 Usuario obtenido:", user);
                    return user;
                })
                    .catch((error) => {
                    console.error("❌ Error en findByEmail:", error);
                    return null;
                });
                if (!userTable) {
                    throw new Error("Error al obtener información del usuario");
                }
                // Devolver el token y la información del usuario
                return {
                    token,
                    user: {
                        id: userTable.id,
                        uuid_authSupa: user.id,
                        document: userTable.document,
                        email: user.email || "",
                        name: userTable.name,
                        lastname: userTable.lastname,
                        role_id: userTable.role_id,
                        phone: userTable.phone,
                        mobile: userTable.mobile,
                        created_at: userTable.created_at,
                        updated_at: userTable.updated_at,
                        roles: userTable.roles
                            ? {
                                // Verifica si la relación existe antes de acceder
                                id: userTable.roles.id,
                                name: userTable.roles.name,
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
AuthService.userRepository = new UserRepository_1.UserRepository();
exports.default = AuthService;
//# sourceMappingURL=AuthService.js.map