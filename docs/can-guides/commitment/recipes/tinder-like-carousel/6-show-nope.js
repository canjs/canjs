import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class EvilTinder extends StacheElement {
  static view = `
    <div class="header"></div>
    <div class="result {{# if(this.liking) }}liking{{/ if }}
                       {{# if(this.noping) }}noping{{/ if }}"></div>
    <div class="images">
      <div class="current" style="left: {{ this.howFarWeHaveMoved }}px">
        <img 
          src="{{ this.currentProfile.img }}"
          draggable="false"
          touch-action="none"
        >
      </div>
      <div class="next">
        <img src="{{ this.nextProfile.img }}"/>
      </div>
    </div>

    <div class="footer">
      <button class="dissBtn"
              on:click="this.nope()">Dislike</button>
      <button class="likeBtn"
              on:click="this.like()">Like</button>
    </div>
  `;

  static props = {
    profiles: {
      get default() {
        return new ObservableArray([
          { name: "gru", img: "https://user-images.githubusercontent.com/78602/40454685-5cab196e-5eaf-11e8-87ac-4af6792994ed.jpg" },
          { name: "hannibal", img: "https://user-images.githubusercontent.com/78602/40454705-6bf4d3d8-5eaf-11e8-9562-2bd178485527.jpg" },
          { name: "joker", img: "https://user-images.githubusercontent.com/78602/40454830-e71178dc-5eaf-11e8-80ee-efd64911e35f.png" },
          { name: "darth", img: "https://user-images.githubusercontent.com/78602/40454681-59cffdb8-5eaf-11e8-94ac-4849ab08d90c.jpg" },
          { name: "norman", img: "https://user-images.githubusercontent.com/78602/40454709-6fecc536-5eaf-11e8-9eb5-3da39730adc4.jpg" },
          { name: "stapuft", img: "https://user-images.githubusercontent.com/78602/40454711-72b19d78-5eaf-11e8-9732-80155ff8bb52.jpg" },
          { name: "dalek", img: "https://user-images.githubusercontent.com/78602/40454672-566b4984-5eaf-11e8-808d-cb5afd445e89.jpg" },
          { name: "wickedwitch", img: "https://user-images.githubusercontent.com/78602/40454720-7c3d984c-5eaf-11e8-9fa7-f68ddd33e3f0.jpg" },
          { name: "zod", img: "https://user-images.githubusercontent.com/78602/40454722-802ef694-5eaf-11e8-8964-ca648368720d.jpg" },
          { name: "venom", img: "https://user-images.githubusercontent.com/78602/40454716-76bef438-5eaf-11e8-9d29-5002260e96e1.jpg" }
        ]);
      }
    },

    howFarWeHaveMoved: Number,

    get currentProfile() {
      return this.profiles[0];
    },

    get nextProfile() {
      return this.profiles[1];
    },

    get liking() {
      return this.howFarWeHaveMoved >= 100;
    },
    
    get noping() {
      return this.howFarWeHaveMoved <= -100;
    }
  };

  like() {
    console.log("LIKED");
    this.profiles.shift();
  }

  nope() {
    console.log("NOPED");
    this.profiles.shift();
  }

  connected() {
    let current = this.querySelector(".current");
    let startingX;

    this.listenTo(current, "pointerdown", event => {
      startingX = event.clientX;

      this.listenTo(document, "pointermove", event => {
        this.howFarWeHaveMoved = event.clientX - startingX;
      });
    });
  }
}

customElements.define("evil-tinder", EvilTinder);
