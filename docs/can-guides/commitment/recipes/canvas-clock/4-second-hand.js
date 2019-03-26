import { Component } from "//unpkg.com/can@5/core.mjs";

// 60 = 2π
const base60ToRadians = (base60Number) =>
  2 * Math.PI * base60Number / 60;

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
      
      this.listenTo("time", (ev, time) => {
        this.canvas.clearRect(0, 0, diameter, diameter);

        // draw circle
        this.canvas.lineWidth = 4.0;
        this.canvas.strokeStyle = "#567";
        this.canvas.beginPath();
        this.canvas.arc(center, center, radius, 0, Math.PI * 2, true);
        this.canvas.closePath();
        this.canvas.stroke();

        Object.assign(this.canvas, {
          lineWidth:  2.0,
          strokeStyle: "#FF0000",
          lineCap: "round"
        });
        // draw second hand
        const seconds = time.getSeconds() + this.time.getMilliseconds() / 1000;
        const size = radius * 0.85;
        const x = center + size * Math.sin(base60ToRadians(seconds));
        const y = center + size * -1 * Math.cos(base60ToRadians(seconds));
        this.canvas.beginPath();
        this.canvas.moveTo(center, center);
        this.canvas.lineTo(x, y);
        this.canvas.closePath();
        this.canvas.stroke();
      });
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
