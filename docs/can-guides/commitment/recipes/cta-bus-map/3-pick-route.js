import { Component } from "//unpkg.com/can@5/core.mjs";

const proxyUrl = "https://can-cors.herokuapp.com/";
const token = "?key=piRYHjJ5D2Am39C9MxduHgRZc&format=json";
const apiRoot = "http://www.ctabustracker.com/bustime/api/v2/"
const getRoutesEnpoint = apiRoot + "getroutes" + token;
const getVehiclesEndpoint = apiRoot + "getvehicles" + token;

Component.extend({
	tag: "bus-tracker",
	view: `
		<div class="top">
			<div class="header">
				<h1>{{this.title}}</h1>
				{{# if(this.routesPromise.isPending) }}<p>Loading routes…</p>{{/ if }}
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
					<div class="error-message">No vehicles available for this route</div>
				</div>
			{{/ if }}
			<div class="gmap">Google map will go here.</div>
		</div>
	`,
	ViewModel: {
		title: {
			default: "Chicago CTA Bus Tracker"
		},
		routesPromise: {
			default () {
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
	}
});
