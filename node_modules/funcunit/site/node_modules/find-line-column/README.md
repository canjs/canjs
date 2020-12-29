[![Build Status](https://travis-ci.org/duereg/find-line-column.svg?branch=master)](https://travis-ci.org/duereg/find-line-column)
[![devDependencies](https://david-dm.org/duereg/find-line-column/dev-status.png)](https://david-dm.org/duereg/find-line-column#info=devDependencies&view=table)
[![NPM version](https://badge.fury.io/js/find-line-column.svg)](http://badge.fury.io/js/find-line-column)


# find-line-column

npm module for finding the line/column position in a string

## Install

```shell
npm install find-line-column
```

## Use

```javascript
var position = require('find-line-column')("This sentence is short.\nThis one is too.", 29);
// position -> [{ line: 2, col: 5 }]
```

## License
MIT
