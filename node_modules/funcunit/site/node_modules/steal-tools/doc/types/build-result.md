@typedef {{}} steal-tools.BuildResult BuildResult
@parent steal-tools.types

The result if a [steal-tools.build multi-build].

@option {buildGraph} graph A map of moduleNames to node.

@option {steal} steal The steal function used to load the main module.

@option {Loader} loader The loader used to load the main module.

@option {Array} bundles The builds written out.

