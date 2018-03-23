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
  vehiclesPromise: "any",
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
  view: can.stache(`<div class="gmap"></div>`),
  ViewModel: {
    map: "any",
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
    },
    vehicles: "any"
  },
  events: {
    "{viewModel} vehicles": function(vm, ev, newVehicles) {
      if ( newVehicles ) {
        newVehicles.map(vehicle => {
          return new google.maps.Marker({
            position: {
              lat: parseFloat(vehicle.lat),
              lng: parseFloat(vehicle.lon)
            },
            map: this.viewModel.map
          });
        });
      }
    }
  }
});

const viewModel = new BusTrackerVM();

const view = can.stache.from("app-view");
const fragment = view(viewModel);
document.body.appendChild(fragment);
