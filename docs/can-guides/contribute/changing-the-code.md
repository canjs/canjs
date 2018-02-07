@page guides/contributing/code Changing the Code
@parent guides/contribute 2

@description Learn how to contribute a code change to CanJS v3.

@body

Now that the [guides/contributing/legacy legacy branch] is set up, you can make changes in your local repository.


## Creating a new branch

Starting in the CanJS repository you have cloned to your computer, you can create a new branch:

```shell
git checkout -b your-branch-name 3.x-legacy
```

Replace `your-branch-name` with the name of your feature branch, e.g. `git checkout -b html5-fix` to create a `html5-fix` branch.

## Submitting a pull request

Once you’ve made your changes and run the tests, you can push your branch to GitHub:

```shell
git push origin your-branch-name
```

Make sure you replace `your-branch-name` with the name of your branch. For example, `git push origin html5-fix`.

Next, submit a pull request and set the "base" branch to `3.x-legacy`.
