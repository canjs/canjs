const { Octokit } = require('@octokit/rest');

const makeReleaseHandler = (token, { baseUrl='https://api.github.com', userAgent='CanJS release handler'} = {}) => {
	const octokit = new Octokit({
		auth: token,
		userAgent,
		previews: [],
		baseUrl,
		log: {
			debug: () => {},
			info: () => {},
			warn: console.warn,
			error: console.error
		},
		request: {
		  agent: undefined,
		  fetch: undefined,
		  timeout: 0
		}
	});
	return  {
		releaseWith: (...args) => {
			return releaseWith.apply(null, [octokit, ...args]);
		}
	}
}

function releaseWith(octokit, params) {
	const {owner, repo, tag_name, name, prerelease, body} = params;
	return octokit.repos.createRelease({
		owner, 
		repo, 
		tag_name,
		name,
		prerelease, 
		body
	});
}

module.exports = {
	makeReleaseHandler
};