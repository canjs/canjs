import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
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
    <p>{{time}}</p>
    <digital-clock time:from="time"/>
    <analog-clock time:from="time"/>
  `
});