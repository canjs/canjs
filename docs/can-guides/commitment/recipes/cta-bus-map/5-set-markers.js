import { StacheElement, type } from "//unpkg.com/can@6/core.mjs";

const proxyUrl = "https://can-cors.herokuapp.com/";
const token = "?key=piRYHjJ5D2Am39C9MxduHgRZc&format=json";
const apiRoot = "http://www.ctabustracker.com/bustime/api/v2/";
const getRoutesEnpoint = apiRoot + "getroutes" + token;
const getVehiclesEndpoint = apiRoot + "getvehicles" + token;

class GoogleMapView extends StacheElement {
  static get view() {
    return `<div this:to="this.mapElement" class="gmap"></div>`;
  }

  static get props() {
    return {
      map: type.Any,
      mapElement: type.maybeConvert(HTMLElement),
      vehicles: type.Any
    };
  }

  connected() {
    googleAPI.then(() => {
      this.map = new google.maps.Map(this.mapElement, {
        zoom: 10,
        center: {
          lat: 41.881,
          lng: -87.623
        }
      });
    });
    this.listenTo("vehicles", (ev, newVehicles) => {
      if (newVehicles) {
        newVehicles.map(vehicle => {
          return new google.maps.Marker({
            position: {
              lat: parseFloat(vehicle.lat),
              lng: parseFloat(vehicle.lon)
            },
            map: this.map
          });
        });
      }
    });
  }
}

customElements.define("google-map-view", GoogleMapView);

class BusTracker extends StacheElement {
  static view = `
    <div class="top">
      <div class="header">
        <h1>{{this.title}}</h1>
        {{# if(this.routesPromise.isPending) }}<p>Loading routes…</p>{{/ if }}
        {{# if(this.vehiclesPromise.isPending) }}<p>Loading vehicles…</p>{{/ if }}
      </div>
      <ul class="routes-list">
        {{# for(route of this.routesPromise.value) }}
          <li on:click="this.pickRoute(route)" {{# eq(route, this.route) }}class="active"{{/ eq }}>
            <span class="route-number">{{ route.rt }}</span>
            <span class="route-name">{{ route.rtnm }}</span>
            <span class="check">✔</span>
          </li>
        {{/ for }}
      </ul>
    </div>
    <div class="bottom">
      {{# if(this.route) }}
        <div class="route-selected">
          <small>Route {{ this.route.rt }}:</small> {{ this.route.rtnm }}
          {{# if(this.vehiclesPromise.isRejected) }}
            <div class="error-message">No vehicles available for this route</div>
          {{/ if }}
        </div>
      {{/ if }}
      <google-map-view vehicles:from="this.vehiclesPromise.value"/>
    </div>
  `;

  static props = {
    title: {
      default: "Chicago CTA Bus Tracker"
    },

    routesPromise: {
      get default() {
        return fetch(proxyUrl + getRoutesEnpoint)
          .then(response => response.json())
          .then(data => data["bustime-response"].routes);
      }
    },

    route: type.Any,
    vehiclesPromise: type.Any
  };

  pickRoute(route) {
    this.route = route;
    this.vehiclesPromise = fetch(
      proxyUrl + getVehiclesEndpoint + "&rt=" + route.rt
    )
      .then(response => response.json())
      .then(data => {
        if (data["bustime-response"].error) {
          return Promise.reject(data["bustime-response"].error[0]);
        } else {
          return data["bustime-response"].vehicle;
        }
      });
  }
}

customElements.define("bus-tracker", BusTracker);
