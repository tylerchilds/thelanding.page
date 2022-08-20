import tag from 'https://thelanding.page/tag/tag.bundle.js'
import * as JoyCon from "https://esm.sh/joy-con-webhid@0.2.0"

const $ = tag('data-gamepads')

// For the initial pairing of the Joy-Cons. They need to be paired one by one.
// Once paired, Joy-Cons will be reconnected to on future page loads.
document.querySelector('.connect').addEventListener('click', async () => {
  // `JoyCon.connectJoyCon()` handles the initial HID pairing.
  // It keeps track of connected Joy-Cons in the `JoyCon.connectedJoyCons` Map.
  await JoyCon.connectJoyCon();
});

// Joy-Cons may sleep until touched and fall asleep again if idle, so attach
// the listener dynamically, but only once.
setInterval(async () => {
  for (const joyCon of JoyCon.connectedJoyCons.values()) {
    if (joyCon.eventListenerAttached) {
      continue;
    }
    // Open the device and enable standard full mode and inertial measurement
    // unit mode, so the Joy-Con activates the gyroscope and accelerometers.
    await joyCon.open();
    await joyCon.enableStandardFullMode();
    await joyCon.enableIMUMode();
    await joyCon.enableVibration();
    // Rumble.
    await joyCon.rumble(600, 600, 0.5);
    // Listen for HID input reports.
    joyCon.addEventListener('hidinput', gamepadLoop);
    joyCon.eventListenerAttached = true;
  }
}, 2000);


function gamepadLoop({ detail }) {
  const mapping = {
    "left": 37,
    "right": 39
  }
	
  const events = []

	Object.keys(detail.buttonStatus)
		.filter(x => detail.buttonStatus[x])
		.map(x => mapping[x])
		.filter(x => !!x)
		.forEach(code => {
			const activate = () => {
				events.push(new KeyboardEvent("keydown", {
					view: window,
					keyCode: code,
					bubbles: true,
					cancelable: true
				}))
			}

			console.log('cool')

			throttle($, {
				key: 'slide',
				activate,
				time: Date.now(),
				fps: 1000 / 4
			})
		})

  events.map(x => document.dispatchEvent(x))
}

function throttle($, flags) {
  const { frames = {}} = $.read()
  const frame = frames[flags.key] || {}

  if((flags.time - flags.fps) > (frame.time || 0)) {
    flags.activate()
    $.write({ time: flags.time }, (state, payload) => {
      return {
        ...state,
        frames: {
          ...frames,
          [flags.key]: {
            time: payload.time
          }
        }
      }
    })
  }
}

/*
const initialState = {}

const $ = tag('data-gamepads', initialState)

$.render((target) => renderGamepads(target, $))

function connecthandler(e) {
  const { index } = e.gamepad
  controllers[index] = e.gamepad;
  requestAnimationFrame(gamepadLoop);
}

function disconnecthandler(e) {
  const { index } = e.gamepad
  delete controllers[index];
}

function renderGamepads(_target, $) {
  const ids = Object.keys(controllers) || []

  return ids
    .map(x => controllers[x])
    .map((gamepad) => `
      <div id="${gamepad.id}">
        <h1>gamepad: ${gamepad.id}</h1>
        <div class="buttons">
          ${renderButtons($, gamepad)}
        </div>
        <div class="axes">
          ${renderAxes($, gamepad)}
        </div>
      </div>
    `).join('')
}

function renderButtons(_$, gamepad) {
  const buttons = [...gamepad.buttons].map((button, i) => {
    let val = button
    let pressed = val == 1.0;

    if (typeof(val) == "object") {
      pressed = val.pressed;
      val = val.value;
    }

    const pct = Math.round(val * 100) + "%";

    return `
      <button
        id="pad:${gamepad.index};button:${i}"
        class="button ${ pressed ? 'pressed' : ''}"
        style="background-size: ${pct} ${pct}"
       >
        ${i}
      </button>
     `
  })
 
  return buttons.join('')
}

function renderAxes(_$, gamepad) {
  const axes = [...gamepad.axes].map((axis, i) => {
    const val = axis + 1

    return `
      <progress
        class="axis"
        id="pad:${gamepad.index};axis:${i}"
        max="2"
        value="${val}"
      >
        ${i}: ${val.toFixed(4)}
      </progress>
     `
  })

  return axes.join('')
}

function gamepadLoop(time) {
  const ids = Object.keys(controllers) || []
  const gamepad1 = controllers[ids[0]]
  const [strumbar] = [...gamepad1.axes].splice(-1)

  const events = []
  const codes = {
    [-1]: 37,
    [1]: 39
  }

  if(codes[strumbar]) {
    const activate = () => {
      events.push(new KeyboardEvent("keydown", {
        view: window,
        keyCode: codes[strumbar],
        bubbles: true,
        cancelable: true
      }))
    }

    throttle($, {
      key: 'strum',
      activate,
      time,
      fps: 1000 / 4
    })
  }

  events.map(x => document.dispatchEvent(x))
  requestAnimationFrame(gamepadLoop);
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

document.body.insertAdjacentHTML("beforeend", `
  <data-gamepads></data-gamepads>
`)

$.style(`
  & .axes {
    padding: 1em;
  }

  & .buttons {
    margin-left: 1em;
  }

  & .axis {
    min-width: 200px;
    margin: 1em;
  }

  & .button {
    display: inline-block;
    width: 1em;
    text-align: center;
    padding: 1em;
    border-radius: 20px;
    border: 1px solid black;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAAxJREFUCNdjYPjPAAACAgEAqiqeJwAAAABJRU5ErkJggg==);
    background-size: 0% 0%;
    background-position: 50% 50%;
    background-repeat: no-repeat;
  }

  & .pressed {
    border: 1px solid red;
  }

  & .touched::after {
    content: "touch";
    display: block;
    position: absolute;
    margin-top: -0.2em;
    margin-left: -0.5em;
    font-size: 0.8em;
    opacity: 0.7;
  }
`)

export default $
*/
