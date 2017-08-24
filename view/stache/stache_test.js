if (!System.isEnv('production')) {
	// Don't include in production mode until steal-clone works in production
	System.import('can-stache/test/stache-test');
}
require('can-stache-bindings/test/bindings-test');
