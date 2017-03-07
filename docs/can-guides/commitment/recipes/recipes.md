@page guides/recipes Recipes
@parent guides/commitment 4

@description A listing of small examples that are useful for
learning CanJS.

@body


## File Navigator

The [guides/recipes/simple-file-navigator] walks through building a simple navigation
widget where you can open and close folders.

The [guides/recipes/ajax-file-navigator] walks through a navigation widget that uses
[can-connect] to load the data for a folder from a simulated service layer.

![600_457801363](https://cloud.githubusercontent.com/assets/78602/22888969/273617ca-f1cd-11e6-922f-28bd5514b3dd.jpeg)


## Weather Report

The [guides/recipes/simple-weather-report] walks through building a weather forecast. A user enters
a city name, selects a specific city if there are multiple matches, and sees a 10-day forecast.  

This guide makes use of `lastSet` and async [can-define.types.get getters] and [can-define.types.set setters].

![Weather report widget](../../docs/can-guides/commitment/recipes/weather-report/weather-report.png)
