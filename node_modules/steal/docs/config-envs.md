@property {{}} config.envs envs
@parent StealJS.config

Specifies environment-specific configuration to be applied to the loader after [@config] has loaded.

@option {{}} An object of configuration values.

@body

Add `envs` configuration if you need it to be applied only when in a certain environment. This environment is controlled by [config.env]. For example you might want to apply a different [config.baseURL] if loading from a CDN in production, to do so you could do:

```js
steal.config({
	envs: {
		"window-production": {
			baseURL: "https://somecdn.com/my-app/"
		}
	}
});
```

**envs** can be sepecified with any of the approaches in [config.config].
