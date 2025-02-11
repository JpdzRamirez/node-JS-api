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
    static register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userController.createUser(data);
            }
            catch (error) {
                throw error;
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
                const userTable = yield this.userRepository.getUserById(user.id); // Usar user.id
                if (!userTable) {
                    throw new Error("Error al obtener información del usuario");
                }
                // Devolver el token y la información del usuario
                return {
                    token,
                    user: {
                        id: user.id,
                        id_authToken: user.id, // Usar user.id como id_authToken
                        document: userTable.document,
                        email: user.email || "",
                        name: userTable.name,
                        lastname: userTable.lastname,
                        role_id: userTable.role_id,
                        phone: userTable.phone,
                        mobile: userTable.mobile,
                        created_at: userTable.created_at,
                        updated_at: userTable.updated_at,
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