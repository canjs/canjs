var loader = require("@loader");

global.postMessage({
	platform: loader.getPlatform(),
	env: loader.getEnv(),
	isProduction: loader.isEnv("production"),
	isWorker: loader.isPlatform("worker")
});
