# [CanJS](https://canjs.com/)

 [![SauceLabs Test Status](https://saucelabs.com/browser-matrix/canjs-not-master.svg)](https://saucelabs.com/u/canjs-not-master)

[![Join our Slack](https://img.shields.io/badge/slack-join%20chat-611f69.svg)](https://www.bitovi.com/community/slack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join our Discourse](https://img.shields.io/discourse/https/forums.bitovi.com/posts.svg)](https://forums.bitovi.com/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/can.svg)](https://www.npmjs.com/package/can)
[![Build Status](https://travis-ci.org/canjs/canjs.svg?branch=master)](https://travis-ci.org/canjs/canjs)
[![Greenkeeper badge](https://badges.greenkeeper.io/canjs/canjs.svg)](https://greenkeeper.io/)

CanJS is a collection of client-side JavaScript architectural libraries.

### Web Components

CanJS’s [StacheElement](https://canjs.com/doc/can-stache-element.html) allows you to create Web Components with [observable properties](https://canjs.com/doc/can-observable-object.html) and [live-bound templates](https://canjs.com/doc/can-stache.html).

```js
class Counter extends StacheElement {
	static view = `
		Count: <span>{{ this.count }}</span>
		<button on:click="this.increment()">+1</button>
	`;

	static props = {
		count: 0
	};

	increment() {
		this.count++;
	}
}
customElements.define("my-counter", Counter);
```

### Model layer

Components shouldn’t be concerned with how data is fetched, updated, or cached.

CanJS provides the right abstractions for your model code to be cleanly separated from your UI code. [Learn more…](./readme-feature-model-layer.md)

<img src="https://canjs.com/docs/images/animations/model-layer-still.svg" width="270" />

### Promises in templates

CanJS’s [stache templating language](https://canjs.com/doc/can-stache.html) can directly read the state and values from [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

No need to write any extra code to determine whether a Promise is pending, resolved, or rejected. [Learn more…](./readme-feature-promises-in-templates.md)

```handlebars
{{# if(this.promise.isPending) }}
  Loading…
{{/ if }}
{{# if(this.promise.isRejected) }}
  Error: {{ this.promise.reason }}
{{/ if }}
{{# if(this.promise.isResolved) }}
  Result: {{ this.promise.value }}
{{/ if }}
```

### Real-time list updating

After data is created, updated, or destroyed, CanJS automatically updates your lists for you.

Filtering and sorting are preserved, so you don’t have to manually update your lists or fetch the same data again. [Learn more…](./readme-feature-real-time-list-updating.md)

<img src="https://canjs.com/docs/images/animations/realtime-amin.svg" width="270" />

### Getting Started

Ready to get started? See the [Setting Up CanJS](https://canjs.com/doc/guides/setup.html), [API Docs](https://canjs.com/doc/api.html) and [Guides](https://canjs.com/doc/guides.html) pages.

### Support / Contributing

Before you make an issue, please read our [Contributing](https://canjs.com/doc/guides/contribute.html) guide.

You can find the core team on [Slack](https://www.bitovi.com/community/slack).

### Release History

See [Releases](https://github.com/canjs/canjs/releases).

### License

[MIT License](license.md).
