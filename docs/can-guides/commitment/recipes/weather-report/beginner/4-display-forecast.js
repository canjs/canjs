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
						{{# for(forecast of this.forecastPromise.value) }}
							<li>
								<span class="date">
									{{# if(this.isToday(forecast.date)) }}
										Today
									{{ else }}
										{{ forecast.date.toLocaleDateString() }}
									{{/ if }}
								</span>
								<span class="description {{ this.toClassName(forecast.text) }}">{{ forecast.text }}</span>
								<span class="high-temp">{{ forecast.high }}<sup>°</sup></span>
								<span class="low-temp">{{ forecast.low }}<sup>°</sup></span>
							</li>
						{{/ for }}
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

	isToday(date) {
		const today = new Date();
		return today.getDate() === date.getDate();
	}

	toClassName(txt) {
		return txt.toLowerCase().replace(/ /g, "-");
	}
}
customElements.define("weather-report", WeatherReport);
