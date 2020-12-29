## Use

`new Patcher()` is used internally by [can-view-live] to perform differences of lists and
make minimal updates to the DOM. Similarly, `new Patcher()` can be used to translate changes between lists to other sorts of minimal updates.

For example, lets say a list of vehicles is
being updated, and google map markers need to be added or removed based on the
what the new list of vehicles looks like.

An inefficient way of updating google maps would be to delete all old
markers and adding new ones.  A better way would be to use patcher
to only add and remove markers as necessary:

```js
const Vehicle = DefineMap.extend({
    id: {identity: true, type: "string"},
    name: "string"
});
Vehicle.List = DefineList.extend({"#": Vehicle})

restModel({
    Map: Vehicle,
    url: "/vehicles"
})

Component.extend({
    tag: "vehicle-map",
    ViewModel: {
        vehicles: {
            default(resolve){
                resolve()
            }
        },
        vehiclePatcher: {
            default() {
                return new Patcher(this.valueFrom("vehicles"))
            }
        },
        map: "any",
        connectedCallback(element) {
            googleAPI.then(() => {
                this.map = new google.maps.Map(element.firstChild, {
                    zoom: 10,
                    center: {
                        lat: 41.881,
                        lng: -87.623
                    }
                });
            });
            const onPatches(patches) => {
                patches.forEach((patch) => {

                })
            }.bind(this);
            this.vehiclePatcher.onPatches(onPatches);
            return function(){
                this.vehiclePatcher.offPatches(onPatches);
            }
       }
    }
})
```
