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

const util = require("util");
const execFile = util.promisify(require("child_process").execFile);
const GitHubApi = require("github");
const semver = require("semver");

// Default to canjs/canjs repo
const OWNER = 'canjs';
const REPO = 'canjs'
const TOKEN = process.argv[2];


const github = new GitHubApi({
  "host": "api.github.com",
  "pathPrefix": "/repos",
  "protocol": "https",
  "headers": {
      "accept": "application/vnd.github.v3+json",
      "user-agent": OWNER
  },
  "requestMedia": "application/vnd.github.something-custom",
});

github.authenticate({
  type: "oauth",
  token: TOKEN
});

async function initialize() {
  const currentRelease = process.argv[4];
  const previousRelease = process.argv[3];

  const fileContents = await getPackageJsonByRelease(previousRelease, currentRelease);
  const updatedDependencies = getUpdatedDependencies(fileContents.previousRelease, fileContents.currentRelease);
  const allReleaseNotes = await getAllReleaseNotes(updatedDependencies);
  const aggregateReleaseNote = await createAggregateReleaseNote(allReleaseNotes, currentRelease);
  postReleaseNote(aggregateReleaseNote)
}

async function getPackageJsonByRelease(previousRelease, currentRelease) {
  const recentReleaseShas = [];
  let latestReleaseSha;
  let previousReleaseSha;

    // try to get the commit sha from the tags passed in
    // if not it defaults to the most recent release commits
    try {
      await execFile("git", ["fetch", "--tags"]);
      const { stdout } = await execFile("git", ["log", "--pretty=oneline", previousRelease + "..." + currentRelease]);
      const logs = stdout.split("\n");

      latestReleaseSha = logs[1].slice(0,7);
      previousReleaseSha = logs[logs.length-2].slice(0,7);

    } catch(err) {
      console.error("The release tags you have passed do not have a match. Using the two most recent releases instead.")
      try {
        const { stdout } = await execFile("git", ["log", "--pretty=oneline", "-30"]);
        const logs = stdout.split("\n");
        logs.forEach((log) => {
          if(log.slice(41) === "Update dist for release") {
            recentReleaseShas.push(log.slice(0, 7))
          }
        })
        latestReleaseSha = recentReleaseShas[0];
        previousReleaseSha = recentReleaseShas[1];
      } catch (err) {
        console.error('Error retrieving or matching the most recent release commits.')
      }
    }

  try {
    oldVerPackage = await getFileContentFromCommit(previousReleaseSha, "package.json");
    newVerPackage = await getFileContentFromCommit(latestReleaseSha, "package.json");
  } catch(err) {
    console.error('Error: getFileFileContentFromCommit', err);
  }
  return { previousRelease: oldVerPackage, currentRelease: newVerPackage };
}

async function getFileContentFromCommit(sha, filename) {

  if (sha === "latest") {
    const { stdout } = await execFile("cat", [filename]);
    return JSON.parse(stdout);
  } else {
    const revision = sha + ":" + filename;

    const { stdout } = await execFile("git", ["show", revision]);
    return JSON.parse(stdout);
  }
}

function getUpdatedDependencies(prevVer, currentVer) {
  let updatedDependencies = {};

  for (let key in currentVer.dependencies) {
    if (!prevVer.dependencies[key] || (prevVer.dependencies[key] !== currentVer.dependencies[key])) {
      updatedDependencies[key] = {
        currentVer: currentVer.dependencies[key],
        prevVer: prevVer.dependencies[key]
      };
    }
  }

  return updatedDependencies;
}

async function matchTags(repo, diff) {
  try {
    //the maximum number of match tags to return
    const upperBound = 10
    let tags = [];
    const res = await github.gitdata.getTags({ "owner": OWNER, "repo": repo });

    for (let i = res.data.length - 1; i >= 0; i--) {
      let currentRef = res.data[i].ref.split("/")[2].slice(1);

      if (diff.prevVer && currentRef === diff.prevVer || tags.length >= upperBound) break;

      tags.push(res.data[i]);
    }
    // sort in ascending order by ref
    return tags.sort((v1, v2) => semver.gt(v1.ref.slice(10), v2.ref.slice(10)));
  } catch(err) {
    console.error('Error in matchTags', err)
  }
}

async function getAllReleaseNotes(updatedDependencies) {
  const matchingTags = [];
  let releaseNotes = {};
  for (let key in updatedDependencies) {
    try {
      matchingTags[key] = await matchTags(key, updatedDependencies[key]);

    } catch(err) {
     console.error('Error in getAllReleaseNotes', err)
    }
  }

  await Promise.all(Object.keys(matchingTags).map(async function(package, index) {
    releaseNotes[package] = await Promise.all(matchingTags[package].map(async function(taggedRelease) {
      let version = taggedRelease.ref.split("/")[2];
	  let title = "";
	  let body = "";

      try {
        let release = await github.repos.getReleaseByTag({
          "owner": OWNER,
          "repo": package,
          "tag": version
        });

        if (release.data.name) {
          title = release.data.name;
          body = release.data.body;
        }

      } catch(err) {
        // console.error(`${package} ${version}: getReleaseByTag Error Code ${err.code}: ${err.message} `);
      }

      return `[${package} ${version}${title ? " - " + title : ""}](https://github.com/canjs/${package}/releases/tag/${version})${body ? "\n" + body : ""}`;
    }));
  }));

  return releaseNotes;
}


function createAggregateReleaseNote(allReleaseNotes, currentRelease) {
  let releaseNote = `# ${OWNER}/${REPO} ${currentRelease || 'INSERT VERSION HERE'} Release Notes \n`;

  Object.keys(allReleaseNotes).sort().forEach(function(package) {
    releaseNote = `${releaseNote} \n## [${package}](https://github.com/canjs/${package}/releases) \n`;

    allReleaseNotes[package].forEach(function(note) {
      if (note) {
        releaseNote = `${releaseNote} - ${note} \n`;
      }
    })

  })

  return releaseNote;
}

function postReleaseNote(note) {
  console.log(note);
}

initialize();
