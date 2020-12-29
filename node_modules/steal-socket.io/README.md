# steal-socket.io

Wrap socket.io for SSR and testing

[![Build Status](https://travis-ci.org/stealjs/steal-socket.io.svg?branch=master)](https://travis-ci.org/stealjs/steal-socket.io)
[![npm version](https://badge.fury.io/js/steal-socket.io.svg)](http://badge.fury.io/js/steal-socket.io)

A small wrapper for `socket.io` that eliminates a lot of configuration and prevents you from having to worry about whether you are running in the client or server.

It also helps with testing or demoing your application against fixtures. It can delay establishing socket connection so that we can mock socket server responses for testing. Works well with [can-fixture-socket](http://v3.canjs.com/doc/can-fixture-socket.html).

See full documentation here: [StealJS / Ecosystem / steal-socket.io](https://stealjs.github.io/stealjs/docs/steal-socket.io.html).

## Install

```shell
npm install steal-socket.io --save
```

## License

MIT
