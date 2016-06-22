@page roadmap Roadmap
@parent guides 8

@body

Now that 2.0 is out, we’re setting our sights on the
future.  Help us get there by ranking issues and features
on bithub and fixing them!

## Community

There’s more than code that goes into a library.  Checkout
how we’re working to improve CanJS's community:

### Bithub.com

We are developing [bithub.com](http://bithub.com/canjs) to track
all community content. Earn points that you 
can trade for swag by posting apps, articles, events
and plugins. __Rank bugs and features to let us and the 
rest of the community know where to focus.__

### Meetups

We’ve started meetups across the US.  Bitovi provides
monthly training and workshop material.  Checkout
meetup for meetups and [bithub.com](http://bithub.com/canjs/events)
for other events.

## DOM mutation observers

With CanJS 2.0, you can listen to "inserted" and "removed" events in
every browser.  We want to make it possible to listen to other DOM
mutation events, making it easier to create custom elements
that feel completely native.

## LazyMap and LazyList

We want our observable layer to handle anything you throw at 
it.  We’ve started work on a LazyMap and LazyList that
experiences almost no initialization penalty.  As you
read nested objects, it converts them into LazyMaps and LazyLists.

Furthermore, we want to setup bubbling only when it’s necessary and not
by default. This will reduce the number of events, improving performance.

## Component improvements

can.Component is designed to resemble web components.  As that 
specification takes shape, we will make sure can.Component
makes use of it.  Future improvements:

 - A select attribute on `<content>`.
 - In-page custom elements.
 - Iterable `<content>` for lists.

## Super Model

We want to create list-store that makes complex real-time apps
easy to build. It will include a fall-through localStorage cache that
decreases page load times.

## Dirty checking computes

Want to use plain old objects in can.Component?  We’re looking to
create a compute that checks its value periodically.  Hopefully
this becomes unnecessary as object mutation observers and 
proxies arrive in more browsers.

## Deferreds and Computes

Ever had a compute that represents a deferred that represents an
observable list?  We have.  We want to make it easy to nest
computes and deferreds like you can with Lists and Maps.