var ClockControlsVM = can.DefineMap.extend("ClockControlsVM",{
  time: {Value: Date, Type: Date},
  init(){
    setInterval(() => {
      this.time = new Date();
    },1000);
  }
});

can.Component.extend({
  tag: "clock-controls",
  autoMount: true,
  ViewModel: ClockControlsVM,
  view: can.stache(`
    <p>{{time}}</p>
    <digital-clock time:from="time"/>
    <analog-clock time:from="time"/>
  `)
});
