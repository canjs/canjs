var proxyUrl = "https://can-cors.herokuapp.com/";
var token = "?key=piRYHjJ5D2Am39C9MxduHgRZc&format=json";
var apiRoot = "http://www.ctabustracker.com/bustime/api/v2/"
var getRoutesEnpoint = apiRoot + "getroutes" + token;
var getVehiclesEndpoint = apiRoot + "getvehicles" + token;

var BusTrackerVM = can.DefineMap.extend({
  title: {
    value: "Chicago CTA Bus Tracker"
  },
  routesPromise: {
    value() {
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

can.Component.extend({
  tag: "google-map-view",
  view: can.stache(`<div class='gmap'></div>`),
  ViewModel: DefineMap.extend({
    map: 'any',
    connectedCallback(element) {
      googleAPI.then(() => {
        this.map = new google.maps.Map(element.firstChild, {
          zoom: 10,
          center: {
            lat: 41.881,
            lng: -87.623
          }
        });
      });
	}
  })
});

var viewModel = new BusTrackerVM();

var view = can.stache.from("app-view");
var frag = view(viewModel);
document.body.appendChild(frag);
