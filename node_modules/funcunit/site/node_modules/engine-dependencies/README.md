[![Build Status](https://travis-ci.org/bitovi/engine-dependencies.svg?branch=master)](https://travis-ci.org/bitovi/engine-dependencies)
[![Build status](https://ci.appveyor.com/api/projects/status/yq4n7uwqj81osd5y/branch/master?svg=true)](https://ci.appveyor.com/project/matthewp/engine-dependencies/branch/master)
[![npm version](https://badge.fury.io/js/engine-dependencies.svg)](http://badge.fury.io/js/engine-dependencies)

# engine-dependencies

Specify package dependencies based on what version of Node you are using. Useful if you're trying to support Node 0.10.x, 0.12.x and IO.js.

## CLI

You can use engine-dependencies within your process as a post-install script. Just define your dependencies in the `engineDependencies` field of your package.json:

```json
{
	"name": "my-lib",
	"version": "1.0.0",
	"engineDependencies": {
		"node": {
			"0.12.x": {
				"devDependencies": {
					"semver": "^1.0.0"
				}
			}
		},
		"iojs": {
			"^3.0.0": {
				"semver": "2.0.0"
			}
		}
	}
	...
}
```

And then add to your scripts:

```json
{
	"name": "my-lib",
	"version": "1.0.0",
	"scripts": {
		"postInstall": "install-engine-dependencies my-lib"
	}
	...
}
```

## Node API

```js
engineDependencies({
	"node": {
		"0.10.x": {
			"devDependencies": {
				"jquery": "1.8.0"
			}
		},
		"0.12.x": {
			"jquery": "^1.11.2"
		}
	},
	"iojs": {
		"^3.0.0": {
			"devDependencies": {
				"jquery": "2.1.4"
			}
		}
	}
}, function(err){
	// all done
});
```

## License

MIT
