import { Request } from 'express';
import { APPUser } from './models/auth/User.entity';
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  lastname: string;
  document: string;
  phone?: string;
  mobile: string;
  email: string;
  password: string;
  role_id?: number;
}

interface AuthRequest extends Request {
  user?: APPUser;
  authToken?: string;
}

export {LoginData, RegisterData,AuthRequest };