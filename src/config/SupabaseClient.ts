import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey  = process.env.SUPABASE_ANON_KEY as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabaseAdmin  = createClient(
    supabaseUrl,
    supabaseServiceRoleKey 
);

const supabaseAnon   = createClient(
  supabaseUrl,
  supabaseAnonKey 
);

export { supabaseAnon, supabaseAdmin };