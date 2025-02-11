export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
    name: string;
    lastname: string;
    document: string;
    phone?: string;
    mobile: string;
    email: string;
    password: string;
    role_id?:number;
  }
  