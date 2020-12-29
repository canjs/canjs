import {canReflect, DefineMap, QueryLogic} from "can";

// Takes the value of `name` (ex: `"chicken"`)
function SearchableStringSet(value) {
  this.value = value;
}

canReflect.assignSymbols(SearchableStringSet.prototype,{
  // Returns if the name on a todo is actually a member of the set.
  "can.isMember": function(value){
    return value.includes(this.value);
  },
  // Converts back to a value that can be in a query.
  "can.serialize": function(){
    return this.value;
  }
});

// Specify how to do the fundamental set comparisons.
QueryLogic.defineComparison(SearchableStringSet,SearchableStringSet,{
  // Return a set that would load all records in searchA and searchB.
  union(searchA, searchB){
    // If searchA's text contains searchB's text, then
    // searchB will include searchA's results.
    if(searchA.value.includes(searchB.value)) {
      // A:`food` ∪ B:`foo` => `foo`
      return searchB;
    }
    if(searchB.value.includes(searchA.value)) {
      // A:`foo` ∪ B:`food` => `foo`
      return searchA;
    }
    // A:`ice` ∪ B:`cream` => `ice` || `cream`
    return new QueryLogic.ValueOr([searchA, searchB]);
  },
  // Return a set that would load records shared by searchA and searchB.
  intersection(searchA, searchB){
    // If searchA's text contains searchB's text, then
    // searchA is the shared search results.
    if(searchA.value.includes(searchB.value)) {
        // A:`food` ∩ B:`foo` => `food`
        return searchA;
    }
    if(searchB.value.includes(searchA.value)) {
        // A:`foo` ∩ B:`food` => `food`
      return searchB;
    }
    // A:`ice` ∩ B:`cream` => `ice` && `cream`
    // But suppose AND isn't supported,
    // So we return `UNDEFINABLE`.
    return QueryLogic.UNDEFINABLE;
  },
  // Return a set that would load records in searchA that are not in
  // searchB.
  difference(searchA, searchB){
    // if searchA's text contains searchB's text, then
    // searchA has nothing outside what searchB would return.
    if(searchA.value.includes(searchB.value)) {
      // A:`food` \ B:`foo` => ∅
      return QueryLogic.EMPTY;
    }
    // If searchA has results outside searchB's results
    // then there are records, but we aren't able to
    // create a string that represents this.
    if(searchB.value.includes(searchA.value)) {
      // A:`foo` \ B:`food` => UNDEFINABLE
      return QueryLogic.UNDEFINABLE;
    }

    // A:`ice` \ B:`cream` => `ice` && !`cream`
    // If there's another situation, we
    // aren't able to express the difference
    // so we return UNDEFINABLE.
    return QueryLogic.UNDEFINABLE;
  }
});

const SearchableString = {
  [Symbol.for("can.SetType")]: SearchableStringSet
};

const Todo = DefineMap.extend({
  id: {type: "number", identity: true},
  name: SearchableString,
});

const todos = [
  {id: 1, name: "important meeting"},
  {id: 2, name: "fall asleep during meeting"},
  {id: 3, name: "find out what important means"}
];

const queryLogic = new QueryLogic(Todo);

const result = queryLogic.filterMembers({
  filter: {name: "important"}
}, todos);

console.log( result ); //->[{id: 1, name: "important meeting"},{id: 3, name: "find out what important means"}]
