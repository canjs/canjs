can.Component.extend({
  tag: "analog-clock",
  view: '<canvas id="analog" width="255" height="255"></canvas>',
  ViewModel: {
    connectedCallback(element) {
      const canvas = element.firstChild.getContext("2d");
      const diameter = 255;
      const radius = diameter/2 - 5;
      const center = diameter/2;
      // draw circle
      canvas.lineWidth = 4.0;
      canvas.strokeStyle = "#567";
      canvas.beginPath();
      canvas.arc(center, center, radius, 0, Math.PI * 2, true);
      canvas.closePath();
      canvas.stroke();
    }
  }
});

can.Component.extend({
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

can.Component.extend({
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
