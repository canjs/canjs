#Comparify

Simple criteria checking, so you can test a subset of an object's properties.

```
var comparify = require('comparify');

var data = {
  timestamp: 1395877795067,
  deviceID: '765CBA',
  recipient: {
    name: 'Thomas'
  }
};

comparify(data, {deviceID: '765CBA'}) === true;
comparify(data, {deviceID: 'ABC123'}) === false;

comparify(data, {'recipient.name': 'Thomas'}) === true;
comparify(data, {recipient: {name: 'Thomas'}}) === true;
```

## To Do

- Add support for arrays (any / all matching)
- Add support for more types of comparison
  - Greater than / less than
  - Range
