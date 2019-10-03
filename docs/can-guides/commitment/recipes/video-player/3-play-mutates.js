import { StacheElement } from "//unpkg.com/can@5/core.mjs";

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
			<button on:click="this.togglePlay()">
				{{# if(this.playing) }} Pause {{ else }} Play {{/ if }}
			</button>
		</div>
	`;

	static props = {
		src: String,
		playing: Boolean
	};

	connected() {
		this.listenTo("playing", function({ value }) {
			if (value) {
				this.querySelector("video").play();
			} else {
				this.querySelector("video").pause();
			}
		});
	}

	play() {
		this.playing = true;
	}

	pause() {
		this.playing = false;
	}

	togglePlay() {
		this.playing = !this.playing;
	}
}

customElements.define("video-player", VideoPlayer);
