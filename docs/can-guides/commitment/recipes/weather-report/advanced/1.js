const yqlURL = "https://query.yahooapis.com/v1/public/yql?";

const WeatherViewModel = can.DefineMap.extend({
  location: "string",
  get forecastPromise() {
    if (this.location && this.location.length > 2) {
      return fetch(
        yqlURL +
        can.param({
          q: 'select * from geo.places where text="' + this.location + '"',
          format: "json"
        })
      ).then(response => {
        return response.json();
      }).then(data => {
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
      if (this.forecastPromise) {
        this.forecastPromise.then(resolve);
      }
    }
  },
  get showPlacePicker() {
    return !this.place && this.places && this.places.length > 1;
  },
  place: {
    stream: function(setStream) {
      const resetStream = this.toStream(".location").map(function() {
        return null;
      });
      const onePlaceResultStream = this.toStream(".places").map(function(places) {
        if (places.length === 1) {
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
      ).then(response => {
        return response.json();
      }).then(data => {
        console.log("forecast data", data);
        const forecast = data.query.results.channel.item.forecast;

        return forecast;
      });
    }
  },
  toClassName: function(text) {
    return text.toLowerCase().replace(/ /g, "-");
  }
});
can.defineStreamKefir(WeatherViewModel);

const vm = new WeatherViewModel();

const template = can.stache.from("app-template");
const fragment = template(vm);
document.body.appendChild(fragment);
