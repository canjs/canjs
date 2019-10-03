import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class VideoPlayer extends StacheElement {
	static view = `
		<video controls>
			<source src="{{ this.src }}">
		</video>
	`;

	static props = {
		src: String
	};
}

customElements.define("video-player", VideoPlayer);
