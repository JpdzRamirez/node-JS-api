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
class UserController {
    /**
     * Obtener el perfil del usuario autenticado
     */
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    res.status(401).json({ message: 'No autorizado' });
                    return;
                }
                const { data, error } = yield SupabaseClient_1.default
                    .from('users')
                    .select('id, email, role')
                    .eq('id', req.user.id)
                    .single();
                if (error)
                    throw new Error(error.message);
                res.json({ user: data });
            }
            catch (err) {
                res.status(500).json({ error: err.message });
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