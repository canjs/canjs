/**
 * @property {{}} documentjs.process process
 * @parent DocumentJS.apis.internal
 * 
 * @group documentjs.process.methods 0 methods
 * @group documentjs.process.types 1 types
 * 
 * A collection of helpers used to process a file or source.
 * 
 * @body
 * 
 * ## Use
 * 
 *     var documentjs = require("documentjs");
 *     documentjs.process.file(...)
 */


exports.code = require("./code");
exports.comment = require("./comment");
exports.file = require("./file");
exports.codeAndComment = require("./code_and_comment");
exports.fileEventEmitter = require("./file_event_emitter");
exports.getComments = require("./get_comments");