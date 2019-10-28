import { can, StacheElement } from "../../../can.js";

window.can = can;

customElements.define("hello-world", class extends StacheElement {
	static get props() {
		return {
			name: String
		};
	}

	static get view() {
		return `<p>Hello <strong id="hw-name">{{name}}</strong>!</p>`;
	}
});

customElements.define("my-app", class extends StacheElement {
	static get view() {
		return `<hello-world name:raw="World"></hello-world>`;
	}
});
