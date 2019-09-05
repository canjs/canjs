import { StacheElement } from "//unpkg.com/can@5/core.mjs";

// 60 = 2π
const base60ToRadians = base60Number => 2 * Math.PI * base60Number / 60;

class AnalogClock extends StacheElement {
  static view = `
    <canvas this:to="canvasElement" id="analog" width="255" height="255"></canvas>
  `;

  static props = {
    // the canvas element
    canvasElement: HTMLCanvasElement,

    // the canvas 2d context
    get canvas() {
      return this.canvasElement.getContext("2d");
    }
  };

  drawNeedle(length, base60Distance, styles, center) {
    Object.assign(this.canvas, styles);
    const x = center + length * Math.sin(base60ToRadians(base60Distance));
    const y = center + length * -1 * Math.cos(base60ToRadians(base60Distance));
    this.canvas.beginPath();
    this.canvas.moveTo(center, center);
    this.canvas.lineTo(x, y);
    this.canvas.closePath();
    this.canvas.stroke();
  }

  connected() {
    const diameter = 255;
    const radius = diameter / 2 - 5;
    const center = diameter / 2;

    this.listenTo("time", (ev, time) => {
      this.canvas.clearRect(0, 0, diameter, diameter);

      // draw circle
      this.canvas.lineWidth = 4.0;
      this.canvas.strokeStyle = "#567";
      this.canvas.beginPath();
      this.canvas.arc(center, center, radius, 0, Math.PI * 2, true);
      this.canvas.closePath();
      this.canvas.stroke();

      // draw second hand
      const seconds = time.getSeconds() + this.time.getMilliseconds() / 1000;
      this.drawNeedle(
        radius * 0.85,
        seconds,
        {
          lineWidth: 2.0,
          strokeStyle: "#FF0000",
          lineCap: "round"
        },
        center
      );

      // draw minute hand
      const minutes = time.getMinutes() + seconds / 60;
      this.drawNeedle(
        radius * 0.65,
        minutes,
        {
          lineWidth: 3.0,
          strokeStyle: "#423",
          lineCap: "round"
        },
        center
      );
      // draw hour hand
      const hoursInBase60 = time.getHours() * 60 / 12 + minutes / 60;
      this.drawNeedle(
        radius * 0.45,
        hoursInBase60,
        {
          lineWidth: 4.0,
          strokeStyle: "#42F",
          lineCap: "round"
        },
        center
      );
    });
  }
}

customElements.define("analog-clock", AnalogClock);

class DigitalClock extends StacheElement {
  static view = "{{ hh() }}:{{ mm() }}:{{ ss() }}";

  static props = {
    time: Date
  };

  hh() {
    const hr = this.time.getHours() % 12;
    return hr === 0 ? 12 : hr;
  }

  mm() {
    return this.time.getMinutes().toString().padStart(2, "00");
  }

  ss() {
    return this.time.getSeconds().toString().padStart(2, "00");
  }
}

customElements.define("digital-clock", DigitalClock);

class ClockControls extends StacheElement {
  static view = `
    <p>{{ time }}</p>
    <digital-clock time:from="time"/>
    <analog-clock time:from="time"/>
  `;

  static props = {
    time: {
      value({ resolve }) {
        const intervalID = setInterval(() => {
          resolve(new Date());
        }, 1000);

        resolve(new Date());

        return () => clearInterval(intervalID);
      }
    }
  };
}

customElements.define("clock-controls", ClockControls);
