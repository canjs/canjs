/*syn@0.14.0#drag*/
define([
    'require',
    'exports',
    'module',
    './synthetic'
], function (require, exports, module) {
    var syn = require('./synthetic');
    var elementFromPoint = function (point, win) {
        var clientX = point.clientX;
        var clientY = point.clientY;
        if (point == null) {
            return null;
        }
        if (syn.support.elementFromPage) {
            var off = syn.helpers.scrollOffset(win);
            clientX = clientX + off.left;
            clientY = clientY + off.top;
        }
        return win.document.elementFromPoint(Math.round(clientX), Math.round(clientY));
    };
    var DragonDrop = {
        html5drag: false,
        focusWindow: null,
        dragAndDrop: function (focusWindow, fromPoint, toPoint, duration, callback) {
            this.currentDataTransferItem = null;
            this.focusWindow = focusWindow;
            this._mouseOver(fromPoint);
            this._mouseEnter(fromPoint);
            this._mouseMove(fromPoint);
            this._mouseDown(fromPoint);
            this._dragStart(fromPoint);
            this._drag(fromPoint);
            this._dragEnter(fromPoint);
            this._dragOver(fromPoint);
            DragonDrop.startMove(fromPoint, toPoint, duration, function () {
                DragonDrop._dragLeave(fromPoint);
                DragonDrop._dragEnd(fromPoint);
                DragonDrop._mouseOut(fromPoint);
                DragonDrop._mouseLeave(fromPoint);
                DragonDrop._drop(toPoint);
                DragonDrop._dragEnd(toPoint);
                DragonDrop._mouseOver(toPoint);
                DragonDrop._mouseEnter(toPoint);
                DragonDrop._mouseMove(toPoint);
                DragonDrop._mouseOut(toPoint);
                DragonDrop._mouseLeave(toPoint);
                callback();
                DragonDrop.cleanup();
            });
        },
        _dragStart: function (node, options) {
            this.createAndDispatchEvent(node, 'dragstart', options);
        },
        _drag: function (node, options) {
            this.createAndDispatchEvent(node, 'drag', options);
        },
        _dragEnter: function (node, options) {
            this.createAndDispatchEvent(node, 'dragenter', options);
        },
        _dragOver: function (node, options) {
            this.createAndDispatchEvent(node, 'dragover', options);
        },
        _dragLeave: function (node, options) {
            this.createAndDispatchEvent(node, 'dragleave', options);
        },
        _drop: function (node, options) {
            this.createAndDispatchEvent(node, 'drop', options);
        },
        _dragEnd: function (node, options) {
            this.createAndDispatchEvent(node, 'dragend', options);
        },
        _mouseDown: function (node, options) {
            this.createAndDispatchEvent(node, 'mousedown', options);
        },
        _mouseMove: function (node, options) {
            this.createAndDispatchEvent(node, 'mousemove', options);
        },
        _mouseEnter: function (node, options) {
            this.createAndDispatchEvent(node, 'mouseenter', options);
        },
        _mouseOver: function (node, options) {
            this.createAndDispatchEvent(node, 'mouseover', options);
        },
        _mouseOut: function (node, options) {
            this.createAndDispatchEvent(node, 'mouseout', options);
        },
        _mouseLeave: function (node, options) {
            this.createAndDispatchEvent(node, 'mouseleave', options);
        },
        createAndDispatchEvent: function (point, eventName, options) {
            if (point) {
                var targetElement = elementFromPoint(point, this.focusWindow);
                syn.trigger(targetElement, eventName, options);
            }
        },
        getDataTransferObject: function () {
            if (!this.currentDataTransferItem) {
                return this.currentDataTransferItem = this.createDataTransferObject();
            } else {
                return this.currentDataTransferItem;
            }
        },
        cleanup: function () {
            this.currentDataTransferItem = null;
            this.focusWindow = null;
        },
        createDataTransferObject: function () {
            var dataTransfer = {
                dropEffect: 'none',
                effectAllowed: 'uninitialized',
                files: [],
                items: [],
                types: [],
                data: [],
                setData: function (dataFlavor, value) {
                    var tempdata = {};
                    tempdata.dataFlavor = dataFlavor;
                    tempdata.val = value;
                    this.data.push(tempdata);
                },
                getData: function (dataFlavor) {
                    for (var i = 0; i < this.data.length; i++) {
                        var tempdata = this.data[i];
                        if (tempdata.dataFlavor === dataFlavor) {
                            return tempdata.val;
                        }
                    }
                }
            };
            return dataTransfer;
        },
        startMove: function (start, end, duration, callback) {
            var startTime = new Date();
            var distX = end.clientX - start.clientX;
            var distY = end.clientY - start.clientY;
            var win = this.focusWindow;
            var current = start;
            var cursor = win.document.createElement('div');
            var calls = 0;
            var move;
            move = function onmove() {
                var now = new Date();
                var scrollOffset = syn.helpers.scrollOffset(win);
                var fraction = (calls === 0 ? 0 : now - startTime) / duration;
                var options = {
                    clientX: distX * fraction + start.clientX,
                    clientY: distY * fraction + start.clientY
                };
                calls++;
                if (fraction < 1) {
                    syn.helpers.extend(cursor.style, {
                        left: options.clientX + scrollOffset.left + 2 + 'px',
                        top: options.clientY + scrollOffset.top + 2 + 'px'
                    });
                    current = DragonDrop.mouseMove(options, current);
                    syn.schedule(onmove, 15);
                } else {
                    current = DragonDrop.mouseMove(end, current);
                    win.document.body.removeChild(cursor);
                    callback();
                }
            };
            syn.helpers.extend(cursor.style, {
                height: '5px',
                width: '5px',
                backgroundColor: 'red',
                position: 'absolute',
                zIndex: 19999,
                fontSize: '1px'
            });
            win.document.body.appendChild(cursor);
            move();
        },
        mouseMove: function (thisPoint, previousPoint) {
            var thisElement = elementFromPoint(thisPoint, this.focusWindow);
            var previousElement = elementFromPoint(previousPoint, this.focusWindow);
            var options = syn.helpers.extend({}, thisPoint);
            if (thisElement !== previousElement) {
                options.relatedTarget = thisElement;
                this._dragLeave(previousPoint, options);
                options.relatedTarget = previousElement;
                this._dragEnter(thisPoint, options);
            }
            this._dragOver(thisPoint, options);
            return thisPoint;
        }
    };
    function createDragEvent(eventName, options, element) {
        var dragEvent = syn.create.mouse.event(eventName, options, element);
        dragEvent.dataTransfer = DragonDrop.getDataTransferObject();
        return syn.dispatch(dragEvent, element, eventName, false);
    }
    syn.create.dragstart = { event: createDragEvent };
    syn.create.dragenter = { event: createDragEvent };
    syn.create.dragover = { event: createDragEvent };
    syn.create.dragleave = { event: createDragEvent };
    syn.create.drag = { event: createDragEvent };
    syn.create.drop = { event: createDragEvent };
    syn.create.dragend = { event: createDragEvent };
    (function dragSupport() {
        if (!document.body) {
            syn.schedule(dragSupport, 1);
            return;
        }
        var div = document.createElement('div');
        document.body.appendChild(div);
        syn.helpers.extend(div.style, {
            width: '100px',
            height: '10000px',
            backgroundColor: 'blue',
            position: 'absolute',
            top: '10px',
            left: '0px',
            zIndex: 19999
        });
        document.body.scrollTop = 11;
        if (!document.elementFromPoint) {
            return;
        }
        var el = document.elementFromPoint(3, 1);
        if (el === div) {
            syn.support.elementFromClient = true;
        } else {
            syn.support.elementFromPage = true;
        }
        document.body.removeChild(div);
        document.body.scrollTop = 0;
    }());
    var mouseMove = function (point, win, last) {
            var el = elementFromPoint(point, win);
            if (last !== el && el && last) {
                var options = syn.helpers.extend({}, point);
                options.relatedTarget = el;
                if (syn.support.pointerEvents) {
                    syn.trigger(last, 'pointerout', options);
                    syn.trigger(last, 'pointerleave', options);
                }
                syn.trigger(last, 'mouseout', options);
                syn.trigger(last, 'mouseleave', options);
                options.relatedTarget = last;
                if (syn.support.pointerEvents) {
                    syn.trigger(el, 'pointerover', options);
                    syn.trigger(el, 'pointerenter', options);
                }
                syn.trigger(el, 'mouseover', options);
                syn.trigger(el, 'mouseenter', options);
            }
            if (syn.support.pointerEvents) {
                syn.trigger(el || win, 'pointermove', point);
            }
            if (syn.support.touchEvents) {
                syn.trigger(el || win, 'touchmove', point);
            }
            if (DragonDrop.html5drag) {
                if (!syn.support.pointerEvents) {
                    syn.trigger(el || win, 'mousemove', point);
                }
            } else {
                syn.trigger(el || win, 'mousemove', point);
            }
            return el;
        }, createEventAtPoint = function (event, point, win) {
            var el = elementFromPoint(point, win);
            syn.trigger(el || win, event, point);
            return el;
        }, startMove = function (win, start, end, duration, callback) {
            var startTime = new Date(), distX = end.clientX - start.clientX, distY = end.clientY - start.clientY, current = elementFromPoint(start, win), cursor = win.document.createElement('div'), calls = 0, move;
            move = function onmove() {
                var now = new Date(), scrollOffset = syn.helpers.scrollOffset(win), fraction = (calls === 0 ? 0 : now - startTime) / duration, options = {
                        clientX: distX * fraction + start.clientX,
                        clientY: distY * fraction + start.clientY
                    };
                calls++;
                if (fraction < 1) {
                    syn.helpers.extend(cursor.style, {
                        left: options.clientX + scrollOffset.left + 2 + 'px',
                        top: options.clientY + scrollOffset.top + 2 + 'px'
                    });
                    current = mouseMove(options, win, current);
                    syn.schedule(onmove, 15);
                } else {
                    current = mouseMove(end, win, current);
                    win.document.body.removeChild(cursor);
                    callback();
                }
            };
            syn.helpers.extend(cursor.style, {
                height: '5px',
                width: '5px',
                backgroundColor: 'red',
                position: 'absolute',
                zIndex: 19999,
                fontSize: '1px'
            });
            win.document.body.appendChild(cursor);
            move();
        }, startDrag = function (win, fromPoint, toPoint, duration, callback) {
            if (syn.support.pointerEvents) {
                createEventAtPoint('pointerover', fromPoint, win);
                createEventAtPoint('pointerenter', fromPoint, win);
            }
            createEventAtPoint('mouseover', fromPoint, win);
            createEventAtPoint('mouseenter', fromPoint, win);
            if (syn.support.pointerEvents) {
                createEventAtPoint('pointermove', fromPoint, win);
            }
            createEventAtPoint('mousemove', fromPoint, win);
            if (syn.support.pointerEvents) {
                createEventAtPoint('pointerdown', fromPoint, win);
            }
            if (syn.support.touchEvents) {
                createEventAtPoint('touchstart', fromPoint, win);
            }
            createEventAtPoint('mousedown', fromPoint, win);
            startMove(win, fromPoint, toPoint, duration, function () {
                if (syn.support.pointerEvents) {
                    createEventAtPoint('pointerup', toPoint, win);
                }
                if (syn.support.touchEvents) {
                    createEventAtPoint('touchend', toPoint, win);
                }
                createEventAtPoint('mouseup', toPoint, win);
                if (syn.support.pointerEvents) {
                    createEventAtPoint('pointerleave', toPoint, win);
                }
                createEventAtPoint('mouseleave', toPoint, win);
                callback();
            });
        }, center = function (el) {
            var j = syn.jquery()(el), o = j.offset();
            return {
                pageX: o.left + j.outerWidth() / 2,
                pageY: o.top + j.outerHeight() / 2
            };
        }, convertOption = function (option, win, from) {
            var page = /(\d+)[x ](\d+)/, client = /(\d+)X(\d+)/, relative = /([+-]\d+)[xX ]([+-]\d+)/, parts;
            if (typeof option === 'string' && relative.test(option) && from) {
                var cent = center(from);
                parts = option.match(relative);
                option = {
                    pageX: cent.pageX + parseInt(parts[1]),
                    pageY: cent.pageY + parseInt(parts[2])
                };
            }
            if (typeof option === 'string' && page.test(option)) {
                parts = option.match(page);
                option = {
                    pageX: parseInt(parts[1]),
                    pageY: parseInt(parts[2])
                };
            }
            if (typeof option === 'string' && client.test(option)) {
                parts = option.match(client);
                option = {
                    clientX: parseInt(parts[1]),
                    clientY: parseInt(parts[2])
                };
            }
            if (typeof option === 'string') {
                option = syn.jquery()(option, win.document)[0];
            }
            if (option.nodeName) {
                option = center(option);
            }
            if (option.pageX != null) {
                var off = syn.helpers.scrollOffset(win);
                option = {
                    clientX: option.pageX - off.left,
                    clientY: option.pageY - off.top
                };
            }
            return option;
        }, adjust = function (from, to, win) {
            if (from.clientY < 0) {
                var off = syn.helpers.scrollOffset(win);
                var top = off.top + from.clientY - 100, diff = top - off.top;
                if (top > 0) {
                } else {
                    top = 0;
                    diff = -off.top;
                }
                from.clientY = from.clientY - diff;
                to.clientY = to.clientY - diff;
                syn.helpers.scrollOffset(win, {
                    top: top,
                    left: off.left
                });
            }
        };
    syn.helpers.extend(syn.init.prototype, {
        _move: function (from, options, callback) {
            var win = syn.helpers.getWindow(from);
            var sourceCoordinates = convertOption(options.from || from, win, from);
            var destinationCoordinates = convertOption(options.to || options, win, from);
            DragonDrop.html5drag = syn.support.pointerEvents;
            if (options.adjust !== false) {
                adjust(sourceCoordinates, destinationCoordinates, win);
            }
            startMove(win, sourceCoordinates, destinationCoordinates, options.duration || 500, callback);
        },
        _drag: function (from, options, callback) {
            var win = syn.helpers.getWindow(from);
            var sourceCoordinates = convertOption(options.from || from, win, from);
            var destinationCoordinates = convertOption(options.to || options, win, from);
            if (options.adjust !== false) {
                adjust(sourceCoordinates, destinationCoordinates, win);
            }
            DragonDrop.html5drag = from.draggable;
            if (DragonDrop.html5drag) {
                DragonDrop.dragAndDrop(win, sourceCoordinates, destinationCoordinates, options.duration || 500, callback);
            } else {
                startDrag(win, sourceCoordinates, destinationCoordinates, options.duration || 500, callback);
            }
        }
    });
});