import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class WeatherReport extends StacheElement {
	static view = `
		<div class="weather-widget">
			<div class="location-entry">
				<label for="location">Enter your location:</label>
				<input id="location" type="text" />
			</div>

			<p class="loading-message">Loading forecast…</p>

			<div class="forecast">
				<h1>5-Day Chicago Weather Forecast</h1>
				<ul>
					<li>
						<span class="date">Today</span>
						<span class="description light-rain">light rain</span>
						<span class="high-temp">100<sup>°</sup></span>
						<span class="low-temp">-10<sup>°</sup></span>
					</li>
				</ul>
			</div>
		</div>
	`;
}
customElements.define("weather-report", WeatherReport);
