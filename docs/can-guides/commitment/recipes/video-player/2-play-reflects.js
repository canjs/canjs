import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class VideoPlayer extends StacheElement {
  static view = `
		<video
			controls
			on:play="this.play()"
			on:pause="this.pause()"
		>
			<source src="{{ this.src }}">
		</video>
		<div>
			<button>
				{{# if(this.playing) }} Pause {{ else }} Play {{/ if }}
			</button>
		</div>
	`;

  static props = {
    src: String,
    playing: Boolean
  };

  play() {
    this.playing = true;
  }

  pause() {
    this.playing = false;
  }
}

customElements.define("video-player", VideoPlayer);
