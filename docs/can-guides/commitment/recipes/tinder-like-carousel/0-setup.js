import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "evil-tinder",
  view: `
      <div class="header"></div>

      <div class="images">
        <div class="current">
          <img src="https://user-images.githubusercontent.com/78602/40454720-7c3d984c-5eaf-11e8-9fa7-f68ddd33e3f0.jpg"/>
        </div>
        <div class="next">
          <img src="https://user-images.githubusercontent.com/78602/40454716-76bef438-5eaf-11e8-9d29-5002260e96e1.jpg"/>
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
