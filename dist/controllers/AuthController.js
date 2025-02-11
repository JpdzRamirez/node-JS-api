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
exports.AuthController = void 0;
const AuthService_1 = __importDefault(require("../services/AuthService"));
class AuthController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allowedFields = [
                    "name", "lastname", "document", "phone", "mobile",
                    "email", "password", "role_id"
                ];
                // 🔹 Filtramos solo los campos permitidos
                const filteredBody = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
                const user = yield AuthService_1.default.register(filteredBody);
                res.status(201).json({ message: "Usuario registrado con éxito", user });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allowedFields = ["email", "password"];
                function isLoginData(obj) {
                    return (typeof obj.email === "string" && typeof obj.password === "string");
                }
                const filteredBody = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
                if (!isLoginData(filteredBody)) {
                    throw new Error("Error en datos suministrados");
                }
                const result = yield AuthService_1.default.login(filteredBody);
                if (!result) {
                    res.status(401).json({ error: "Credenciales inválidas" });
                    return;
                }
                const { token, user } = result;
                res.json({ message: "Login exitoso", token, user });
            }
            catch (error) {
                res.status(401).json({ error: error.message });
            }
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map