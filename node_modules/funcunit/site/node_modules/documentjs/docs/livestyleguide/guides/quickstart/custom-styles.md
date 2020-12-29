@page lsg-custom-styles Look and Feel
@parent lsg-quickstart-group-customizing 0

The default look and feel of your Live Style Guide is going to be similar to DocumentJS.com as it is using the default theme.

### Additional Configuration

You'll need to make a `style-guide-theme` folder and point to it in `documentjs.json` before you can start changing anything. You should also make a `styles` folder in that `theme` folder.

Updated directory structure:
```
project/
    styles/
        <!-- PROJECT styles are already here-->
    style-guide-theme/
        styles/
            <!-- LIVE STYLE GUIDE styles will go here -->
    demos/
        <!-- demos are here -->
    styleguide/
        <!-- Automatically generated directory -->
```

You'll need to tell DocumentJS to look for static resources in your theme folder.

Updated `documentjs.json`:
```json
{
    "siteDefaults": {
      "static": "style-guide-theme"
    },
    "sites": {
        "styles": {
            "glob": "styles/**/*.{md,less,md}",
            "parent": "style-guide",
            "dest": "./styleguide"
        }
    }
}
```

### Changing the Styles

To see DocumentJS default styles, look in `node_modules/documentjs/site/default/static/styles`. See the documentation for these styles in the [example Live Style Guide](/examples/styles/variables.less.html). To change any of these styles for your style guide, simply copy one of the files over to `style-guide-theme/styles` and make your changes.

If you'd like to add a new LESS file, simply copy over `styles.less` (which imports all the stylesheets) and `@@import` your new file. DocumentJS will automatically resolve default file imports for any files you don't copy over so don't worry about fixing the file paths for the `@@import` statement.