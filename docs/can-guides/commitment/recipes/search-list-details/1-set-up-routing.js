import { StacheElement, route } from "//unpkg.com/can@6/ecosystem.mjs";

class CharacterSearchApp extends StacheElement {
  static view = `
    <div class="header">
      <img src="https://image.ibb.co/nzProU/rick_morty.png" width="400" height="151">
    </div>
  `;

  static props = {
    routeData: {
      get default() {
        route.register("", { page: "search" });
        route.register("{page}");
        route.register("{page}/{query}");
        route.register("{page}/{query}/{characterId}");

        route.start();

        return route.data;
      }
    }
  };
}

customElements.define("character-search-app", CharacterSearchApp);
