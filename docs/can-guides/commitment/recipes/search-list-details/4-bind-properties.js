import { Component, observe, route, value } from "//unpkg.com/can@5/ecosystem.mjs";

Component.extend({
  tag: "character-search-app",

  view: `
    <div class="header">
      <img src="https://image.ibb.co/nzProU/rick_morty.png" width="400" height="151">
    </div>

    {{# if(routeComponent.isPending) }}
      Loading...
    {{/ if }}

    {{# if(routeComponent.isResolved) }}
      {{ routeComponent.value }}
    {{/ if }}
  `,

  ViewModel: {
    routeData: {
      default() {
        const observableRouteData = new observe.Object();
        route.data = observableRouteData;

        route.register("", { page: "search" });
        route.register("{page}");
        route.register("{page}/{query}");
        route.register("{page}/{query}/{characterId}");

        route.start();

        return observableRouteData;
      }
    },

    get routeComponentData() {
      const viewModelData = {
        query: value.from(this.routeData, "query")
      };

      if(this.routeData.page === "details") {
        viewModelData.id = value.from(this.routeData, "characterId");
      }

      return viewModelData;
    },

    get routeComponent() {
      const componentURL =
        "//unpkg.com/character-search-components@5/character-" +
        this.routeData.page + ".mjs";

      return import(componentURL).then((module) => {
        const ComponentConstructor = module.default;

        return new ComponentConstructor({
          viewModel: this.routeComponentData
        });
      });
    }
  }
});
