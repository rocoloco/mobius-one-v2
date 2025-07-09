import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side Supabase client for browser
export const createClientComponentClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client with service key
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!
  return createClient(supabaseUrl, serviceKey)
}