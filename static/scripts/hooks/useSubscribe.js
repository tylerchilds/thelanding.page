import { deepEqual } from 'https://esm.sh/fast-equals@2.0.4'

let lastReplicache = {};

export function useSubscribe(
	$,
  query,
) {
	const { replicache, } = $.read();

	if(!deepEqual(replicache, lastReplicache)) {
		replicache.subscribe(query, {
			onData: () => null
		});

		lastReplicache = replicache;
	}
}
