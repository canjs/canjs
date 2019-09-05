import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class ClockControls extends StacheElement {
  static view = `
    <p>{{ this.time }}</p>
    <digital-clock time:from="this.time"/>
    <analog-clock time:from="this.time"/>
  `;

  static props = {
    time: {
      get default() {
        return new Date();
      }
    }
  };

  connected() {
    setInterval(() => {
      this.time = new Date();
    }, 1000);
  }
}

customElements.define("clock-controls", ClockControls);
