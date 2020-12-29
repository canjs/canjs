# can-event-dom-radiochange

[![Join our Slack](https://img.shields.io/badge/slack-join%20chat-611f69.svg)](https://www.bitovi.com/community/slack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join our Discourse](https://img.shields.io/discourse/https/forums.bitovi.com/posts.svg)](https://forums.bitovi.com/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canjs/can-event-dom-radiochange/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/can-event-dom-radiochange.svg)](https://www.npmjs.com/package/can-event-dom-radiochange)
[![Travis build status](https://travis-ci.org/canjs/can-event-dom-radiochange.svg?branch=master)](https://travis-ci.org/canjs/can-event-dom-radiochange)
[![Greenkeeper badge](https://badges.greenkeeper.io/canjs/can-event-dom-radiochange.svg)](https://greenkeeper.io/)

A custom event for listening to changes of inputs with type "radio", which fires when a conflicting radio input changes. A "conflicting" radio button has the same "name" attribute and exists within in the same form, or lack thereof. This event coordinates state bound to whether a radio is checked. The "change" event does not fire for deselected radios. By using this event instead, deselected radios receive notification.

## Documentation

Read the [can-event-dom-radiochange API docs on CanJS.com](https://canjs.com/doc/can-event-dom-radiochange.html).

## Changelog

See the [latest releases on GitHub](https://github.com/canjs/can-event-dom-radiochange/releases).

## Contributing

The [contribution guide](https://github.com/canjs/can-event-dom-radiochange/blob/master/CONTRIBUTING.md) has information on getting help, reporting bugs, developing locally, and more.

## License

[MIT](https://github.com/canjs/can-event-dom-radiochange/blob/master/LICENSE)
