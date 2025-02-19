"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const globalServerMiddleware_1 = require("./middleware/globalServerMiddleware");
const routers_1 = require("./routers");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Registrar rutas antes del middleware de errores
app.use('/api', routers_1.router);
// Middleware global de manejo de errores (debe estar después de las rutas)
app.use(globalServerMiddleware_1.globalServerMiddleware);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map