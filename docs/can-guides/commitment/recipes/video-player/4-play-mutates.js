import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class VideoPlayer extends StacheElement {
	static view = `
		<video 
			controls
			on:play="this.play()"
			on:pause="this.pause()"
			on:timeupdate="this.updateTimes(scope.element)"
			on:loadedmetadata="this.updateTimes(scope.element)"
		>
			<source src="{{ this.src }}">
		</video>
		<div>
			<button on:click="this.togglePlay()">
				{{# if(this.playing) }} Pause {{ else }} Play {{/ if }}
			</button>
			<span>{{ this.formatTime(this.currentTime) }}</span> /
			<span>{{ this.formatTime(this.duration) }} </span>
		</div>
	`;

	static props = {
		src: String,
		playing: Boolean,
		duration: Number,
		currentTime: Number
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

	updateTimes(videoElement) {
		this.currentTime = videoElement.currentTime || 0;
		this.duration = videoElement.duration;
	}

	formatTime(time) {
		if (time === null || time === undefined) {
			return "--";
		}
		const minutes = Math.floor(time / 60);
		let seconds = Math.floor(time - minutes * 60);
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		return minutes + ":" + seconds;
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
