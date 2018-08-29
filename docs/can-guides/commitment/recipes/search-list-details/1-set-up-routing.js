import { Component, observe, route } from "//unpkg.com/can@5/ecosystem.mjs";

Component.extend({
  tag: "character-search-app",

  view: `
    <div class="header">
      <img src="https://image.ibb.co/nzProU/rick_morty.png" width="400" height="151">
    </div>
  `,

  ViewModel: {
    routeData: {
      default() {
        const routeData = new observe.Object();
        route.data = routeData;

        route.register("", { page: "search" });
        route.register("{page}");
        route.register("{page}/{query}");
        route.register("{page}/{query}/{characterId}");

        route.start();

        return routeData;
      }
    }
  }
});
