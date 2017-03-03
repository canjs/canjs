import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";
import template from "./main.stache!";

var startTime;
var lastMeasure;

var startMeasure = function(name) {
    startTime = performance.now();
    lastMeasure = name;
};
var stopMeasure = function() {
    window.setTimeout(function() {
        var stop = performance.now();
        console.log(lastMeasure+" took "+(stop-startTime));
    }, 0);
};

var Item = DefineMap.extend({
  id: "number",
  label: "string"
});

Item.List = DefineList.extend({
  "#": Item,
  "id": {type: "number", value: 1},
  "start": {type: "number", value: 0},
  "selected": {type: "number", value: null},
  buildData(count = 1000) {
      var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
      var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
      var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
      var data = [];
      for (var i = 0; i < count; i++) {
          data.push({ id: this.id++, label: adjectives[this._random(adjectives.length)] + " " + colours[this._random(colours.length)] + " " + nouns[this._random(nouns.length)] });
      }
      return data;
  },
  printDuration() {
      stopMeasure();
  },
  _random(max) {
      return Math.round(Math.random() * 1000) % max;
  },
  add() {
      startMeasure("add");
      this.start = performance.now();
      this.buildData(1000).forEach((i) => this.push(i));
      this.printDuration();
  },
  select(id) {
      startMeasure("select");
      this.start = performance.now();
      this.selected = id;
      this.printDuration();
  },
  del(id) {
      startMeasure("delete");
      this.start = performance.now();
      this.replace(this.filter((d) => d.id !== id));
      this.printDuration();
  },
  update() {
      startMeasure("update");
      this.start = performance.now();
      for (let i=0;i<this.length;i+=10) {
          this[i].label += ' !!!';
      }
      this.printDuration();
  },
  run() {
      startMeasure("run");
      this.start = performance.now();
      this.replace(this.buildData());
      this.printDuration();
  },
  runLots() {
      startMeasure("runLots");
      this.start = performance.now();
      this.replace(this.buildData(10000));
      this.selected = null;
      this.printDuration();
  },
  clear() {
      startMeasure("clear");
      this.start = performance.now();
      this.replace([]);
      this.selected = null;
      this.printDuration();
  },
  swapRows() {
    startMeasure("swapRows");
    if(this.length > 10) {
      var a = this[4];
      this.set(4, this[9]);
      this.set(9, a);
    }
    this.printDuration();
  },
  isSelected(id) {
    return id === this.selected;
  }
});

var items = new Item.List([]);

document.body.appendChild(template({items}));
