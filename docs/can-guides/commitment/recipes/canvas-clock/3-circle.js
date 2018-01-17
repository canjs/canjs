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
  time: {Default: Date, Type: Date},
  init(){
    setInterval(() => {
      this.time = new Date();
    },1000);
  }
});

can.Component.extend({
  tag: "clock-controls",
  ViewModel: ClockControlsVM,
  view: can.stache(`
    <p>{{time}}</p>
    <digital-clock time:from="time"/>
    <analog-clock time:from="time"/>
  `)
});
