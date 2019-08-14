import { StacheElement } from "//unpkg.com/can@pre/core.mjs";

const proxyUrl = "https://can-cors.herokuapp.com/";
const token = "?key=piRYHjJ5D2Am39C9MxduHgRZc&format=json";
const apiRoot = "http://www.ctabustracker.com/bustime/api/v2/";
const getRoutesEnpoint = apiRoot + "getroutes" + token;
const getVehiclesEndpoint = apiRoot + "getvehicles" + token;

class BusTracker extends StacheElement {
  static view = `
    <div class="top">
      <div class="header">
        <h1>{{ this.title }}</h1>
        <p>Loading routes…</p>
      </div>
      <ul class="routes-list">
        <li>
          <span class="route-number">1</span>
          <span class="route-name">Bronzeville/Union Station</span>
          <span class="check">✔</span>
        </li>
        <li class="active">
          <span class="route-number">2</span>
          <span class="route-name">Hyde Park Express</span>
          <span class="check">✔</span>
        </li>
      </ul>
    </div>
    <div class="bottom">
      <div class="route-selected">
        <small>Route 2:</small> Hyde Park Express
        <div class="error-message">No vehicles available for this route</div>
      </div>
      <div class="gmap">Google map will go here.</div>
    </div>
  `;

  static props = {
    title: {
      default: "Chicago CTA Bus Tracker"
    }
  };
}

customElements.define("bus-tracker", BusTracker);
