@property {String} can-connect-ndjson.ndjson ndjson
@parent can-connect-ndjson/options

@description Specify the URL of an NDJSON service endpoint. If not specified or not supported in the browser, it falls back to the `url` endpoint.


@type {String}

Below is an example of how to pass the `ndjson` option into your connection:

```
connect(behaviors, {
    url: "/other/endpoint", //fallback endpoint
    ndjson: "/api" //NDJSON endpoint
});
```
