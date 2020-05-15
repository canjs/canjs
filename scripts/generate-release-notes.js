/**
 * Node script that aggregates release notes for CanJS dependencies in one markdown note.
 * This note can be used for CanJS release notes or for general reference.
 * You’ll need a personal access token to run this script: https://github.com/blog/1509-personal-api-tokens
 * To execute:
 * node generate-release-notes.js <access token> <older version> <newer version>
 * // returns a string in markdown with the aggregated release notes.
 * Example usage with arguments:
 *     node generate-release-notes.js s1w5i2f2t v3.8.1 v3.9.0
 *     // returns a string in markdown with the all can-* dependency release notes between CanJS v3.8.1 and CanJS v3.9.0
 * Without optional arguments:
 *     node generate-release-notes.js s1w5i2f2t
 * *     // returns a string in markdown with the all can-* dependency release notes between the most recent CanJS releases
 */

const getReleaseNotes = require('version-and-release');
const template = require('./release-template');

const options = {
	token: "9db8f9faffb06a05b75a71b32ac3c8c62f92f096",
	owner: "canjs",
	repo: "canjs",
	template
  };

const output = getReleaseNotes('v6.3.0', 'v6.4.0', options);

output.then(notes => {
	console.log(notes);
});
