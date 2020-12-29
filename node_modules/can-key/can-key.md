@module {Object} can-key
@parent can-js-utilities
@collection can-infrastructure
@package ./package.json

@description Utilities that read and write nested properties on objects and arrays.

@type {Object}

  `can-key` exports an object that contains all of its module functions:

  ```js
  import key from "can-key";

  var task = {
      name: "learn can-key",
      owner: {
          name: {first: "Justin", last: "Meyer"}
      }
  }

  // delete a nested key
  key.delete(task, "owner.name.first");

  // get a nested key
  key.get(task, "owner.name.last") //-> "Meyer"

  // set a nested key
  key.set(task, "owner.name.first", "Bohdi");

  // replace templated parts of a string with values
  key.replaceWith("{owner.name.first} {owner.name.last}", task) //-> "Bohdi Meyer"

  // move values from one part of an object to another
  key.transform(obj, {
      "owner.name": "user.name"
  })

  // call a function for each key read
  key.walk(task, "user.name.first", function(keyInfo){ ... })
  ```
