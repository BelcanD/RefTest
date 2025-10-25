import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_ANON_KEY');
}

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

