import { ObservableObject, route, StacheElement } from "//unpkg.com/can@pre/ecosystem.mjs";

class CharacterSearchApp extends StacheElement {
  static view = `
    <div class="header">
      <img src="https://image.ibb.co/nzProU/rick_morty.png" width="400" height="151">
    </div>

    {{# if(this.routeComponent.isPending) }}
      Loading…
    {{/ if }}

    {{# if(this.routeComponent.isResolved) }}
      {{ this.routeComponent.value }}
    {{/ if }}
  `;

  static props = {
    routeData: {
      get default() {
        const observableRouteData = new ObservableObject();
        route.data = observableRouteData;

        route.register("", { page: "search" });
        route.register("{page}");
        route.register("{page}/{query}");
        route.register("{page}/{query}/{characterId}");

        route.start();

        return observableRouteData;
      }
    },

    get routeComponent() {
      const componentURL =
        "//unpkg.com/character-search-components@6/character-" +
        this.routeData.page +
        ".mjs";

      return import(componentURL).then(module => {
        const ComponentConstructor = module.default;

        return new ComponentConstructor();
      });
    }
  };
}

customElements.define("character-search-app", CharacterSearchApp);
