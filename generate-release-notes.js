const util = require("util");
const execFile = util.promisify(require("child_process").execFile);
const GitHubApi = require("github");

// Default to canjs/canjs repo
const OWNER = 'canjs';
const REPO = 'canjs'


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

async function initialize() {
  const currentRelease = process.argv[3]
  const previousRelease = process.argv[2];

  const fileContents = await getPackageJsonByRelease(previousRelease, currentRelease);
  const updatedDependencies = getUpdatedDependencies(fileContents.previousRelease, fileContents.currentRelease);
  const allReleaseNotes = await getAllReleaseNotes(updatedDependencies);
  const aggregateReleaseNote = await createAggregateReleaseNote(allReleaseNotes, currentRelease);
  postReleaseNote(aggregateReleaseNote)
}

async function getPackageJsonByRelease(previousRelease, currentRelease) {
  // const { stdout } = await execFile("git", ["log", "--pretty=oneline", previousRelease + "..." + currentRelease]);
  // const logs = stdout.split("\n");
  // const previousTagSha = logs[0].slice(0,7);
  // const latest = logs[1].slice(0,7);
  let oldVerPackage;
  let newVerPackage;


  try {
    oldVerPackage = await getFileContentFromCommit('9db8f8c', "package.json");
    newVerPackage = await getFileContentFromCommit('bcf6c40', "package.json");
  } catch(err) {
    console.error('Error: getFileFileContentFromCommit', err);
  }
  //todo remove hardcoded
  // const oldVer = {
  //   "dependencies": {
  //     "can-util" : "3.10.0", 
  //     "can-stache-key": "0.0.4"
  //   }
  // };
  // const newVer = {
  //   "dependencies": {
  //     "can-util" : "3.10.6", 
  //     "can-stache-key": "0.1.0",
  //     "can-component": "3.3.4"
  //   }
  // };
  return {previousRelease: oldVerPackage, currentRelease: newVerPackage}
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
      tags.push(res.data[i]);

      if (diff.prevVer && currentRef === diff.prevVer || tags.length >= upperBound) break;
    }
    return tags;
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

      try {
        let release = await github.repos.getReleaseByTag({
          "owner": OWNER,
          "repo": package,
          "tag": version
        });

        if (release.data.name) {
          let title = release.data.name;
          let body = release.data.body;
          return `${package} ${version}: ${title} \n    - ${body || "none"}`;
        }

      } catch(err) {
        console.error(`${package} ${version}: getReleaseByTag Error Code ${err.code}: ${err.message} `);

        
      }
      // return `${package} ${version} doesn't have release notes`;
      return null;
    }));
  }));

  return releaseNotes;
}


function createAggregateReleaseNote(allReleaseNotes, currentRelease) {
  let releaseNote = `# ${OWNER}/${REPO} ${currentRelease} Release Notes \n`;
  Object.keys(allReleaseNotes).forEach(function(package) {
    releaseNote = `${releaseNote} \n## ${package} \n`;

    allReleaseNotes[package].forEach(function(note) {
      if (note) {
        releaseNote = `${releaseNote} - ${note} \n`; 
      }      
    })

  })

  releaseNote = `${releaseNote} \n ----`;
  return releaseNote;
  
}

function postReleaseNote(note) {
  console.log(note)
}

initialize();
