import {Component} from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "video-player",
  view: `
    <video controls
      on:play="play()"
      on:pause="pause()">
      <source src="{{ src }}"/>
    </video>
    <div>
      <button on:click="togglePlay()">
        {{# if(playing) }} Pause {{ else }} Play {{/ if }}
      </button>
    </div>
  `,
  ViewModel: {
    src: "string",
    playing: "boolean",

    play() {
      this.playing = true;
    },
    pause() {
      this.playing = false;
    },
    togglePlay() {
      this.playing = !this.playing;
    },

    connectedCallback(element) {
      this.listenTo("playing", function(event, isPlaying) {
        if (isPlaying) {
          element.querySelector("video").play();
        } else {
          element.querySelector("video").pause();
        }
      });
    }
  }
});
