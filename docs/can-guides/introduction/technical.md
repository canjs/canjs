@page guides/technical Technical Highlights
@parent guides/introduction 3

@body

- IE9 Support
- Independent projects / pieces
- Small size for what you get

- MVVM
  - state exists somewhere ...
  - Pagination example (federated state)
  - ATM example (federated state)
  - Testable

- Observables
  - Object oriented and functional
  - Batched events ... minimal data and DOM updates.
  - No having to list dependencies.
  - "compiled" property behavior ... so fast.
  - nice syntax for a lot of expressiveness - get, set, initial value, type conversion.

- View Models
  - all the benefits of observables and MVVM.

- Views
  - Handlebars
  - One, two-way, and event bindings.
  - Custom elements
  - Minimal DOM Updates

- Model
  - Typed data, but separate from connection info.
  - Parameter awareness. ( [can-set] )
  - Real time
  - Instance and List stores
  - Fall through caching, complete caching.
  - Works with related data [can-connect/can/ref/ref].
  - Web worker

- Cool other things
  - SSR with can-simple-dom and can-zone
  - StealJS stache integration
