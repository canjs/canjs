import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class DigitalClock extends StacheElement {
  static view = `{{ hh() }}:{{ mm() }}:{{ ss() }}`;

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
    <p>{{ this.time }}</p>
    <digital-clock time:from="this.time"/>
    <analog-clock time:from="this.time"/>
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
