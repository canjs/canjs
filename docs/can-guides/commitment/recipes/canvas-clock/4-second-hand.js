// 60 = 2π
const base60ToRadians = (base60Number) =>
  2 * Math.PI * base60Number / 60;

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

      this.listenTo("time", (ev, time) => {
        canvas.clearRect(0, 0, diameter, diameter);

        // draw circle
        canvas.lineWidth = 4.0;
        canvas.strokeStyle = "#567";
        canvas.beginPath();
        canvas.arc(center, center, radius, 0, Math.PI * 2, true);
        canvas.closePath();
        canvas.stroke();

        Object.assign(canvas, {
          lineWidth:  2.0,
          strokeStyle: "#FF0000",
          lineCap: "round"
        });
        // draw second hand
        const seconds = time.getSeconds() + this.time.getMilliseconds() / 1000;
        const size = radius * 0.85;
        const x = center + size * Math.sin(base60ToRadians(seconds));
        const y = center + size * -1 * Math.cos(base60ToRadians(seconds));
        canvas.beginPath();
        canvas.moveTo(center, center);
        canvas.lineTo(x, y);
        canvas.closePath();
        canvas.stroke();
      });
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
