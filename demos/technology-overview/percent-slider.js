import { Component } from "can";

function width(el) {
    const cs = window.getComputedStyle(el,null)
    return el.clientWidth - parseFloat( cs.getPropertyValue("padding-left") )
        - parseFloat( cs.getPropertyValue("padding-left") );
}

const PercentSlider = Component.extend({
    tag: "percent-slider",
    view: `
        <div class="slider"
        style="left: {{ left }}px"
        on:mousedown="startDrag(scope.event.clientX)"/>
    `,
    ViewModel: {
        start: {type: "number", default: 0},
        end: {type: "number", default: 100},
        currentValue: {
            default: function(){
                return this.value || 0;
            }
        },
        width: {type: "number", default: 0},
        get left(){
            const left = this.currentValue / this.end * this.width;
            return Math.min( Math.max(0, left), this.width) || 0;
        },
        connectedCallback(el) {
            // derive the width
            this.width = width(el) - el.firstElementChild.offsetWidth;
            this.listenTo(window,"resize", () => {
                this.width = width(el) - el.firstElementChild.offsetWidth;
            });

            // Produce dragmove and dragup events on the view-model
            this.listenTo("startClientX", () => {
                const startLeft = this.left;
                this.listenTo(document,"mousemove", (event)=>{
                    this.dispatch("dragmove", [event.clientX - this.startClientX + startLeft]);
                });
                this.listenTo(document,"mouseup", (event)=>{
                    this.dispatch("dragup", [event.clientX - this.startClientX + startLeft]);
                    this.stopListening(document);
                });
            });
            // Update the slider position when currentValue changes
            this.listenTo("dragmove", (ev, left) => {
                const value = (left / this.width) * (this.end - this.start);
                this.currentValue = Math.max( 0, Math.min(this.end, value));
            },"notify");

            // If the value is set, update the current value
            this.listenTo("value", (ev, newValue) => {
                this.currentValue = newValue;
            }, "notify");

            // Update the value on a dragmove
            this.listenTo("dragup", (ev, left) => {
                const value = (left / this.width) * (this.end - this.start);
                this.value = Math.max( 0, Math.min(this.end, value));
            },"notify");

            return this.stopListening.bind(this);
        },
        startClientX: "any",
        startDrag(clientX) {
            this.startClientX = clientX;
        }
    }
});

export default PercentSlider;
