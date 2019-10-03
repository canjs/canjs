import { StacheElement, type, fromAttribute } from "can";

function width(el) {
    const cs = window.getComputedStyle(el, null);

    return el.clientWidth
        - parseFloat( cs.getPropertyValue("padding-left") )
        - parseFloat( cs.getPropertyValue("padding-left") );
}

class PercentSlider extends StacheElement {
		static view = `
				<div class='slider'
					style="left: {{ this.left }}px"
					on:mousedown='startDrag(scope.event.clientX)'/>
		`;

		static props = {
				start: 0,
				end: 100,

				value: { type: type.convert(Number), bind: fromAttribute },

				currentValue: {
					get default() {
						return this.value || 0;
					}
				},

				width: 0,

				get left(){
					const left = this.currentValue / this.end * this.width;
					return Math.min( Math.max(0, left), this.width) || 0;
				},

				startClientX: type.Any
		};

		startDrag(clientX) {
				this.startClientX = clientX;
		}

		connected() {
				// derive the width
				this.width = width(this) - this.firstElementChild.offsetWidth;

				this.listenTo(window,"resize", () => {
						this.width = width(this) - this.firstElementChild.offsetWidth;
				});

				// Produce dragmove and dragup events on the view-model
				this.listenTo("startClientX", () => {
						const startLeft = this.left;

						this.listenTo(document,"mousemove", (event) => {
								this.dispatch("dragmove", [event.clientX - this.startClientX + startLeft]);
						});

						this.listenTo(document,"mouseup", (event) => {
								this.dispatch("dragup", [event.clientX - this.startClientX + startLeft]);
								this.stopListening(document);
						})
				});

				// Update the slider position when currentValue changes
				this.listenTo("dragmove", (ev, left) => {
						this.currentValue = (left / this.width) * (this.end - this.start);
				},"notify");

				// If the value is set, update the current value
				this.listenTo("value", (ev, newValue) => {
						this.currentValue = newValue;
				}, "notify");

				// Update the value on a dragmove
				this.listenTo("dragup", (ev, left) => {
						this.value = (left / this.width) * (this.end - this.start);
				},"notify");

				return this.stopListening.bind(this);
		}
}
customElements.define("percent-slider", PercentSlider);

