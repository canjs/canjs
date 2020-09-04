/**
 * Node script that aggregates release notes for CanJS dependencies in one markdown note.
 * This note can be used for CanJS release notes or for general reference.
 * You’ll need a personal access token to run this script: https://github.com/blog/1509-personal-api-tokens
 * To execute:
 * node generate-release-notes.js <access token> <older version> <newer version>
 * // returns a string in markdown with the aggregated release notes.
 * Example usage with arguments:
 *     node generate-release-notes.js --token s1w5i2f2t --name "A tag name for the release" --pre true/false v3.8.1 v3.9.0
 *     // --pre argument is optional
 *     // returns a string in markdown with the all can-* dependency release notes between CanJS v3.8.1 and CanJS v3.9.0
 */

const getReleaseNotes = require('version-and-release');
const template = require('./release-template');
const parseArgs = require('minimist');
const { makeReleaseHandler } = require('./release-handler');

const args = parseArgs(process.argv.slice(2), {alias: {token: 'T'}});

const {
	_: [previousRelease, currentRelease],
	token,
	name
} = args;

const prerelease = typeof args.pre === 'undefined' ? args.pre : false;

const options = {
	token,
	owner: "canjs",
	repo: "canjs",
	template
};

const output = getReleaseNotes(previousRelease, currentRelease, options);

output.then(notes => {
	const releaseHandler = makeReleaseHandler(token);
	return releaseHandler.releaseWith({
		owner: options.owner,
		repo: options.repo,
		tag_name: currentRelease,
		name,
		prerelease,
		body: notes
	});
});
