@page lsg-quickstart-file-organization File Organization
@parent lsg-quickstart-group-setup 2

You'll write most of your documentation inline in your `css` or `less` files. You should add one file, `styleguide.md`, to your `styles` folder to write your landing page (and set up navigation).

For demos and examples, you may want to create a separate folder to make it easy to link to them later. Make sure not to put anything into the `styleguide` directory as it is automatically generated.

Your project's directory should will look something like this:

```
project/
    styles/
        base.less
        buttons.less
        variables.less
        styleguide.md
    demos/
        base/
            forms/
                demo.html
            tables/
                demo.html
            buttons/
                demo.html
        variables/
            color-palette/
                demo.html
    styleguide/
        <!-- Automatically generated directory -->
```

[Next Page](/docs/lsg-quickstart-creating-page.html)