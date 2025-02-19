interface APPUser  {
  id: string;
  uuid_authSupa:string,
  document?:string;
  email?: string;
  password?: string; 
  name:string;
  lastname?:string;
  role_id?:number;
  phone?:string;
  mobile?:string;
  address?:string;
  created_at?: Date; 
  updated_at?: Date; 
  roles?: { 
    id?: number;
    name?: string;    
  }|null;
}

export { APPUser};