/*funcunit@3.6.3#browser/open*/
define('funcunit/browser/open', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core',
    'syn/syn'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    var syn = require('syn/syn');
    if (FuncUnit.frameMode) {
        var ifrm = document.createElement('iframe');
        ifrm.id = 'funcunit_app';
        document.body.insertBefore(ifrm, document.body.firstChild);
    }
    var confirms = [], prompts = [], currentDocument, currentHref, appWin, lookingForNewDocument = false, urlWithoutHash = function (url) {
            return url.replace(/\#.*$/, '');
        }, isCurrentPage = function (url) {
            var pathname = urlWithoutHash(FuncUnit.win.location.pathname), href = urlWithoutHash(FuncUnit.win.location.href), url = urlWithoutHash(url);
            if (pathname === url || href === url) {
                return true;
            }
            return false;
        };
    $.extend(FuncUnit, {
        open: function (path, success, timeout) {
            if (typeof success != 'function') {
                timeout = success;
                success = undefined;
            }
            FuncUnit.add({
                method: function (success, error) {
                    if (typeof path === 'string') {
                        var fullPath = FuncUnit.getAbsolutePath(path);
                        FuncUnit._open(fullPath, error);
                        FuncUnit._onload(function () {
                            success();
                        }, error);
                    } else {
                        FuncUnit.win = path;
                        success();
                    }
                },
                success: success,
                error: 'Page ' + path + ' not loaded in time!',
                timeout: timeout || 30000
            });
        },
        _open: function (url) {
            FuncUnit.win = appWin;
            hasSteal = false;
            FuncUnit.frame = $('#funcunit_app').length ? $('#funcunit_app')[0] : null;
            if (newPage) {
                if (FuncUnit.frame) {
                    FuncUnit.win = FuncUnit.frame.contentWindow;
                    FuncUnit.win.location = url;
                } else {
                    var width = $(window).width();
                    FuncUnit.win = window.open(url, 'funcunit', 'height=1000,toolbar=yes,status=yes,width=' + width / 2 + ',left=' + width / 2);
                    if (FuncUnit.win && FuncUnit.win.___FUNCUNIT_OPENED) {
                        FuncUnit.win.close();
                        FuncUnit.win = window.open(url, 'funcunit', 'height=1000,toolbar=yes,status=yes,left=' + width / 2);
                    }
                    if (!FuncUnit.win) {
                        throw 'Could not open a popup window.  Your popup blocker is probably on.  Please turn it off and try again';
                    }
                }
                appWin = FuncUnit.win;
            } else {
                lookingForNewDocument = true;
                if (isCurrentPage(url)) {
                    FuncUnit.win.document.body.parentNode.removeChild(FuncUnit.win.document.body);
                    FuncUnit.win.location.hash = url.split('#')[1] || '';
                    FuncUnit.win.location.reload(true);
                } else {
                    FuncUnit.win.location = url;
                }
                currentDocument = null;
            }
            lookingForNewDocument = true;
        },
        confirm: function (answer) {
            confirms.push(!!answer);
        },
        prompt: function (answer) {
            prompts.push(answer);
        },
        _opened: function () {
            if (!this._isOverridden('alert')) {
                FuncUnit.win.alert = function () {
                };
            }
            if (!this._isOverridden('confirm')) {
                FuncUnit.win.confirm = function () {
                    var res = confirms.shift();
                    return res;
                };
            }
            if (!this._isOverridden('prompt')) {
                FuncUnit.win.prompt = function () {
                    return prompts.shift();
                };
            }
        },
        _isOverridden: function (type) {
            return !/(native code)|(source code not available)/.test(FuncUnit.win[type]);
        },
        _onload: function (success, error) {
            loadSuccess = function () {
                if (FuncUnit.win.steal) {
                    hasSteal = true;
                }
                if (!hasSteal) {
                    return success();
                }
                FuncUnit.win.steal.done().then(success);
            };
            if (!newPage) {
                return;
            }
            newPage = false;
            if (FuncUnit.support.readystate) {
                poller();
            } else {
                unloadLoader();
            }
        },
        getAbsolutePath: function (path) {
            if (/^\/\//.test(path)) {
                path = path.substr(2);
            }
            return path;
        },
        win: window,
        support: { readystate: 'readyState' in document },
        eval: function (str) {
            return FuncUnit.win.eval(str);
        },
        documentLoaded: function () {
            var loaded = FuncUnit.win.document.readyState === 'complete' && FuncUnit.win.location.href != 'about:blank' && FuncUnit.win.document.body;
            return loaded;
        },
        checkForNewDocument: function () {
            var documentFound = false;
            try {
                documentFound = (FuncUnit.win.document !== currentDocument && !FuncUnit.win.___FUNCUNIT_OPENED || currentHref != FuncUnit.win.location.href) && FuncUnit.documentLoaded();
            } catch (e) {
            }
            if (documentFound) {
                lookingForNewDocument = false;
                currentDocument = FuncUnit.win.document;
                currentHref = FuncUnit.win.location.href;
                FuncUnit.win.___FUNCUNIT_OPENED = true;
                FuncUnit._opened();
            }
            return documentFound;
        }
    });
    var newPage = true, hasSteal = false, unloadLoader, loadSuccess, firstLoad = true, onload = function () {
            FuncUnit.win.document.documentElement.tabIndex = 0;
            setTimeout(function () {
                FuncUnit.win.focus();
                var ls = loadSuccess;
                loadSuccess = null;
                if (ls) {
                    ls();
                }
            }, 0);
            syn.unbind(FuncUnit.win, 'load', onload);
        }, onunload = function () {
            FuncUnit.stop = true;
            removeListeners();
            setTimeout(unloadLoader, 0);
        }, removeListeners = function () {
            syn.unbind(FuncUnit.win, 'unload', onunload);
            Syn.unbind(FuncUnit.win, 'load', onload);
        };
    unloadLoader = function () {
        if (!firstLoad)
            removeListeners();
        syn.bind(FuncUnit.win, 'load', onload);
        syn.bind(FuncUnit.win, 'unload', onunload);
    };
    var newDocument = false, poller = function () {
            var ls;
            if (lookingForNewDocument && FuncUnit.checkForNewDocument()) {
                ls = loadSuccess;
                loadSuccess = null;
                if (ls) {
                    FuncUnit.win.focus();
                    FuncUnit.win.document.documentElement.tabIndex = 0;
                    ls();
                }
            }
            setTimeout(arguments.callee, 500);
        };
    $(window).unload(function () {
        if (FuncUnit.win && FuncUnit.win !== window.top) {
            FuncUnit.win.close();
        }
    });
    module.exports = FuncUnit;
});