### Data bound templates

Although not directly a feature of observables, data bound templates are a feature of CanJS Views that are tied closely with the observable layer.

Templates in CanJS bind to property changes and update the DOM as needed.

For example, there may be a template that looks like this:

```
<div>{{fullName}}</div>
```

If first is changed:

```javascript
person.first = 'Jane';
```

`fullName` recomputes, then the DOM automatically changes to reflect the new value.

Observables express complex relationships between data, without regard to its display. Views express properties from the observables, without regard to how the properties are computed. The app then comes alive with rich functionality.

DIAGRAM - circular arrows pointing back to each layer
