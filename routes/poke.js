const sockets = new Set();
const channel = new BroadcastChannel("poke");

channel.onmessage = e => {
	(e.target != channel) && channel.postMessage(e.data)
	console.log('\n\n', e.data)
	sockets.forEach(s => s.send(e.data))
	console.log('\n\n', 'kkkkkkkkk')
}

export const handler = (req, ctx) => {
	try {
		const { socket, response } = Deno.upgradeWebSocket(req)
		sockets.add(socket)
		/*
		This is a sneaky hack: when a message arrives from the WebSocket we pass it
		directly to the BroadcastChannel - then use the e.target != channel check
		above to broadcast it on to every other global instance.
		*/
		socket.onmessage = channel.onmessage
		socket.onerror = (e) => console.log("socket errored:", e);
		// When browser disconnects, remove the socket from the set of sockets
		socket.onclose = _ => sockets.delete(socket)
		return response
	} catch {
		return new Response("request isn't trying to upgrade to websocket.");
	}
}
