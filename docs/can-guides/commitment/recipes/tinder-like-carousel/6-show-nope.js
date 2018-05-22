can.Component.extend({
  tag: "evil-tinder",
  view: `
        <div class='header'>
        </div>
        <div class='result {{#if(liking)}}liking{{/if}}
                           {{#if(noping)}}noping{{/if}}'>
        </div>
        <div class="images">
          <div class='current' style="left: {{howFarWeHaveMoved}}px">
            <img src="{{currentProfile.img}}"
                          draggable="false"
                          touch-action="none"/>
          </div>
          <div class='next'>
            <img src="{{nextProfile.img}}"/>
          </div>
        </div>
        <div class="footer">
          <button class="likeBtn"
            on:click="like()">Like</button>
          <button class="dissBtn"
            on:click="nope()">Dislike</button>
        </div>
        `,
  ViewModel: {
    profiles: {
      default(){
        return [
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/gru.jpg"},
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/hannibal.jpg"},
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/joker.jpg"},
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/darth.jpg"},
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/norman.jpg"},
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/stapuft.jpg"},
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/dalek.jpg"},
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/wickedwitch.jpg"},
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/zod.jpg"},
        {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/venom.jpg"}]
      }
    },
    emptyProfile: {
      default() {
        return {img: "http://stickwix.com/wp-content/uploads/2016/12/Stop-Sign-NH.jpg"}
      }
    },
    howFarWeHaveMoved: "number",

     get currentProfile(){
      return this.profiles.get(0) || this.emptyProfile;
    },
    get nextProfile(){
      return this.profiles.get(1) || this.emptyProfile;
    },
    get liking(){
      return this.howFarWeHaveMoved >= 100;
    },
    get noping() {
      return this.howFarWeHaveMoved <= -100;
    },

    like(){
      console.log("LIKED");
      this.profiles.shift();
    },
    nope(){
      console.log("NOPED");
      this.profiles.shift();
    },

    connectedCallback(el) {

      var current = el.querySelector(".current");
      var startingX;

      this.listenTo(current,"pointerdown", (event) => {

        startingX = event.clientX;

        this.listenTo(document,"pointermove", (event) => {
          this.howFarWeHaveMoved = event.clientX - startingX;
        })

        this.listenTo(document,"pointerup", (event) => {
          this.howFarWeHaveMoved = event.clientX - startingX;

          if(this.liking) {
            this.like()
          } else if(this.noping){
            this.nope();
          }

          this.howFarWeHaveMoved = 0;
          this.stopListening(document);
        })
      });
    }
  }
});
