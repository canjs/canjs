function base60ToRadians(base60Number) {
  // 60 = 2π
  return 2 * Math.PI * base60Number / 60;
}

can.Component.extend({
  tag: "analog-clock",
  view: can.stache(`<canvas id="analog"  width="255" height="255"></canvas>`),
  events: {
    "{element} inserted": function(element){
      this.canvas = this.element.firstChild.getContext('2d');
      this.diameter = 255;
      this.radius = this.diameter/2 - 5;
      this.center = this.diameter/2;
      // draw circle
      this.canvas.lineWidth = 4.0;
      this.canvas.strokeStyle = "#567";
      this.canvas.beginPath();
      this.canvas.arc(this.center,this.center,this.radius,0,Math.PI * 2,true);
      this.canvas.closePath();
      this.canvas.stroke();
    },
    "{viewModel} time": function(viewModel, newTime) {

      // draw second hand
      var seconds = newTime.getSeconds() + newTime.getMilliseconds() / 1000;
      Object.assign(this.canvas, {
        lineWidth:  2.0,
        strokeStyle: "#FF0000",
        lineCap: "round"
      });
      var size = this.radius * 0.85,
        x = this.center + size * Math.sin(base60ToRadians(seconds)),
        y = this.center + size * -1 * Math.cos(base60ToRadians(seconds));
      this.canvas.beginPath();
      this.canvas.moveTo(this.center,this.center);
      this.canvas.lineTo(x,y);
      this.canvas.closePath();
      this.canvas.stroke();
    }
  }
});

var DigitalClockVM = can.DefineMap.extend("DigitalClockVM",{
  time: Date,
  hh(){
    var hr= this.time.getHours() % 12;
    return hr === 0 ? 12 : hr;
  },
  mm(){
    return this.time.getMinutes().toString().padStart(2,"00");
  },
  ss(){
    return this.time.getSeconds().toString().padStart(2,"00");
  }
});

can.Component.extend({
  tag: "digital-clock",
  view: can.stache(`{{hh()}}:{{mm()}}:{{ss()}}`),
  ViewModel: DigitalClockVM
});

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
