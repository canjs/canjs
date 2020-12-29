@page lsg-quickstart-generate Generating the Site
@parent lsg-quickstart-group-your-first-page 1

Now that you have your first page, you can generate the site for the first time. Open up a terminal in your project's directory and run:

```
> ./node_modules/.bin/documentjs
```

This will generate your Style Guide's site in the `styleguide` directory.

## Simple Command

If you want an easier way to run this command, first install DocumentJS globally (so it can be run anywhere on your computer):

```
> npm install -g documentjs
```

Now you can just run this command in any directory with a `documentjs.json` file:
```
> documentjs
```

## Viewing your Site

Now you just need a way to host your generated site from `styleguide`. If you're not sure how to do this and are on a Windows computer, you'll need to research it on your own. If you are using a Mac or a Linux machine, use a terminal navigate to the `styleguide` directory and use python to start a server:
```
> cd styleguide
> python -m SimpleHTTPServer
```

You should see something like the following:
```
Serving HTTP on 0.0.0.0 port 8000 ...
```

Open up a browser and navigate to `http://localhost:8000` (if the number above is not 8000, use whatever number you see in your terminal instead). You should see the page you just created!

## Automatically Detecting Changes

If you'd like DocumentJS to rebuild the site every time you make changes, you can use the `-w` (watch) flag while you're working on the site so you don't have to run the `documentjs` command every time:

```
> documentjs -w
```

[Next Page](/docs/lsg-quickstart-stylesheet.html)