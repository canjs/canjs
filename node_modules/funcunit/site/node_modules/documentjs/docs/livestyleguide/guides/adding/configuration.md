@page lsg-adding-configuration Configuration
@parent lsg-adding-group-setup 1

## Configuration

To generate a Live Style Guide, **you only need to configure two things**.

1. What stylesheet files are being documented
2. Where the Live Style Guide should be generated

## Current Configuration

Your project should already have a `documentjs.json` file.
Inside it, you'll probably see something like this:

```json
{
    "sites": {
        "docs": {
            "glob": "project/**/*.{js,md}"
            "dest": "api"
        }
    }
}
```

## Your Configuration

Add configuration for your Live Style Guide to the 
current configuration.

```json
{
    "sites": {
        "docs": {
            "glob": "project/**/*.{js,md}"
            "dest": "api"
        },
        "styles": {
            "glob": "styles/**/*.{css,less,md}",
            "dest": "styleguide"
        }
    }
}
```

### Site Name

From `documentjs.json`:
```json
        "styles" : {
```

This name is important because you're setting up a second documentation site alongside existing docs.


### Source Files

This is how DocumentJS knows where to look for comments and markdown files that it will use to generate the site. `glob` specifies a pattern for this.

From `documentjs.json`:
```json
            "glob": "styles/**/*.{css,less,md}",
```

This string uses a few different patterns to make sure everything important is included:

<table>
<thead>
<tr>
  <th>Context</th>
  <th>Pattern</th>
  <th>Meaning</th>
</tr>
</thead>
<tbody><tr>
  <td><code>styles/**/</code></td>
  <td><code>/**/</code></td>
  <td>All folders and subfolders of <code>styles</code> should be included</td>
</tr>
<tr>
  <td><code>*.{...}</code></td>
  <td><code>*</code></td>
  <td>All filenames are included</td>
</tr>
<tr>
  <td><code>*.{...}</code></td>
  <td><code>{css,less,md}</code></td>
  <td>Since {} takes a list, this is shorthand to match all of  <code>*.css</code>, <code>*.less</code>, <code>*.md</code></td>
</tr>
</tbody></table>


Altogether, `styles/**/*.{css,less,md}` means "look in all folders and subfolders of `styles` for any css, less, or markdown file". If you have additional directories or want to use different file types, this can be adapted accordingly like so:

```json
            "glob": "{styles,static/themes/css}/**/*.{css,scss,md}"
```

### Destination Directory

From `documentjs.json`:
```json
            "dest": "styleguide"
```

This is just the name of the folder where your site will be generated. Where you want this to be located will depend on the structure of your project.

[Next Page](/docs/lsg-adding-file-organization.html)