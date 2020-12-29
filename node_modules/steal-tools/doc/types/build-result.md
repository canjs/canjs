@typedef {{}} steal-tools.BuildResult BuildResult
@parent steal-tools.types

The result if a [steal-tools.build multi-build].

@option {buildGraph} graph A map of moduleNames to node.

@option {steal} steal The steal function used to load the main module.

@option {Loader} loader The loader used to load the main module.

@option {Array} bundles The builds written out.

@option {Configuration} configuration An object containing information about the build taking place. This is useful for plugins that might need information such as where the [bundlesPath] is. 

It contains:

* The [steal-tools.BuildOptions options] used to build.
* The Loader used internally to get the dependency graph.
* The *dest* folder that is being written to.
