/* global define:false, module:false */
import { Node, Element, Document, HTMLParser, HTMLSerializer, voidMap } from './simple-dom';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.SimpleDOM = factory();
  }
}(this, function () {
  return {
    Node: Node,
    Element: Element,
    Document: Document,
    voidMap: voidMap,
    HTMLSerializer: HTMLSerializer,
    HTMLParser: HTMLParser
  };
}));
