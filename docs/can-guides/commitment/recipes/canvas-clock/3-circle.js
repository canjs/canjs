import { StacheElement } from "//unpkg.com/can@6/core.mjs";

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

  connected() {
    const diameter = 255;
    const radius = diameter / 2 - 5;
    const center = diameter / 2;
    // draw circle
    this.canvas.lineWidth = 4.0;
    this.canvas.strokeStyle = "#567";
    this.canvas.beginPath();
    this.canvas.arc(center, center, radius, 0, Math.PI * 2, true);
    this.canvas.closePath();
    this.canvas.stroke();
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
