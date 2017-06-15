var yqlURL = "https://query.yahooapis.com/v1/public/yql?";

var WeatherViewModel = can.DefineMap.extend({
	location: "string",
	get placesPromise() {
		if (this.location && this.location.length > 2) {
			return fetch(
				yqlURL +
				can.param({
					q: 'select * from geo.places where text="' + this.location + '"',
					format: "json"
				})
			).then(function(response) {
				return response.json();
			}).then(function(data) {
				console.log(data);
				if (Array.isArray(data.query.results.place)) {
					return data.query.results.place;
				} else {
					return [data.query.results.place];
				}
			});
		}
	},
	places: {
		get: function(lastSet, resolve) {
			if (this.placesPromise) {
				this.placesPromise.then(resolve);
			}
		}
	},
	get showPlacePicker() {
		return !this.place && this.places && this.places.length > 1;
	},
	place: {
		stream: function(setStream) {
			var resetStream = this.toStream(".location").map(function() {
				return null;
			});
            var onePlaceResultStream = this.toStream(".places").map(function(places){
                if(places.length === 1) {
                    return places[0];
                } else {
                    return null;
                }
            });

			return onePlaceResultStream
				.merge(setStream)
				.merge(resetStream);
		}
	},
	pickPlace: function(place) {
		this.place = place;
	},
	get forecastPromise() {
		if (this.place) {
            console.log("place", this.place);
			return fetch(
				yqlURL +
				can.param({
					q: 'select * from weather.forecast where woeid=' + this.place.woeid,
					format: "json"
				})
			).then(function(response) {
				return response.json();
			}).then(function(data) {
				console.log("forecast data", data);
				var forecast = data.query.results.channel.item.forecast;

				return forecast;
			});
		}
	},
	toClassName: function(text) {
		return text.toLowerCase().replace(/ /g, "-");
	}
});
can.defineStreamKefir(WeatherViewModel);

var vm = new WeatherViewModel();

var template = can.stache.from("app-template");
var frag = template(vm);
document.body.appendChild(frag);
