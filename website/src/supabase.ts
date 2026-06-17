import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kcdaeiiiqdwqyxsiblqt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_f91Qn6RC_z_-75KhKSEnQw_9ATp2IBp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
