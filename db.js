import { createClient } from '@supabase/supabase-js'

const url = 'https://aocnekdjwymyggrzcowj.supabase.co'
const secret = Deno.env.get("SUPABASE_SECRET")

const options = {
	autoRefreshToken: true,
	persistSession: true,
	detectSessionInUrl: true,
}

export const supabase = createClient(url, secret, options)
