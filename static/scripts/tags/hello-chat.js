/** @jsx h */
import tag from "https://deno.land/x/tag@v0.2.0/mod.js";

import {Replicache} from 'https://esm.sh/replicache@11.2.0';
import {useSubscribe} from '../hooks/useSubscribe.js';
import {nanoid} from 'https://esm.sh/nanoid@4.0.0';

const $ = tag('hello-chat', {
	replicache: {},
	messages: []
});

const replicache = new Replicache({
  name: 'chat-user-id',
  licenseKey: 'l71f3ed2e4ba84173a5b01f9114e1830f',
  pushURL: '/api/replicache-push',
  pullURL: '/api/replicache-pull',
	mutators: {
    async createMessage(tx, {id, from, content, order}) {
      await tx.put(`message/${id}`, {
        from,
        content,
        order,
      });
    },
  },
})

$.write({ replicache })
listen(replicache)

$.on('submit', 'form', (e) => {
  e.preventDefault();
	const { username, content } = e.target
	const { replicache, messages } = $.read()

	const last = messages.length && messages[messages.length - 1][1];
  const order = (last?.order ?? 0) + 1;

  replicache.mutate.createMessage({
    id: nanoid(),
    from: username.value,
    content: content.value,
    order,
  });
  content.value = '';
})

$.render(() => {
  return `
    <form>
      <input name="username" required />
      says:
      <input name="content" required />
      <input type="submit" />
    </form>
    ${renderMessages($)}
  `
})

function renderMessages($) {
	const { messages } = $.read()

  useSubscribe(
    $,
    async tx => {
      // Note: Replicache also supports secondary indexes, which can be used
      // with scan. See:
      // https://js.replicachedev/classes/replicache.html#createindex
      const list = await tx.scan({prefix: 'message/'}).entries().toArray();
      list.sort(([, {order: a}], [, {order: b}]) => a - b);
      $.write({ messages: list });
    },
    [],
  );

  return messages.map(([_k, v]) => {
    return `
      <div>
        <b>${v.from}: </b>
        ${v.content}
      </div>
    `;
  });
}

function listen(replicache) {
	const ws = new WebSocket(`ws://${window.location.host}/poke`);

	ws.onopen = () => {
		console.log({ ws })
		ws.send('whatuppp')
	}
	ws.onmessage = () => {
		replicache.pull()
	}
}
