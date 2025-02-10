import UserModel, { APPUser } from '../models/UserModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

class AuthService {
  static async register(email: string, password: string): Promise<APPUser> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await UserModel.createUser(email, hashedPassword);
  }

  static async login(email: string, password: string): Promise<{ token: string; user: APPUser }> {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');

    const validPassword = await bcrypt.compare(password, user.password!);
    if (!validPassword) throw new Error('Contraseña incorrecta');

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    return { token, user };
  }
}

export default AuthService;
