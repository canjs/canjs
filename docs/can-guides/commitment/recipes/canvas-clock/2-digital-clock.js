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
