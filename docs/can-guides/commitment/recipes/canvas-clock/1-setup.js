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
