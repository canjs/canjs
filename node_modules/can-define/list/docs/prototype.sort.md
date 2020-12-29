@function can-define/list/list.prototype.sort sort
@parent can-define/list/list.prototype

@description Sort the properties of a list.

@signature `list.sort([compareFunction])`

  Sorts the elements of a list in place and returns the list. The API is the
  same as the native JavaScript `Array.prototype.sort` API.

  ```js
  import {DefineList} from "can";

  const accounts = new DefineList([
      { name: "Savings", amount: 20.00 },
      { name: "Checking", amount: 103.24 },
      { name: "Kids Savings", amount: 48155.13 }
  ]);

  accounts.sort((a, b) => {
      if (a.name < b.name) {
          return -1;
      } else if (a.name > b.name){
          return 1;
      } else {
          return 0;
      }
  });

  console.log(accounts[0].name); //-> "Checking"
  console.log(accounts[1].name); //-> "Kids Savings"
  console.log(accounts[2].name); //-> "Savings"
  ```
  @codepen

  @param {function(a, b)} compareFunction Specifies a function that defines the sort order.

  If `compareFunction` is supplied, the list elements are sorted according to the return
  value of the compare function. If `a` and `b` are two elements being compared, then:

  - If `compareFunction(a, b)` returns a value less than 0, `a` will be sorted to
  a lower index than `b`, so `a` will now come first.
  - If `compareFunction(a, b)` returns 0, the order of the two values will not be changed.
  - If `compareFunction(a, b)` returns a value greater than 0, `a` will be sorted to
  a higher index than `b`, so `b` will now come first.

  @return {can-define/list/list} The list instance.
@body
```
