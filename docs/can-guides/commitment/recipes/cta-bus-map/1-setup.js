const proxyUrl = "https://can-cors.herokuapp.com/";
const token = "?key=piRYHjJ5D2Am39C9MxduHgRZc&format=json";
const apiRoot = "http://www.ctabustracker.com/bustime/api/v2/"
const getRoutesEnpoint = apiRoot + "getroutes" + token;
const getVehiclesEndpoint = apiRoot + "getvehicles" + token;

const BusTrackerVM = can.DefineMap.extend({
  title: {
    default: "Chicago CTA Bus Tracker"
  }
});

const viewModel = new BusTrackerVM();

const view = can.stache.from("app-view");
const fragment = view(viewModel);
document.body.appendChild(fragment);
