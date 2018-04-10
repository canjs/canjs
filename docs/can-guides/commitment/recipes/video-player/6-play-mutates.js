can.Component.extend({
  tag: 'video-player',
  view: `
    <video
      on:play="play()"
      on:pause="pause()"
      on:timeupdate="updateTimes(scope.element)"
      on:loadedmetadata="updateTimes(scope.element)">
      <source src="{{src}}"/>
    </video>
    <div>
      <button on:click="togglePlay()">
        {{#if(playing)}}Pause{{else}}Play{{/if}}
      </button>
      <input type="range" value="0" max="1" step="any"
             value:bind="percentComplete"/>
      <span>{{formatTime(currentTime)}}</span> /
      <span>{{formatTime(duration)}} </span>
    </div>
    `,
  ViewModel: {
    src: 'string',
    playing: "boolean",
    duration: "number",
    currentTime: "number",

    get percentComplete() {
      return this.currentTime / this.duration;
    },
    set percentComplete(newVal) {
     this.currentTime = newVal * this.duration;
    },

    updateTimes(videoElement) {
      this.currentTime = videoElement.currentTime || 0;
      this.duration = videoElement.duration;
    },
    formatTime(time) {
      if (time === null || time === undefined) {
        return "--"
      }
      const durmins = Math.floor(time / 60);
      let dursecs = Math.floor(time - durmins * 60);
      if (dursecs < 10) {
        dursecs = "0" + dursecs;
      }
      return durmins + ":" + dursecs
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

    connectedCallback(element){
      this.listenTo("playing", function(ev, isPlaying){
        if (isPlaying) {
          element.querySelector("video").play();
        } else {
          element.querySelector("video").pause();
        }
      });
      this.listenTo("currentTime", function(ev, currentTime){
        element.querySelector("video").currentTime = currentTime;
      });
    }
  }
});
