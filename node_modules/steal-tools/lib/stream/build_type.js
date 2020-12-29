var through = require("through2");

module.exports = function(type) {
    return through.obj(function(buildResult, enc, next) {
        try {
            buildResult.buildType = type;
            next(null, buildResult);
        } catch (err) {
            next(err);
        }
    });
};
