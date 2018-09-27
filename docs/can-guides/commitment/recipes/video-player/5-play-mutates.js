import {Component} from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "video-player",
  view: `
    <video controls
      on:play="play()"
      on:pause="pause()"
      on:timeupdate="updateTimes(scope.element)"
      on:loadedmetadata="updateTimes(scope.element)">
      <source src="{{ src }}"/>
    </video>
    <div>
      <button on:click="togglePlay()">
        {{# if(playing) }} Pause {{ else }} Play {{/ if }}
      </button>
      <input type="range" value="0" max="1" step="any"
             value:from="percentComplete"/>
      <span>{{ formatTime(currentTime) }}</span> /
      <span>{{ formatTime(duration) }} </span>
    </div>
  `,
  ViewModel: {
    src: "string",
    playing: "boolean",
    duration: "number",
    currentTime: "number",

    get percentComplete() {
      return this.currentTime / this.duration;
    },

    updateTimes(videoElement) {
      this.currentTime = videoElement.currentTime || 0;
      this.duration = videoElement.duration;
    },
    formatTime(time) {
      if (time === null || time === undefined) {
        return "--";
      }
      const minutes = Math.floor(time / 60);
      let seconds = Math.floor(time - minutes * 60);
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      return minutes + ":" + seconds;
    },
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
