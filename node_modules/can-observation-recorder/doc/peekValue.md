@function can-observation-recorder.peekValue peekValue
@parent can-observation-recorder/methods

@description Call [can-reflect.getValue] without being observed.

@signature `ObservationRecorder.peekValue(obj)`

`.peekValue` will call `obj`'s `@@can.getValue` symbol and return the result.  If it does not have that symbol,
`obj` will be returned.  Any calls to `ObservationRecorder.add` made will be ignored.

```js
import {value, ObservationRecorder} from "can";

var num = value.with(3)

ObservationRecorder.peekValue(num) //-> 3
```


@body
