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

      const drawNeedle = (length, base60Distance, styles) => {
        Object.assign(canvas, styles);
        const x = center + length * Math.sin(base60ToRadians(base60Distance));
        const y = center + length * -1 * Math.cos(base60ToRadians(base60Distance));
        canvas.beginPath();
        canvas.moveTo(center, center);
        canvas.lineTo(x, y);
        canvas.closePath();
        canvas.stroke();
      };

      // draw second hand
      this.listenTo("time", (ev, time) => {
        canvas.clearRect(0, 0, diameter, diameter);

        // draw circle
        canvas.lineWidth = 4.0;
        canvas.strokeStyle = "#567";
        canvas.beginPath();
        canvas.arc(center, center, radius, 0, Math.PI * 2, true);
        canvas.closePath();
        canvas.stroke();

        // draw second hand
        const seconds = time.getSeconds() + this.time.getMilliseconds() / 1000;
        drawNeedle(
          radius * 0.85,
          seconds, {
            lineWidth: 2.0,
            strokeStyle: "#FF0000",
            lineCap: "round"
          }
        );
        // draw minute hand
        const minutes = time.getMinutes() + seconds / 60;
        drawNeedle(
          radius * 0.65,
          minutes,
          {
            lineWidth:  3.0,
            strokeStyle: "#423",
            lineCap: "round"
          }
        );
        // draw hour hand
        const hoursInBase60 = time.getHours() * 60 / 12 + minutes / 60;
        drawNeedle(
          radius * 0.45,
          hoursInBase60,
          {
            lineWidth:  4.0,
            strokeStyle: "#42F",
            lineCap: "round"
          }
        );
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
    time: {Default: Date, Type: Date},
    init() {
      setInterval(() => {
        this.time = new Date();
      }, 1000);
    }
  },
  view: `
    <p>{{ time }}</p>
    <digital-clock time:from="time"/>
    <analog-clock time:from="time"/>
  `
});
