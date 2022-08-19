import { supabase } from '../../db.js';

const channel = new BroadcastChannel("poke");

export const handler = async (req, ctx) => {
  const push = await req.json();
  const t0 = Date.now();
  try {
		let lastMutationID = await getLastMutationID(push.clientID);

		for (const mutation of push.mutations) {
			const t1 = Date.now();

			const expectedMutationID = lastMutationID + 1;

			if (mutation.id < expectedMutationID) {
				continue;
			}
			if (mutation.id > expectedMutationID) {
				console.warn(`Mutation ${mutation.id} is from the future - aborting`);
				break;
			}

			switch (mutation.name) {
				case 'createMessage':
					await createMessage(mutation.args);
					break;
				default:
					throw new Error(`Unknown mutation: ${mutation.name}`);
			}

			lastMutationID = expectedMutationID;
		}

		const { data, error } = await supabase
			.from('replicache_client')
			.upsert([{ id: push.clientID, last_mutation_id: lastMutationID }])

    sendPoke();

		return new Response({});
  } catch (e) {
    console.error(e);
		return new Response(e.toString());
  } finally {
    console.log('Processed push in', Date.now() - t0);
  }
};

async function getLastMutationID(clientID) {
	const { data: rows, error: selectError } = await supabase
		.from('replicache_client')
		.select()
		.eq('id', clientID)

  if (rows[0]) {
    return parseInt(rows[0].last_mutation_id);
  }

	const { data, error } = await supabase
		.from('replicache_client')
		.insert([{ id: clientID, last_mutation_id: 0 }])

  return 0;
}

async function createMessage({id, from, content, order}) {
	const { data, error } = await supabase
		.from('message')
		.insert([{ id, from, content, order }])
}

function sendPoke() {
	channel.postMessage('poke bro lol')
}
