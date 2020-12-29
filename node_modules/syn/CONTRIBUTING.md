# Contributing


Check out the [contribution guide on DoneJS.com](https://donejs.com/contributing.html) for information on:

- [Code of Conduct](https://donejs.com/contributing.html#section=section_CodeofConduct)
- [Getting Help](https://donejs.com/contributing.html#section=section_GettingHelp)
- [Project Organization](https://donejs.com/contributing.html#section=section_ProjectOrganization)
- [Reporting Bugs](https://donejs.com/contributing.html#section=section_ReportingBugs)
- [Suggesting Features](https://donejs.com/contributing.html#section=section_SuggestingFeatures)
- [Finding Ways to Contribute](https://donejs.com/contributing.html#section=section_FindingWaystoContribute)
	- [Finding open issues](https://donejs.com/contributing.html#section=section_Findingopenissues)
	- [Getting involved in the community](https://donejs.com/contributing.html#section=section_Gettinginvolvedinthecommunity)
	- [Spreading the word](https://donejs.com/contributing.html#section=section_Spreadingtheword)
- [Developing Locally](https://donejs.com/contributing.html#section=section_DevelopingLocally)
	- [Signing up for GitHub](https://donejs.com/contributing.html#section=section_SigningupforGitHub)
	- [Forking & cloning the repository](https://donejs.com/contributing.html#section=section_Forking_cloningtherepository)
	- [Installing the dependencies](https://donejs.com/contributing.html#section=section_Installingthedependencies)
	- [Running the tests](https://donejs.com/contributing.html#section=section_Runningthetests)
	- [Building the documentation](https://donejs.com/contributing.html#section=section_Buildingthedocumentation)
	- [Viewing the site](https://donejs.com/contributing.html#section=section_Viewingthesite)
- [Changing the Code](https://donejs.com/contributing.html#section=section_ChangingtheCode)
	- [Creating a new branch](https://donejs.com/contributing.html#section=section_Creatinganewbranch)
	- [Style guide](https://donejs.com/contributing.html#section=section_Styleguide)
	- [Updating the tests](https://donejs.com/contributing.html#section=section_Updatingtests)
	- [Updating the documentation](https://donejs.com/contributing.html#section=section_Updatingthedocumentation)
	- [Submitting a pull request](https://donejs.com/contributing.html#section=section_Submittingapullrequest)
- [Updating DoneJS.com](https://donejs.com/contributing.html#section=section_UpdatingDoneJS_com)
- [Evangelism](https://donejs.com/contributing.html#section=section_Evangelism)
	- [Writing a blog article](https://donejs.com/contributing.html#section=section_Writingablogarticle)
	- [Speaking at a conference or meetup](https://donejs.com/contributing.html#section=section_Speakingataconferenceormeetup)
	- [Organizing a DoneJS meetup](https://donejs.com/contributing.html#section=section_OrganizingaDoneJSmeetup)

The rest of this guide has information that’s specific to this repository.

## Developing Locally

### Forking & cloning the repository

```shell
git clone git@github.com:bitovi/syn.git
cd syn
```

### Installing the dependencies

```shell
npm install
```

### Running the tests

You can run the tests with:

```shell
npm test
```

### Making a build

You can create a new build in the `dist` folder with:

```shell
npm run build
```

## Changing the Code

All source files are in the _src_ folder.  Here's what each files does:

 - _browsers.js_ - Contains the output of _utils/recorder.html_ data.
 - _drag.js_ - Drag / drop utility.
 - _key.js_ - Typing and key event simulation.
 - _key.support.js_ - Feature detection of key event behavior.
 - _mouse.js_ - Click and mouse event simulation.
 - _mouse.support.js_ - Feature detection of mouse event behavior.
 - _syn.js_ - Main entrypoint that loads all other modules.
 - _synthtic.js_ - Creates the `syn` object and adds helpers used by other modules.
 - _typeable.js_ - Used to test if an element can be typed into.

Tests are in the _test_ folder.

 _utils/recorder.html_ is used to record behaviors of the browser that can not be feature detected.  Those
behaviors are added to _src/browser.js_.

### Updating tests

Please add a test within the _tests_ folder and make your changes to _syn.js_ source files in the _src_ 
folder. For a quick check that everything is working, open _test/test.html_.

After updating the tests, make sure you [run the tests](#running-the-tests).

## Publishing & Releasing

This project follows the [Semantic Versioning](http://semver.org/) guidelines in the form of `MAJOR.MINOR.PATCH` for:

- `MAJOR` version when you make incompatible API changes,
- `MINOR` version when you add functionality in a backwards-compatible manner, and
- `PATCH` version when you make backwards-compatible bug fixes.

Before making any release please make sure that:

- You have write access to this GitHub repository.
- Have an [npm](https://www.npmjs.com) account and are logged in on the CLI tool (`npm whoami`).
- Your user is a collaborator on npm. You can ask an existing collaborator to add you. Existing collaborators can be listed via `npm owner ls <packagename>` or on the [collaborators page on npm](https://www.npmjs.com/package/syn/access).

To make a release:

1. Switch to the `master` branch: `git checkout master`
2. Fetch all latest changes from the repository: `git fetch --all && git rebase`
3. Reinstall the Node modules: `npm cache clean && npm install`
4. Run `npm run release:<versiontype>`. For example, to make a `PATCH` release:

```
npm run release:patch
```

This will run the tests, build, bump the version number accordingly, and publish [the module to npm](https://www.npmjs.com/package/syn/).
