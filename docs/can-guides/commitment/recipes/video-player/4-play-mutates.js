can.Component.extend ({
    tag : 'video-player',
    view: `
      <video controls
        on:play="play()"
        on:pause="pause()"
        on:timeupdate="updateTimes(scope.element)"
        on:loadedmetadata="updateTimes(scope.element)">
        <source src="{{src}}"/>
      </video>
      <div class="video_controls_bar">
        <button on:click="togglePlay()">
          {{#if(playing)}}Pause{{else}}Play{{/if}}
        </button>
      <span class="curtimetext">{{formatTime(currentTime)}}</span> /
        <span class="durtimetext">{{formatTime(duration)}} </span>
      </div>
    `,
    ViewModel: {
      src: 'string',
      playing: "boolean",
      duration: "number",
      currentTime: "number",

      updateTimes(videoElement){
        this.currentTime = videoElement.currentTime || 0;
        this.duration = videoElement.duration;
      },
      formatTime(time) {
        if( time === null || time === undefined ) {
          return "--"
        }
        const durmins = Math.floor(time / 60);
        let dursecs = Math.floor(time - durmins * 60);
        if(dursecs < 10){dursecs = "0"+dursecs;}
        return durmins+":"+dursecs
      },
      play(){
        this.playing = true;
      },
      pause(){
        this.playing = false;
      },
      togglePlay(){
        this.playing = !this.playing;
      }
    },
   events: {
      "{viewModel} playing": function(vm, ev, isPlaying){
        if(isPlaying) {
          this.element.querySelector("video").play()
        } else {
          this.element.querySelector("video").pause()
        }
      }
    }
});
