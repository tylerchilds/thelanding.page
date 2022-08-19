/** @jsx h */
import { h} from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import {Replicache} from 'replicache';
import {useSubscribe} from 'replicache-react';
import {nanoid} from 'nanoid';

export default function HelloReplicache() {
  const [rep, setRep] = useState(null);

  useEffect(async () => {
    const rep = new Replicache({
      name: 'chat-user-id',
      licenseKey: 'l71f3ed2e4ba84173a5b01f9114e1830f',
      pushURL: '/api/replicache-push',
      pullURL: '/api/replicache-pull',
    });
    listen(rep);
    setRep(rep);
  }, []);

  return rep && <Chat rep={rep} />;
}

function Chat({rep}) {
  const messages = useSubscribe(
    rep,
    async tx => {
      // Note: Replicache also supports secondary indexes, which can be used
      // with scan. See:
      // https://js.replicachedev/classes/replicache.html#createindex
      const list = await tx.scan({prefix: 'message/'}).entries().toArray();
      list.sort(([, {order: a}], [, {order: b}]) => a - b);
      return list;
    },
    [],
  );

  const usernameRef = useRef();
  const contentRef = useRef();

  const onSubmit = e => {
    e.preventDefault();
    // TODO: Create message
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={onSubmit}>
        <input ref={usernameRef} style={styles.username} required />
        says:
        <input ref={contentRef} style={styles.content} required />
        <input type="submit" />
      </form>
      <MessageList messages={messages} />
    </div>
  );
}

function MessageList({messages}) {
  return messages.map(([k, v]) => {
    return (
      <div key={k}>
        <b>{v.from}: </b>
        {v.content}
      </div>
    );
  });
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    display: 'flex',
    flexDirection: 'row',
    flex: 0,
    marginBottom: '1em',
  },
  username: {
    flex: 0,
    marginRight: '1em',
  },
  content: {
    flex: 1,
    maxWidth: '30em',
    margin: '0 1em',
  },
};

function listen(rep) {
  // TODO: Listen for changes on server
}
