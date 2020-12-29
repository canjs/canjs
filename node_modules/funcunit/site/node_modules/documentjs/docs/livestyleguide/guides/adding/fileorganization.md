@page lsg-adding-file-organization File Organization
@parent lsg-adding-group-setup 2

You'll write most of your documentation inline in your `css` or `less` files. You should add one file, `styleguide.md`, to your `styles` folder to write your landing page (and set up navigation).

For demos and examples, you may want to create a separate folder to make it easy to link to them later. Make sure not to put anything into the `styleguide` directory as it is automatically generated.

Depending on your project and team, this is likely a good time to ask a developer for help (or just to double-check the changes you're making). For large applications, file organization becomes extremely important. Choices that seem insignificant (and may actually be insignificant) can still incur the wrath of (over-)opinionated engineers.

Your project's directory will probably look something like this:

```
project/
    <!-- the project's already-existing file structure -->
    folder1/
    folder2/
    folder3/
    <!-- the directory containing the project's stylesheets -->
    styles/
        base.less
        buttons.less
        variables.less
        styleguide.md
    <!-- live demos that we'll get to later -->
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

[Next Page](/docs/lsg-adding-next-steps.html)