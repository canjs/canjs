'use strict';
const stream = require('stream');
const zlib = require('zlib');
const duplexer = require('duplexer');
const pify = require('pify');

const getOptions = options => Object.assign({level: 9}, options);

module.exports = (input, cb, options) => {
	if (!input) {
		return Promise.resolve(0);
	}

	// TODO: Remove below comment when new XO release is out
	// eslint-disable-next-line no-unused-vars, unicorn/catch-error-name
	return pify(zlib.gzip)(input, getOptions(options)).then(data => data.length).catch(_ => 0);
};

module.exports.sync = (input, options) => zlib.gzipSync(input, getOptions(options)).length;

module.exports.stream = options => {
	const input = new stream.PassThrough();
	const output = new stream.PassThrough();
	const wrapper = duplexer(input, output);

	let gzipSize = 0;
	const gzip = zlib.createGzip(getOptions(options))
		.on('data', buf => {
			gzipSize += buf.length;
		})
		.on('error', () => {
			wrapper.gzipSize = 0;
		})
		.on('end', () => {
			wrapper.gzipSize = gzipSize;
			wrapper.emit('gzip-size', gzipSize);
			output.end();
		});

	input.pipe(gzip);
	input.pipe(output, {end: false});

	return wrapper;
};
