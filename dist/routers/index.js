"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const AuthRouters_1 = __importDefault(require("./AuthRouters"));
const UserRouters_1 = __importDefault(require("./UserRouters"));
exports.router = (0, express_1.Router)();
// Ruta pública
exports.router.get('/public', (req, res) => {
    console.log('📌 Debugging aquí... xd');
    res.json({ message: 'Esta es una ruta pública' });
});
exports.router.use('/auth', AuthRouters_1.default);
exports.router.use('/users', UserRouters_1.default);
//# sourceMappingURL=index.js.map