/** @jsx h */
import { h } from "preact";

export default function HelloReplicache() {
  return (
		<div>
			<hello-chat>
				Loading...
			</hello-chat>
			<script type="module" src="/scripts/tags/hello-chat.js"></script>
		</div>
  )
}
