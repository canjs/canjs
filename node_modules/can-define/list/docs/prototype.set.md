@function can-define/list/list.prototype.set set
@parent can-define/list/list.prototype

@description Sets an item or property or items or properties on a list.

@signature `list.set(index, value)`

  Sets the item at `index`.  Typically, [can-define/list/list::splice] should be used instead.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["A","B"]);
  list.set(2,"C");

  console.log(list[2]); //-> "C"
  ```
  @codepen

  Splice should be used because it will trigger a [can-define/list/list/LengthEvent]
  event. If you are using `.set(index, value)`, you should make sure to use `.get(index)`
  when reading values from the array. If you use `.splice()`, you can use `list[index]`
  to read values from the array.

  @param {Number} index A numeric position in the list.
  @param {*} value The value to add to the list.
  @return {can-define/list/list} The list instance.


@signature `list.set(prop, value)`

Sets the property at `prop`. This should be used when the property
  isn't already defined.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["A","B"]);
  list.set("count",1000);

  console.log(list.get("count")); //-> 1000
  ```
  @codepen

  @param {Number} prop A property name.
  @param {} value The value to add to the list.
  @return {can-define/list/list} The list instance.

@signature `list.set(newProps)`

  <section class="warnings">
  <div class="deprecated warning">
  <h3>Deprecated 3.10.1</h3>
  <div class="signature-wrapper">
  <p>Passing an {Object} to <code>.set</code> has been deprecated in favor of <a href="list.prototype.assign.html">assign</a> or <a href="list.prototype.update.html">update</a>. <code>list.set(index, value)</code> is <em>not</em> deprecated.</p>
  </div>
  </div>
  </section>

  Updates the properties on the list with `newProps`.

  ```js
  import {DefineList} from "can";

  const list = new DefineList(["A","B"]);
  list.set({count: 1000, skip: 2});

  console.log(list.get("count")); //-> 1000
  ```
  @codepen

  @param {Object} newProps An object of properties and values to set on the list.
  @return {can-define/list/list} The list instance.
