can.Component.extend({
  tag: "evil-tinder",
  view: `
      <div class="header"></div>

      <div class="images">
        <div class='current'>
          <img src="http://www.ryangwilson.com/bitovi/evil-tinder/villains/wickedwitch.jpg"/>
        </div>
        <div class='next'>
          <img src="http://www.ryangwilson.com/bitovi/evil-tinder/villains/venom.jpg"/>
        </div>
      </div>

      <div class="footer">
        <button class="dissBtn">Dislike</button>
        <button class="likeBtn">Like</button>
      </div>
  `,
  ViewModel: {
  }
});
