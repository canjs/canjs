@page guides/contributing/legacy Creating the Legacy Branch
@parent guides/contribute 1

@description Learn how to set up a branch for the `can-*` project you are interested in updating.

@body

CanJS projects should be set up with a branch named `<major version>.x-legacy` that can be used for making changes compatible with CanJS 3.x. For example, if `canjs@3` depends on `can-unicorn@3.5.3`, there should be a `3.x-legacy` branch for `can-unicorn`. If this branch does not exist yet, you can use the steps below to create it. 

> Note: this only applies to projects that bumped their major versions between `canjs@3` and `canjs@4`. If `canjs@3` and `canjs@4` depend on the same major version of the project you're working on, you can follow the contributing guidelines at [canjs.com](https://canjs.com/doc/guides/contribute.html).

## Find the latest tag

The new "legacy" branch should not be created from the `master` branch since it will contain changes in the new major version. To create a branch for the previous major version, you can use its [git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging).

To see the available tags, run this command from the git directory:

```
get fetch --tags
git tag
```

This will show a long list with entries like `v3.5.2`. You will use the final piece of this in the next step.


## Create the branch

Our release scripts create the tag on the `release` branch, so we actually want to use the first parent of the tag to create our new branch. To do this, we will append `^1` to the version number found in the previous step.

To create the new branch and check it out, run this command:

```
git checkout -b 3.x-legacy v3.5.2^1
```

## Update release scripts

There are a few changes that need to be made to the release scripts for legacy branches:

### Remove unneeded scripts

There is no need for `major` and `pre` scripts in legacy branches. These can be deleted.

### Prevent the `postpublish` branch from switching back to the `master` branch

The `postpublish` (or `postversion` in repos that were never corrected) has something like this:

```
&& get checkout master &&
```

This should be changed so that it switches back to the `3.x-legacy` branch instead:

```
&& git checkout - &&
```

### Make sure the package is published to the `3.x-legacy` tag in npm instead of the `latest` tag

In the `release:patch` and `release:minor` script, the `npm publish` commands should be changed so that they do not overwrite the `latest` tag when publishing to NPM:

```
"release:patch": "npm version patch && npm publish --tag 3.x-legacy",
"release:minor": "npm version minor && npm publish --tag 3.x-legacy",
 ```
