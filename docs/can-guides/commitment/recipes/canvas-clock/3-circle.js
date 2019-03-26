import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "analog-clock",
  view: `<canvas this:to="canvasElement" id="analog" width="255" height="255"></canvas>`,
  ViewModel: {
    // the canvas element
    canvasElement: HTMLCanvasElement,

    // the canvas 2d context
    get canvas() {
      return this.canvasElement.getContext("2d");
    },

    connectedCallback(element) {
      const diameter = 255;
      const radius = diameter/2 - 5;
      const center = diameter/2;
      // draw circle
      this.canvas.lineWidth = 4.0;
      this.canvas.strokeStyle = "#567";
      this.canvas.beginPath();
      this.canvas.arc(center, center, radius, 0, Math.PI * 2, true);
      this.canvas.closePath();
      this.canvas.stroke();
    }
  }
});

Component.extend({
  tag: "digital-clock",
  view: "{{ hh() }}:{{ mm() }}:{{ ss() }}",
  ViewModel: {
    time: Date,
    hh() {
      const hr = this.time.getHours() % 12;
      return hr === 0 ? 12 : hr;
    },
    mm() {
      return this.time.getMinutes().toString().padStart(2, "00");
    },
    ss() {
      return this.time.getSeconds().toString().padStart(2, "00");
    }
  }
});

Component.extend({
  tag: "clock-controls",
  ViewModel: {
    time: {
      value({ resolve }) {
        const intervalID = setInterval(() => {
          resolve( new Date() );
        }, 1000);

        resolve( new Date() );

        return () => clearInterval(intervalID);
      }
    }
  },
  view: `
    <p>{{ time }}</p>
    <digital-clock time:from="time"/>
    <analog-clock time:from="time"/>
  `
});
