import { StacheElement, type } from "can";

function width(el) {
	const cs = window.getComputedStyle(el, null);
	return (
		el.clientWidth -
		parseFloat(cs.getPropertyValue("padding-left")) -
		parseFloat(cs.getPropertyValue("padding-left"))
	);
}

class PercentSlider extends StacheElement {
	static get view() {
		return `
			<div
				class="this.slider"
				style="left: {{ this.left }}px"
				on:mousedown="this.startDrag(scope.event.clientX)"
			></div>
		`;
	}

	static get props() {
		return {
			start: { type: type.convert(Number), default: 0 },
			end: { type: type.convert(Number), default: 100 },

			currentValue: {
				get default() {
					return this.value || 0;
				}
			},

			width: { type: type.convert(Number), default: 0 },

			get left() {
				const left = this.currentValue / this.end * this.width;
				return Math.min(Math.max(0, left), this.width) || 0;
			},

			startClientX: type.Any
		};
	}

	connected() {
		// derive the width
		this.width = width(this) - this.firstElementChild.offsetWidth;
		this.listenTo(window, "resize", () => {
			this.width = width(this) - this.firstElementChild.offsetWidth;
		});

		// Produce dragmove and dragup events on the view-model
		this.listenTo("startClientX", () => {
			const startLeft = this.left;
			this.listenTo(document, "mousemove", event => {
				this.dispatch("dragmove", [
					event.clientX - this.startClientX + startLeft
				]);
			});
			this.listenTo(document, "mouseup", event => {
				this.dispatch("dragup", [
					event.clientX - this.startClientX + startLeft
				]);
				this.stopListening(document);
			});
		});
		// Update the slider position when currentValue changes
		this.listenTo(
			"dragmove",
			(ev, left) => {
				const value = left / this.width * (this.end - this.start);
				this.currentValue = Math.max(0, Math.min(this.end, value));
			},
			"notify"
		);

		// If the value is set, update the current value
		this.listenTo(
			"value",
			(ev, newValue) => {
				this.currentValue = newValue;
			},
			"notify"
		);

		// Update the value on a dragmove
		this.listenTo(
			"dragup",
			(ev, left) => {
				const value = left / this.width * (this.end - this.start);
				this.value = Math.max(0, Math.min(this.end, value));
			},
			"notify"
		);

		return this.stopListening.bind(this);
	}

	startDrag(clientX) {
		this.startClientX = clientX;
	}
}

customElements.define("percent-slider", PercentSlider);

export default PercentSlider;
