import { ObservableObject, route, StacheElement, value } from "//unpkg.com/can@pre/ecosystem.mjs";

class CharacterSearchApp extends StacheElement {
  static view = `
    <div class="header">
      <img src="https://image.ibb.co/nzProU/rick_morty.png" width="300" height="113">
    </div>

    {{# if(this.routeComponent.isPending) }}
      Loading...
    {{/ if }}

    {{# if(this.routeComponent.isResolved) }}
      {{ this.routeComponent.value }}
    {{/ if }}
  `;

  static props = {
    routeData: {
      get default() {
        const routeData = new ObservableObject({});
        route.data = routeData;

        route.register("", { page: "search" });
        route.register("{page}");
        route.register("{page}/{query}");
        route.register("{page}/{query}/{characterId}");

        route.start();

        return routeData;
      }
    },

    get routeComponentData() {
      switch (this.routeData.page) {
        case "search":
        case "list":
          return {
            query: value.from(this.routeData, "query")
          };

        case "details":
          return {
            query: value.from(this.routeData, "query"),
            id: value.from(this.routeData, "characterId")
          };
      }
    },

    get routeComponent() {
      const componentURL =
        "//unpkg.com/character-search-components@6/character-" +
        this.routeData.page +
        ".mjs";

      return import(componentURL).then(module => {
        const ComponentConstructor = module.default;

        return new ComponentConstructor().bindings(this.routeComponentData);
      });
    }
  };
}

customElements.define("character-search-app", CharacterSearchApp);
