import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Filled in once the Supabase project exists.
// The anon key is safe to ship in the app — access is controlled by
// Row Level Security on the database, not by hiding this key.
const SUPABASE_URL = 'https://kcdaeiiiqdwqyxsiblqt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_f91Qn6RC_z_-75KhKSEnQw_9ATp2IBp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export const isConfigured = !SUPABASE_URL.includes('YOUR-PROJECT');
