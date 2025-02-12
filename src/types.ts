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

export {LoginData, RegisterData };