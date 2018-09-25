import {Component} from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "video-player",
  view: `
    <video controls>
      <source src="{{ src }}"/>
    </video>
  `,
  ViewModel: {
    src: "string",
  }
});
