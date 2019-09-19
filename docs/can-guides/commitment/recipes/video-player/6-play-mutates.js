import { fromAttribute, StacheElement } from "//unpkg.com/can@pre/core.mjs";

class VideoPlayer extends StacheElement {
	static view = `
		<video
			on:play="this.play()"
			on:pause="this.pause()"
			on:timeupdate="this.updateTimes(scope.element)"
			on:loadedmetadata="this.updateTimes(scope.element)"
		>
			<source src="{{ this.src }}" >
		</video>
		<div>
			<button on:click="this.togglePlay()">
				{{# if(this.isPlaying) }} Pause {{ else }} Play {{/ if }}
			</button>
			<input type="range" value="0" max="1" step="any" value:bind="this.percentComplete">
			<span>{{ this.formatTime(this.currentTime) }}</span> /
			<span>{{ this.formatTime(this.duration) }} </span>
		</div>
	`;

	static props = {
		currentTime: Number,
		duration: Number,
		isPlaying: Boolean,
		src: {
			bind: fromAttribute,
			type: String
		},

		get percentComplete() {
			return this.currentTime / this.duration;
		},

		set percentComplete(newVal) {
			this.currentTime = newVal * this.duration;
		}
	};

	connected() {
		this.listenTo("currentTime", ({ value }) => {
			const videoElement = this.querySelector("video");
			if (value !== videoElement.currentTime) {
				videoElement.currentTime = value;
			}
		});
		this.listenTo("isPlaying", ({ value }) => {
			if (value) {
				this.querySelector("video").play();
			} else {
				this.querySelector("video").pause();
			}
		});
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
		this.isPlaying = true;
	}

	pause() {
		this.isPlaying = false;
	}

	togglePlay() {
		this.isPlaying = !this.isPlaying;
	}

	updateTimes(videoElement) {
		this.currentTime = videoElement.currentTime || 0;
		this.duration = videoElement.duration;
	}
}

customElements.define("video-player", VideoPlayer);
