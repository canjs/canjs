@typedef {{}} steal-tools.BundleAssetsOptions BundleAssetsOptions
@parent steal-tools.types

Used to bundle your assets along with your JavaScript and CSS. Setting this option to `true` will bundle assets that are inferred from your project (such as CSS url()s) and placed into your dist folder.

@option {Boolean} [infer=true] Controls whether assets are inferred from the project's contents. Set to false if you want to manually select assets.

@option {Glob|Array<Glob>} glob A [glob](https://github.com/isaacs/node-glob) pattern (or Array of glob patterns) of files that need to be copied to the dist folder.
