import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "clock-controls",
  ViewModel: {
    time: {Default: Date, Type: Date},
    coonectedCallback() {
      setInterval(() => {
        this.time = new Date();
      }, 1000);
    }
  },
  view: `
    <p>{{ this.time }}</p>
    <digital-clock time:from="this.time"/>
    <analog-clock time:from="this.time"/>
  `
});