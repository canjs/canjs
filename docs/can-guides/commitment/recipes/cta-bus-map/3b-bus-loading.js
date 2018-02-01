var proxyUrl = "https://can-cors.herokuapp.com/";
var token = "?key=piRYHjJ5D2Am39C9MxduHgRZc&format=json";
var apiRoot = "http://www.ctabustracker.com/bustime/api/v2/"
var getRoutesEnpoint = apiRoot + "getroutes" + token;
var getVehiclesEndpoint = apiRoot + "getvehicles" + token;

var BusTrackerVM = can.DefineMap.extend({
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
  route: 'any',
  vehiclesPromise: 'any',
  pickRoute(route) {
    this.route = route;
    this.vehiclesPromise = fetch(proxyUrl + getVehiclesEndpoint + "&rt=" + route.rt)
      .then(response => response.json())
      .then(data => {
        if (data["bustime-response"].error) {
          return Promise.reject(data["bustime-response"].error[0]);
        } else {
          return data["bustime-response"].vehicle;
        }
      });
  }
});

var viewModel = new BusTrackerVM();

var view = can.stache.from("app-view");
var frag = view(viewModel);
document.body.appendChild(frag);
