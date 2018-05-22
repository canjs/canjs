can.Component.extend({
  tag: "evil-tinder",
  view: `
        <div class='header'>
        </div>
        <div class="images">
          <div class='current '>
            <img src="{{currentProfile.img}}"/>
          </div>
          <div class='next'>
            <img src="{{nextProfile.img}}"/>
          </div>
        </div>
        <div class="footer">
          <button class="likeBtn"
            on:click="like()">Like</button>
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
     get currentProfile(){
      return this.profiles.get(0) || this.emptyProfile;
    },
    get nextProfile(){
      return this.profiles.get(1) || this.emptyProfile;
    },
    like(){
      console.log("LIKED");
      this.profiles.shift();
    },
  }
});
