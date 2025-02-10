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
const SupabaseClient_1 = __importDefault(require("../config/SupabaseClient"));
class UserModel {
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield SupabaseClient_1.default
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            if (error)
                return null;
            return data;
        });
    }
    static createUser(email_1, password_1) {
        return __awaiter(this, arguments, void 0, function* (email, password, role = 'user') {
            var _a;
            const { data, error } = yield SupabaseClient_1.default.auth.signUp({ email, password });
            if (error)
                throw new Error(error.message);
            if (!((_a = data.user) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new Error("Error al crear el usuario: ID no generado por Supabase");
            }
            yield SupabaseClient_1.default.from('users').insert([{ id: data.user.id, email, role }]);
            return { id: data.user.id, email, role };
        });
    }
}
exports.default = UserModel;
//# sourceMappingURL=UserModel.js.map