import { param, StacheElement } from "//unpkg.com/can@6/core.mjs";

class WeatherReport extends StacheElement {
	static view = `
		<div class="weather-widget">
			<div class="location-entry">
				<label for="location">Enter your location:</label>
				<input id="location" type="text" value:to="this.location" />
			</div>

			{{# if(this.forecastPromise.isPending) }}
				<p class="loading-message">Loading forecast…</p>
			{{/ if }}

			{{# if(this.forecastPromise.isResolved) }}
				<div class="forecast">
					<h1>5-Day {{ this.location }} Weather Forecast</h1>
					<ul>
						<li>
							<span class="date">Today</span>
							<span class="description light-rain">light rain</span>
							<span class="high-temp">100<sup>°</sup></span>
							<span class="low-temp">-10<sup>°</sup></span>
						</li>
					</ul>
				</div>
			{{/ if }}
		</div>
	`;

	static props = {
		get forecastPromise() {
			if (this.location) {
				return fetch(
					"https://api.openweathermap.org/data/2.5/forecast?" +
						param({
							apiKey: appKey,
							mode: "json",
							q: this.location,
							units: "imperial"
						})
				)
					.then(response => {
						return response.json();
					})
					.then(transformData);
			}
		},
		location: String
	};
}
customElements.define("weather-report", WeatherReport);
