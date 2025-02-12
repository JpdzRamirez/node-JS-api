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
exports.UserController = void 0;
const UserRepository_1 = require("../repository/UserRepository");
class UserController {
    constructor() {
        /*
          Global repositorys query
        */
        this.userRepository = new UserRepository_1.UserRepository();
        this.userRepository = new UserRepository_1.UserRepository();
    }
    /**
     * Obtener el perfil del usuario autenticado por el id
    */
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield this.userRepository.getUserById(id);
                if (!user) {
                    res.status(404).json({ message: "Usuario no encontrado" });
                    return;
                }
                res.status(200).json(user);
            }
            catch (error) {
                res.status(500).json({ message: "Error interno del servidor" });
            }
        });
    }
    /**
     * Obtener el perfil del usuario autenticado por el email
     */
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findByEmail(email);
                if (!user) {
                    throw new Error("El email no se encuentra registrado");
                }
                return user;
            }
            catch (error) {
                return null;
            }
        });
    }
    /**
     * Obtener todos los usuarios (solo para administradores)
     */
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener todos los usuarios
                const users = yield this.userRepository.getAllUsers();
                // Respuesta exitosa
                res.status(201).json(users);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    /**
     * Crear un nuevo usuario (solo administradores)
     */
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verificar si el email ya está registrado
                const existingUser = yield this.userRepository.findByEmail(user.email);
                if (existingUser) {
                    throw new Error("El email ya está registrado");
                }
                // Crear el usuario en la base de datos
                return yield this.userRepository.createUser(user);
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Actualizar un usuario (admin y el propio usuario)
    */
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Definir los campos permitidos para evitar actualizaciones no deseadas
                const allowedFields = ["email", "document", "role", "password", "address", "mobile", "phone"];
                const filteredBody = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
                // Actualizar el usuario con los valores filtrados
                const userUpdated = yield this.userRepository.updateUser(id, filteredBody);
                if (!userUpdated) {
                    res.status(500).json({ message: "Error al actualizar el usuario" });
                    return;
                }
                // Respuesta exitosa
                res
                    .status(201)
                    .json({ message: "Usuario actualizado", user: userUpdated });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    /**
     * Eliminar un usuario (solo administradores)
    */
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Actualizar el usuario con los valores filtrados
                const userDeleted = yield this.userRepository.deleteUser(id);
                if (!userDeleted) {
                    res.status(500).json({ message: "Error al crear el usuario" });
                    return;
                }
                res
                    .status(201)
                    .json({ message: "Usuario eliminado", check: userDeleted });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map