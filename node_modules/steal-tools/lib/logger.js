var util = require('util'),
	winston = require('winston'),
	Transport = winston.Transport;

require('colors');

var StealTransport = exports.StealTransport = function (options) {
	Transport.call(this, options);
};

util.inherits(StealTransport, Transport);

StealTransport.prototype.name = 'steal';

StealTransport.prototype.log = function (level, msg, meta, callback) {
	if (this.silent) {
		return callback(null, true);
	}

	var output = '';

	if (level === 'debug') {
		output += msg.grey;
	} else if (level === 'warn') {
		output += ('WARNING: ' + msg).yellow;
	} else if (level === 'error') {
		output += ('ERROR: ' + msg).red;
	} else {
		output += msg;
	}

	if (meta !== null && meta !== undefined) {
		if (meta && meta instanceof Error && meta.stack) {
			meta = meta.stack;
		}

		if (typeof meta !== 'object') {
			output += ' ' + meta;
		}
		else if (Object.keys(meta).length > 0) {
			output += ' ' + (
				this.options.prettyPrint ? ('\n' + util.inspect(meta, false, null, this.options.colorize))
					: exports.serialize(meta)
				);
		}
	}

	if (level === 'error' || level === 'debug') {
		process.stderr.write(output + '\n');
	} else {
		process.stdout.write(output + '\n');
	}

	this.emit('logged');
	callback(null, true);
};

function removeTransports(transports) {
	transports.forEach(function(transport) {
		try {
			winston.remove(transport);
		} catch (e) {
			// We can ignore errors when removing transports
		}
	});
}

/**
 * @param {Object} options Logging options passed from the user.
 * @param {Object} config System configuration object.
 */
exports.setup = function (options, config) {
	removeTransports([winston.transports.Console, StealTransport]);

	winston.add(StealTransport, {
		level: options.verbose ? 'debug' : 'info',
		colorize: true,
		silent: options.quiet && !options.verbose
	});

	if(options.quiet && config) {
		config.logLevel = 3;
		// Suppress warnings.
		if(options.watch || options.liveReload) {
			console.warn = function(){};
		}
	} else if(options.verbose && config) {
		config.logLevel = 0;
	}
};
