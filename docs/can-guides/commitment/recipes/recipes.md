@page guides/recipes recipes
@parent guides 3

@description A listing of small examples that are useful for
learning CanJS.

@body


## Credit Card

The [guides/recipes/credit-card-simple]  walks through building
a simple credit card payment form with Stripe. It also performs
simple validation on the payment form values.

![Credit Card App](https://user-images.githubusercontent.com/78602/27451508-d86e9bd8-5754-11e7-954b-a812e1ed63b1.png)

The [guides/recipes/credit-card-advanced] recipe builds nearly same application, but
with better validations and with Kefir streams instead of [can-define].

## CTA Bus Map

The [guides/recipes/cta-bus-map] walks through showing Chicago Transit Authority (CTA) bus locations on a Google Map.  You'll learn how to create a [can-component] that integrates with 3rd party widgets.

![CTA Bus Map](../../docs/can-guides/commitment/recipes/cta-bus-map/cta-bus-map.png)

## Signup and Login

The [guides/recipes/signup-simple] walks through building simple signup, login forms and
a logout button.   

![Signup and Login](../../docs/can-guides/commitment/recipes/signup-simple/signup.png)

## File Navigator

The [guides/recipes/file-navigator-simple] walks through building a simple navigation
widget where you can open and close folders.

The [guides/recipes/file-navigator-advanced] walks through a navigation widget that uses
[can-connect] to load the data for a folder from a simulated service layer.

![File Navigator](https://cloud.githubusercontent.com/assets/78602/22888969/273617ca-f1cd-11e6-922f-28bd5514b3dd.jpeg)

## TodoMVC with StealJS

The [guides/recipes/todomvc-with-steal] guide builds the TodoMVC application, like the [guides/todomvc], but using [StealJS](https://stealjs.com) to load modules.  It is designed to be done in a classroom-like setting and includes links
to keynote and powerpoint presentations for each section.


## Weather Report

The [guides/recipes/weather-report-simple] walks through building a 10 day forecast widget
using YQL. The [guides/recipes/weather-report-advanced] extends the simple widget to
remove imperative code and automatically lookup the users location using the
browser's [geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation) with
event streams.

![Weather Report](../../docs/can-guides/commitment/recipes/weather-report/weather-report.png)

## Playlist Editor

The [guides/recipes/playlist-editor] shows how to use YouTube's API to search for videos and make a playlist.  This
makes authenticated requests with OAuth2. It uses [jQuery++](https://jquerypp.com) for
drag/drop events. It shows using custom attributes and custom events.  

![Playlist Editor](https://user-images.githubusercontent.com/78602/27451781-ea3ed3d6-5755-11e7-8dd8-c4e83bc8aa90.png)
