import { supabase } from '../../db.js';

export const handler =  (_req, _ctx) => {
  return new Response(JSON.stringify({
    ...supabase
  }), {
		headers: { "Content-Type": "application/json" },
	});
};
