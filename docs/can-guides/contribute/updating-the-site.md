@page guides/contributing/updating-the-site Updating the Site
@parent guides/contribute 10
@outline 2
@description How to update the CanJS website.

@body

## Update canjs.com

canjs.com is hosted on [GitHub pages](https://pages.github.com/) from the [canjs/canjs#gh-pages](https://github.com/canjs/canjs/tree/gh-pages) branch. To generate and push a new version of the website, verify you have push access to that branch. Then get all latest changes via:

```
git checkout master
git fetch --all && git rebase
npm cache clean
rm -rf node_modules
```

We also have to delete the local `gh-pages` branch:

```
git branch -D gh-pages
```

Then run

```
make
```

This will generate and publish a new version of the website.

## Update next.canjs.com

[next.canjs.com](https://next.canjs.com/) is hosted on [GitHub pages](https://pages.github.com/) from the [canjs/next#gh-pages](https://github.com/canjs/next/tree/gh-pages) branch. The [canjs/canjs major branch](https://github.com/canjs/canjs/tree/major) is [set up to push to the canjs/next repo](https://github.com/canjs/canjs/commit/2b0ff81a211701cc22f17743cf90236160a94390).

To generate and push a new version of the website, verify you have push access to that branch. Then get all latest changes via:

```
git checkout major
git fetch --all && git rebase
```

We also have to delete the local `gh-pages` branch:

```
git branch -D gh-pages
```

Then run

```
make
```

This will generate and publish a new version of the website.
