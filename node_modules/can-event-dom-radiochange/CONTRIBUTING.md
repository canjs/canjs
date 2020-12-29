# Contributing to can-event-dom-radiochange

## Developing Locally

This section will walk you through setting up the [repository](https://github.com/canjs/can-event-dom-radiochange) on your computer.

### Signing up for GitHub

If you don’t already have a GitHub account, you’ll need to [create a new one](https://help.github.com/articles/signing-up-for-a-new-github-account/).

### Forking & cloning the repository

A “fork” is a copy of a repository in your personal GitHub account. “Cloning” is the process of getting the repository’s source code on your computer.

GitHub has a guide for [forking a repo](https://help.github.com/articles/fork-a-repo/). To fork can-event-dom-radiochange, you can start by going to its [fork page](https://github.com/canjs/can-event-dom-radiochange/fork).

Next, you’ll want to clone the repo. [GitHub’s cloning guide](https://help.github.com/articles/cloning-a-repository/) explains how to do this on Linux, Mac, or Windows.

GitHub’s guide will [instruct you](https://help.github.com/articles/fork-a-repo/#step-2-create-a-local-clone-of-your-fork) to clone it with a command like:

```shell
git clone https://github.com/YOUR-USERNAME/can-event-dom-radiochange
```

Make sure you replace `YOUR-USERNAME` with your GitHub username.

### Installing the dependencies

After you’ve forked & cloned the repository, you’ll need to install the project’s dependencies.

First, make sure you’ve [installed Node.js and npm](https://docs.npmjs.com/getting-started/installing-node).

If you just cloned the repo from the command line, you’ll want to switch to the folder with your clone:

```shell
cd can-event-dom-radiochange
```

Next, install the project’s dependencies with npm:

```shell
npm install
```

### Starting the development server

Run the following to start a dev server:

```shell
npm run develop
```

### Running the tests

You can manually run this repository’s tests in any browser by starting the dev server (see the section above) and visiting this page: http://localhost:8080/test/test.html

Firefox is used to run the repository’s automated tests from the command line. If you don’t already have it, [download Firefox](https://www.mozilla.org/en-US/firefox/new/). Mozilla has guides for installing it on [Linux](https://support.mozilla.org/t5/Install-and-Update/Install-Firefox-on-Linux/ta-p/2516), [Mac](https://support.mozilla.org/t5/Install-and-Update/How-to-download-and-install-Firefox-on-Mac/ta-p/3453), and [Windows](https://support.mozilla.org/t5/Install-and-Update/How-to-download-and-install-Firefox-on-Windows/ta-p/2210).

After Firefox is installed, you can run:

```shell
npm test
```

### Making a build

Run the following command to create a build:

```shell
npm run build
```

This will create a `dist/` folder that contains the AMD, CommonJS, and global module versions of the project.

### Building the documentation

To generate the docs:

```shell
npm run document
```

This will create a `docs/` folder that contains a browsable site with all of your documentation.

With the dev server running, you can view the docs at http://localhost:8080/docs/

### Making a release

Run any of following commands to make a release:

```shell
npm version prerelease
npm version patch
npm version minor
npm version major
```

This will run the tests, make a build, bump the version number, and push the git
tag for the release.

See the [Making releases](https://canjs.com/doc/guides/contributing/releases.html#Makingreleases)
docs to learn how to decide which type of version you should release.
