import { supabase } from '../../db.js';

export const handler =  async (req, _ctx) => {
  const pull = await req.json();

  const t0 = Date.now();

	try {
    const lastMutationID = parseInt(
			(
				(await supabase
					.from('replicache_client')
					.select()
					.eq('id', pull.clientID))[0]
			)?.last_mutation_id ?? '0',
		);
		const { data: changed, error } = await supabase
			.from('message')
			.select()
			.gt('version', pull.cookie ?? 0)

		const cookie = (
			Math.max(changed.map(x => x.version))
		);

		const patch = [];
		if (pull.cookie === null) {
			patch.push({
				op: 'clear',
			});
		}

		patch.push(
			...changed.map(row => ({
				op: 'put',
				key: `message/${row.id}`,
				value: {
					from: row.from,
					content: row.content,
					order: parseInt(row.ord),
				},
			})),
		);

		return new Response(JSON.stringify({
			lastMutationID,
			cookie,
			patch,
		}), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(e.toString());
  } finally {
    console.log('Processed pull in', Date.now() - t0);
  }
};
