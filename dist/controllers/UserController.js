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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const SupabaseClient_1 = __importDefault(require("../config/SupabaseClient"));
const UserRepository_1 = require("../repository/UserRepository");
class UserController {
    constructor() {
        /*
          Global repositorys query
        */
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
                    res.status(404).json({ message: 'Usuario no encontrado' });
                    return;
                }
                res.json(user);
            }
            catch (error) {
                console.error('Error en getProfile:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    /**
   * Obtener el perfil del usuario autenticado por el email
   */
    getUserByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.params;
                const user = yield this.userRepository.findByEmail(email);
                if (!user) {
                    res.status(404).json({ message: 'Usuario no encontrado' });
                    return;
                }
                res.json(user);
            }
            catch (error) {
                console.error('Error en getProfile:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    /**
     * Obtener todos los usuarios (solo para administradores)
     */
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || req.user.role !== 'admin') {
                    res.status(403).json({ message: 'No tienes permisos' });
                    return;
                }
                const { data, error } = yield SupabaseClient_1.default.from('users').select('id, email, role');
                if (error)
                    throw new Error(error.message);
                res.json({ users: data });
            }
            catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
    }
    /**
     * Crear un nuevo usuario (solo administradores)
     */
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || req.user.role !== 'admin') {
                    res.status(403).json({ message: 'No tienes permisos para crear usuarios' });
                    return;
                }
                const { email, password, role } = req.body;
                const response = yield this.userRepository.findByEmail(email);
                if (!email || !password || !role) {
                    res.status(400).json({ message: 'Todos los campos son obligatorios' });
                    return;
                }
                const { data, error } = yield SupabaseClient_1.default.from('users').insert([{ email, password, role }]);
                if (error)
                    throw new Error(error.message);
                res.status(201).json({ message: 'Usuario creado', user: data });
            }
            catch (err) {
                res.status(500).json({ error: err.message });
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
                const { email, role } = req.body;
                if (!req.user || (req.user.role !== 'admin' && req.user.id !== id)) {
                    res.status(403).json({ message: 'No tienes permisos para actualizar este usuario' });
                    return;
                }
                const { data, error } = yield SupabaseClient_1.default
                    .from('users')
                    .update({ email, role })
                    .eq('id', id);
                if (error)
                    throw new Error(error.message);
                res.json({ message: 'Usuario actualizado', user: data });
            }
            catch (err) {
                res.status(500).json({ error: err.message });
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
                if (!req.user || req.user.role !== 'admin') {
                    res.status(403).json({ message: 'No tienes permisos para eliminar usuarios' });
                    return;
                }
                const { data, error } = yield SupabaseClient_1.default.from('users').delete().eq('id', id);
                if (error)
                    throw new Error(error.message);
                res.json({ message: 'Usuario eliminado', user: data });
            }
            catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map