var _assign = require("lodash/assign");
var clone = require("lodash/cloneDeep");
var makeStealConfig = require("./make_steal_config");
var options = clone(require("./options"));
var winston = require("winston");

module.exports = {
	command: "live-reload",

	builder: _assign({}, options, {
		"live-reload-port": {
			type: "string",
			default: 8012,
			describe: "Specify a port to use for the websocket server"
		},
		"ssl-key": {
			type: "string",
			default: null,
			describe: "Path to the private key of the server in PEM format"
		},
		"ssl-cert": {
			type: "string",
			default: null,
			describe: "Path to the certificate key of the server in PEM format"
		},
		"ssl-pfx": {
			type: "string",
			default: null,
			describe: "Path to the private key, certificate and CA certs of the server in PFX or PKCS12 format"
		}
	}),

	describe: "Start a live-reload Web Socket server",

	handler: function(argv) {
		var liveReload = require("../stream/live");

		var options = argv;
		var config = makeStealConfig(argv);

		if ((options.sslCert && !options.sslKey) || (options.sslKey && !options.sslCert)) {
			winston.error("ssl-key and ssl-cert are dependant and must be specified together".red);
			process.exit(1);
		}

		options.liveReload = true;
		options.quiet = true;
		liveReload(config, options);
	}
};
