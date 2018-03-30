const proxyUrl = "https://can-cors.herokuapp.com/";
const token = "?key=piRYHjJ5D2Am39C9MxduHgRZc&format=json";
const apiRoot = "http://www.ctabustracker.com/bustime/api/v2/"
const getRoutesEnpoint = apiRoot + "getroutes" + token;
const getVehiclesEndpoint = apiRoot + "getvehicles" + token;

const BusTrackerVM = can.DefineMap.extend({
  title: {
    default: "Chicago CTA Bus Tracker"
  },
  routesPromise: {
    default() {
      return fetch(proxyUrl + getRoutesEnpoint)
        .then(response => response.json())
        .then(data => data["bustime-response"].routes);
    }
  },
  route: "any",
  pickRoute(route) {
    this.route = route;
    fetch(proxyUrl + getVehiclesEndpoint + "&rt=" + route.rt)
      .then(response => response.json())
      .then(data => {
        if (data["bustime-response"].error) {
          console.log(data["bustime-response"].error);
        } else {
          console.log( data["bustime-response"].vehicle );
        }
      });
  }
});

const viewModel = new BusTrackerVM();

const view = can.stache.from("app-view");
const fragment = view(viewModel);
document.body.appendChild(fragment);
