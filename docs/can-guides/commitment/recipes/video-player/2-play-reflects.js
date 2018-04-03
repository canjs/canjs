can.Component.extend ({
    tag : 'video-player',
    view: `
      <video controls
        on:play="play()"
        on:pause="pause()">
        <source src="{{src}}"/>
      </video>
      <div class="video_controls_bar">
        <button>
          {{#if(playing)}}Pause{{else}}Play{{/if}}
        </button>
      </div>
    `,
    ViewModel: {
      src: 'string',
      playing: "boolean",

      play(){
        this.playing = true;
      },
      pause(){
        this.playing = false;
      },
    }
});
