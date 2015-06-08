/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*[global-shim-start]*/
!function(exports,global){var origDefine=global.define,get=function(e){var o,l=e.split("."),n=global;for(o=0;o<l.length&&n;o++)n=n[l[o]];return n},modules=global.define&&global.define.modules||global._define&&global._define.modules||{},ourDefine=global.define=function(e,o,l){var n;"function"==typeof o&&(l=o,o=[]);var i,r=[];for(i=0;i<o.length;i++)r.push(exports[o[i]]?get(exports[o[i]]):modules[o[i]]||get(o[i]));if(!o.length&&l.length){n={exports:{}};var t=function(e){return exports[e]?get(exports[e]):modules[e]};r.push(t,n.exports,n)}else r[0]||"exports"!==o[0]||(n={exports:{}},r[0]=n.exports,"module"===o[1]&&(r[1]=n));global.define=origDefine;var f=l?l.apply(null,r):void 0;global.define=ourDefine,modules[e]=n&&n.exports?n.exports:f};global.define.orig=origDefine,global.define.modules=modules,global.define.amd=!0,global.System={define:function(__name,__code){global.define=origDefine,eval("(function() { "+__code+" \n }).call(global);"),global.define=ourDefine},orig:global.System}}({},window);
/*can@2.3.0-pre.1#util/can*/
define("can/util/can",[],function(){var e="undefined"!=typeof window?window:global,n={};("undefined"==typeof GLOBALCAN||GLOBALCAN!==!1)&&(e.can=n),n.global=e,n.k=function(){},n.isDeferred=n.isPromise=function(e){return e&&"function"==typeof e.then&&"function"==typeof e.pipe},n.isMapLike=function(e){return n.Map&&(e instanceof n.Map||e&&e.__get)};var t=0;n.cid=function(e,n){return e._cid||(t++,e._cid=(n||"")+t),e._cid},n.VERSION="2.3.0-pre.1",n.simpleExtend=function(e,n){for(var t in n)e[t]=n[t];return e},n.last=function(e){return e&&e[e.length-1]},n.isDOM=function(e){return(e.ownerDocument||e)===n.global.document},n.childNodes=function(e){var n=e.childNodes;if("length"in n)return n;for(var t=e.firstChild,o=[];t;)o.push(t),t=t.nextSibling;return o};var o=Function.prototype.bind;return o?n.proxy=function(e,n){return o.call(e,n)}:n.proxy=function(e,n){return function(){return e.apply(n,arguments)}},n.frag=function(e,t){var o,r=t||n.document||n.global.document;return e&&"string"!=typeof e?11===e.nodeType?e:"number"==typeof e.nodeType?(o=r.createDocumentFragment(),o.appendChild(e),o):"number"==typeof e.length?(o=r.createDocumentFragment(),n.each(e,function(e){o.appendChild(n.frag(e))}),o):(o=n.buildFragment(""+e,r),n.childNodes(o).length||o.appendChild(r.createTextNode("")),o):(o=n.buildFragment(null==e?"":""+e,r),o.childNodes.length||o.appendChild(r.createTextNode("")),o)},n.scope=n.viewModel=function(e,t,o){e=n.$(e);var r=n.data(e,"scope")||n.data(e,"viewModel");switch(r||(r=new n.Map,n.data(e,"scope",r),n.data(e,"viewModel",r)),arguments.length){case 0:case 1:return r;case 2:return r.attr(t);default:return r.attr(t,o),e}},n["import"]=function(e){var t=new n.Deferred;return"object"==typeof window.System&&n.isFunction(window.System["import"])?window.System["import"](e).then(n.proxy(t.resolve,t),n.proxy(t.reject,t)):window.define&&window.define.amd?window.require([e],function(e){t.resolve(e)}):window.steal?steal.steal(e,function(e){t.resolve(e)}):window.require?t.resolve(window.require(e)):t.resolve(),t.promise()},n.__observe=function(){},n.isNode="object"==typeof process&&"[object process]"==={}.toString.call(process),n});
/*can@2.3.0-pre.1#util/attr/attr*/
define("can/util/attr/attr",["can/util/can"],function(t){var e=t.global.setImmediate||function(t){return setTimeout(t,0)},r={MutationObserver:t.global.MutationObserver||t.global.WebKitMutationObserver||t.global.MozMutationObserver,map:{"class":"className",value:"value",innertext:"innerText",textcontent:"textContent",checked:!0,disabled:!0,readonly:!0,required:!0,src:function(t,e){return null==e||""===e?(t.removeAttribute("src"),null):(t.setAttribute("src",e),e)},style:function(t,e){return t.style&&"cssText"in t.style?t.style.cssText=e||"":t.setAttribute("style",e)}},defaultValue:["input","textarea"],set:function(e,n,a){var u=t.isDOM(e)&&r.MutationObserver;n=n.toLowerCase();var i;u||(i=r.get(e,n));var o,s=e.nodeName.toString().toLowerCase(),l=r.map[n];"function"==typeof l?o=l(e,a):l===!0?(o=e[n]=!0,"checked"===n&&"radio"===e.type&&t.inArray(s,r.defaultValue)>=0&&(e.defaultChecked=!0)):l?(o=a,e[l]!==a&&(e[l]=a),"value"===l&&t.inArray(s,r.defaultValue)>=0&&(e.defaultValue=a)):(e.setAttribute(n,a),o=a),u||o===i||r.trigger(e,n,i)},trigger:function(r,n,a){return t.data(t.$(r),"canHasAttributesBindings")?(n=n.toLowerCase(),e(function(){t.trigger(r,{type:"attributes",attributeName:n,target:r,oldValue:a,bubbles:!1},[])})):void 0},get:function(t,e){e=e.toLowerCase();var n=r.map[e];return"string"==typeof n&&t[n]?t[n]:t.getAttribute(e)},remove:function(t,e){e=e.toLowerCase();var n;r.MutationObserver||(n=r.get(t,e));var a=r.map[e];"function"==typeof a&&a(t,void 0),a===!0?t[e]=!1:"string"==typeof a?t[a]="":t.removeAttribute(e),r.MutationObserver||null==n||r.trigger(t,e,n)},has:function(){var e=t.global.document&&document.createElement("div");return e&&e.hasAttribute?function(t,e){return t.hasAttribute(e)}:function(t,e){return null!==t.getAttribute(e)}}()};return r});
/*can@2.3.0-pre.1#event/event*/
define("can/event/event",["can/util/can"],function(t){return t.addEvent=function(t,n){var e=this.__bindEvents||(this.__bindEvents={}),i=e[t]||(e[t]=[]);return i.push({handler:n,name:t}),this},t.listenTo=function(n,e,i){var r=this.__listenToEvents;r||(r=this.__listenToEvents={});var s=t.cid(n),o=r[s];o||(o=r[s]={obj:n,events:{}});var a=o.events[e];a||(a=o.events[e]=[]),a.push(i),t.bind.call(n,e,i)},t.stopListening=function(n,e,i){var r=this.__listenToEvents,s=r,o=0;if(!r)return this;if(n){var a=t.cid(n);if((s={})[a]=r[a],!r[a])return this}for(var v in s){var l,h=s[v];n=r[v].obj,e?(l={})[e]=h.events[e]:l=h.events;for(var u in l){var d=l[u]||[];for(o=0;o<d.length;)i&&i===d[o]||!i?(t.unbind.call(n,u,d[o]),d.splice(o,1)):o++;d.length||delete h.events[u]}t.isEmptyObject(h.events)&&delete r[v]}return this},t.removeEvent=function(t,n,e){if(!this.__bindEvents)return this;for(var i,r=this.__bindEvents[t]||[],s=0,o="function"==typeof n;s<r.length;)i=r[s],(e?e(i,t,n):o&&i.handler===n||!o&&(i.cid===n||!n))?r.splice(s,1):s++;return this},t.dispatch=function(t,n){var e=this.__bindEvents;if(e){"string"==typeof t&&(t={type:t});var i=t.type,r=(e[i]||[]).slice(0),s=[t];n&&s.push.apply(s,n);for(var o=0,a=r.length;a>o;o++)r[o].handler.apply(this,s);return t}},t.one=function(n,e){var i=function(){return t.unbind.call(this,n,i),e.apply(this,arguments)};return t.bind.call(this,n,i),this},t.event={on:function(){return 0===arguments.length&&t.Control&&this instanceof t.Control?t.Control.prototype.on.call(this):t.addEvent.apply(this,arguments)},off:function(){return 0===arguments.length&&t.Control&&this instanceof t.Control?t.Control.prototype.off.call(this):t.removeEvent.apply(this,arguments)},bind:t.addEvent,unbind:t.removeEvent,delegate:function(n,e,i){return t.addEvent.call(this,e,i)},undelegate:function(n,e,i){return t.removeEvent.call(this,e,i)},trigger:t.dispatch,one:t.one,addEvent:t.addEvent,removeEvent:t.removeEvent,listenTo:t.listenTo,stopListening:t.stopListening,dispatch:t.dispatch},t.event});
/*can@2.3.0-pre.1#util/array/each*/
define("can/util/array/each",["can/util/can"],function(t){var e=function(t){var e="length"in t&&t.length;return"function"!=typeof arr&&(0===e||"number"==typeof e&&e>0&&e-1 in t)};return t.each=function(n,a,r){var f,i,l,c=0;if(n)if(e(n))if(t.List&&n instanceof t.List)for(i=n.attr("length");i>c&&(l=n.attr(c),a.call(r||l,l,c,n)!==!1);c++);else for(i=n.length;i>c&&(l=n[c],a.call(r||l,l,c,n)!==!1);c++);else if("object"==typeof n)if(t.Map&&n instanceof t.Map||n===t.route){var o=t.Map.keys(n);for(c=0,i=o.length;i>c&&(f=o[c],l=n.attr(f),a.call(r||l,l,f,n)!==!1);c++);}else for(f in n)if(n.hasOwnProperty(f)&&a.call(r||n[f],n[f],f,n)===!1)break;return n},t});
/*can@2.3.0-pre.1#util/inserted/inserted*/
define("can/util/inserted/inserted",["can/util/can"],function(e){e.inserted=function(n,r){if(n.length){n=e.makeArray(n);for(var i,t,a=r||n[0].ownerDocument||n[0],d=!1,o=e.$(a.contains?a:a.body),s=0;void 0!==(t=n[s]);s++){if(!d){if(!t.getElementsByTagName)continue;if(!e.has(o,t).length)return;d=!0}if(d&&t.getElementsByTagName){i=e.makeArray(t.getElementsByTagName("*")),e.trigger(t,"inserted",[],!1);for(var f,c=0;void 0!==(f=i[c]);c++)e.trigger(f,"inserted",[],!1)}}}},e.appendChild=function(n,r,i){var t;t=11===r.nodeType?e.makeArray(e.childNodes(r)):[r],n.appendChild(r),e.inserted(t,i)},e.insertBefore=function(n,r,i,t){var a;a=11===r.nodeType?e.makeArray(r.childNodes):[r],n.insertBefore(r,i),e.inserted(a,t)}});
/*can@2.3.0-pre.1#util/jquery/jquery*/
define("can/util/jquery/jquery",["dist/jquery","can/util/can","can/util/attr/attr","can/event/event","can/util/array/each","can/util/inserted/inserted"],function(t,e,n,r){var i=function(t){return t.nodeName&&(1===t.nodeType||9===t.nodeType)||t==window};t=t||window.jQuery,t.extend(e,t,{trigger:function(n,r,a,s){i(n)?t.event.trigger(r,a,n,!s):n.trigger?n.trigger(r,a):("string"==typeof r&&(r={type:r}),r.target=r.target||n,a&&(a.length&&"string"==typeof a?a=[a]:a.length||(a=[a])),a||(a=[]),e.dispatch.call(n,r,a))},event:e.event,addEvent:e.addEvent,removeEvent:e.removeEvent,buildFragment:function(e,n){var r;return e=[e],n=n||document,n=!n.nodeType&&n[0]||n,n=n.ownerDocument||n,r=t.buildFragment(e,n),r.cacheable?t.clone(r.fragment):r.fragment||r},$:t,each:e.each,bind:function(n,r){return this.bind&&this.bind!==e.bind?this.bind(n,r):i(this)?t.event.add(this,n,r):e.addEvent.call(this,n,r),this},unbind:function(n,r){return this.unbind&&this.unbind!==e.unbind?this.unbind(n,r):i(this)?t.event.remove(this,n,r):e.removeEvent.call(this,n,r),this},delegate:function(n,r,a){return this.delegate?this.delegate(n,r,a):i(this)?t(this).delegate(n,r,a):e.bind.call(this,r,a),this},undelegate:function(n,r,a){return this.undelegate?this.undelegate(n,r,a):i(this)?t(this).undelegate(n,r,a):e.unbind.call(this,r,a),this},proxy:e.proxy,attr:n}),e.on=e.bind,e.off=e.unbind,t.each(["append","filter","addClass","remove","data","get","has"],function(t,n){e[n]=function(t){return t[n].apply(t,e.makeArray(arguments).slice(1))}});var a=t.cleanData;t.cleanData=function(n){t.each(n,function(t,n){n&&e.trigger(n,"removed",[],!1)}),a(n)};var s,u=t.fn.domManip;t.fn.domManip=function(t,e,n){for(var r=1;r<arguments.length;r++)if("function"==typeof arguments[r]){s=r;break}return u.apply(this,arguments)},t(document.createElement("div")).append(document.createElement("div")),t.fn.domManip=2===s?function(t,n,r){return u.call(this,t,n,function(t){var n;11===t.nodeType&&(n=e.makeArray(e.childNodes(t)));var i=r.apply(this,arguments);return e.inserted(n?n:[t]),i})}:function(t,n){return u.call(this,t,function(t){var r;11===t.nodeType&&(r=e.makeArray(e.childNodes(t)));var i=n.apply(this,arguments);return e.inserted(r?r:[t]),i})};var d=t.attr;t.attr=function(t,n){if(e.isDOM(t)&&e.attr.MutationObserver)return d.apply(this,arguments);var r,i;arguments.length>=3&&(r=d.call(this,t,n));var a=d.apply(this,arguments);return arguments.length>=3&&(i=d.call(this,t,n)),i!==r&&e.attr.trigger(t,n,r),a};var o=t.removeAttr;return t.removeAttr=function(t,n){if(e.isDOM(t)&&e.attr.MutationObserver)return o.apply(this,arguments);var r=d.call(this,t,n),i=o.apply(this,arguments);return null!=r&&e.attr.trigger(t,n,r),i},t.event.special.attributes={setup:function(){if(e.isDOM(this)&&e.attr.MutationObserver){var t=this,n=new e.attr.MutationObserver(function(n){n.forEach(function(n){var r=e.simpleExtend({},n);e.trigger(t,r,[])})});n.observe(this,{attributes:!0,attributeOldValue:!0}),e.data(e.$(this),"canAttributesObserver",n)}else e.data(e.$(this),"canHasAttributesBindings",!0)},teardown:function(){e.isDOM(this)&&e.attr.MutationObserver?(e.data(e.$(this),"canAttributesObserver").disconnect(),t.removeData(this,"canAttributesObserver")):t.removeData(this,"canHasAttributesBindings")}},function(){var t="<-\n>",n=e.buildFragment(t,document);if(n.firstChild&&t!==n.firstChild.nodeValue){var r=e.buildFragment;e.buildFragment=function(t,e){var n=r(t,e);return 1===n.childNodes.length&&3===n.childNodes[0].nodeType&&(n.childNodes[0].nodeValue=t),n}}}(),t.event.special.inserted={},t.event.special.removed={},e});
/*can@2.3.0-pre.1#util/util*/
define("can/util/util",["can/util/jquery/jquery"],function(u){return u});
/*can@2.3.0-pre.1#view/view*/
define("can/view/view",["can/util/util"],function(e){var r=e.isFunction,n=e.makeArray,t=1,i=function(e){var r=function(){return c.frag(e.apply(this,arguments))};return r.render=function(){return e.apply(e,arguments)},r},u=function(e,r){if(!e.length)throw"can.view: No template or empty template:"+r},a=function(n,t){if(r(n)){var i=e.Deferred();return i.resolve(n)}var a,o,d,f="string"==typeof n?n:n.url,s=n.engine&&"."+n.engine||f.match(/\.[\w\d]+$/);if(f.match(/^#/)&&(f=f.substr(1)),(o=document.getElementById(f))&&(s="."+o.type.match(/\/(x\-)?(.+)/)[2]),s||c.cached[f]||(f+=s=c.ext),e.isArray(s)&&(s=s[0]),d=c.toId(f),f.match(/^\/\//)&&(f=f.substr(2),f=window.steal?steal.config().root.mapJoin(""+steal.id(f)):f),window.require&&require.toUrl&&(f=require.toUrl(f)),a=c.types[s],c.cached[d])return c.cached[d];if(o)return c.registerView(d,o.innerHTML,a);var p=new e.Deferred;return e.ajax({async:t,url:f,dataType:"text",error:function(e){u("",f),p.reject(e)},success:function(e){u(e,f),c.registerView(d,e,a,p)}}),p},o=function(r){var n=[];if(e.isDeferred(r))return[r];for(var t in r)e.isDeferred(r[t])&&n.push(r[t]);return n},d=function(r){return e.isArray(r)&&"success"===r[1]?r[0]:r},c=e.view=e.template=function(e,n,t,i){return r(t)&&(i=t,t=void 0),c.renderAs("fragment",e,n,t,i)};return e.extend(c,{frag:function(e,r){return c.hookup(c.fragment(e),r)},fragment:function(r){if("string"!=typeof r&&11===r.nodeType)return r;var n=e.buildFragment(r,document.body);return n.childNodes.length||n.appendChild(document.createTextNode("")),n},toId:function(r){return e.map(r.toString().split(/\/|\./g),function(e){return e?e:void 0}).join("_")},toStr:function(e){return null==e?"":""+e},hookup:function(r,n){var t,i,u=[];return e.each(r.childNodes?e.makeArray(r.childNodes):r,function(r){1===r.nodeType&&(u.push(r),u.push.apply(u,e.makeArray(r.getElementsByTagName("*"))))}),e.each(u,function(e){e.getAttribute&&(t=e.getAttribute("data-view-id"))&&(i=c.hookups[t])&&(i(e,n,t),delete c.hookups[t],e.removeAttribute("data-view-id"))}),r},hookups:{},hook:function(e){return c.hookups[++t]=e," data-view-id='"+t+"'"},cached:{},cachedRenderers:{},cache:!0,register:function(r){this.types["."+r.suffix]=r,e[r.suffix]=c[r.suffix]=function(e,n){var t,u;if(!n)return u=function(){return t||(t=r.fragRenderer?r.fragRenderer(null,e):i(r.renderer(null,e))),t.apply(this,arguments)},u.render=function(){var n=r.renderer(null,e);return n.apply(n,arguments)},u;var a=function(){return t||(t=r.fragRenderer?r.fragRenderer(e,n):r.renderer(e,n)),t.apply(this,arguments)};return r.fragRenderer?c.preload(e,a):c.preloadStringRenderer(e,a)}},types:{},ext:".ejs",registerScript:function(e,r,n){return"can.view.preloadStringRenderer('"+r+"',"+c.types["."+e].script(r,n)+");"},preload:function(r,n){var t=c.cached[r]=(new e.Deferred).resolve(function(e,r){return n.call(e,e,r)});return t.__view_id=r,c.cachedRenderers[r]=n,n},preloadStringRenderer:function(e,r){return this.preload(e,i(r))},render:function(r,n,t,i){return e.view.renderAs("string",r,n,t,i)},renderTo:function(e,r,n,t){return("string"===e&&r.render?r.render:r)(n,t)},renderAs:function(t,i,u,f,s){r(f)&&(s=f,f=void 0);var p,l,h,g,v,m=o(u);if(m.length)return l=new e.Deferred,h=e.extend({},u),m.push(a(i,!0)),e.when.apply(e,m).then(function(r){var i,a=n(arguments),o=a.pop();if(e.isDeferred(u))h=d(r);else for(var c in u)e.isDeferred(u[c])&&(h[c]=d(a.shift()));i=e.view.renderTo(t,o,h,f),l.resolve(i,h),s&&s(i,h)},function(){l.reject.apply(l,arguments)}),l;if(p=e.__clearReading(),g=r(s),l=a(i,g),p&&e.__setReading(p),g)v=l,l.then(function(r){s(u?e.view.renderTo(t,r,u,f):r)});else{if("resolved"===l.state()&&l.__view_id){var w=c.cachedRenderers[l.__view_id];return u?e.view.renderTo(t,w,u,f):w}l.then(function(r){v=u?e.view.renderTo(t,r,u,f):r})}return v},registerView:function(r,n,t,u){var a,o="object"==typeof t?t:c.types[t||c.ext];return a=o.fragRenderer?o.fragRenderer(r,n):i(o.renderer(r,n)),u=u||new e.Deferred,c.cache&&(c.cached[r]=u,u.__view_id=r,c.cachedRenderers[r]=a),u.resolve(a)},simpleHelper:function(r){return function(){var n=[];return e.each(arguments,function(e,r){if(r<=arguments.length){for(;e&&e.isComputed;)e=e();n.push(e)}}),r.apply(this,n)}}}),e});
/*can@2.3.0-pre.1#view/callbacks/callbacks*/
define("can/view/callbacks/callbacks",["can/util/util","can/view/view"],function(t){var e=t.view.attr=function(t,e){if(!e){var i=a[t];if(!i)for(var l=0,n=r.length;n>l;l++){var s=r[l];if(s.match.test(t)){i=s.handler;break}}return i}"string"==typeof t?a[t]=e:r.push({match:t,handler:e})},a={},r=[],i=/[-\:]/,l=t.view.tag=function(e,a){if(!a){var r=n[e.toLowerCase()];return!r&&i.test(e)&&(r=function(){}),r}t.global.html5&&(t.global.html5.elements+=" "+e,t.global.html5.shivDocument()),n[e.toLowerCase()]=a},n={};return t.view.callbacks={_tags:n,_attributes:a,_regExpAttributes:r,tag:l,attr:e,tagHandler:function(e,a,r){var i,l=r.options.attr("tags."+a),s=l||n[a],c=r.scope;if(s){var o=t.__clearObserved();i=s(e,r),t.__setObserved(o)}else i=c;if(i&&r.subtemplate){c!==i&&(c=c.add(i));var v=r.subtemplate(c,r.options),f="string"==typeof v?t.view.frag(v):v;t.appendChild(e,f)}}},t.view.callbacks});
/*can@2.3.0-pre.1#view/elements*/
define("can/view/elements",["can/util/util","can/view/view"],function(t){var e="undefined"!=typeof document?document:null,n=e&&function(){return 1===t.$(document.createComment("~")).length}(),o={tagToContentPropMap:{option:e&&"textContent"in document.createElement("option")?"textContent":"innerText",textarea:"value"},attrMap:t.attr.map,attrReg:/([^\s=]+)[\s]*=[\s]*/,defaultValue:t.attr.defaultValue,tagMap:{"":"span",colgroup:"col",table:"tbody",tr:"td",ol:"li",ul:"li",tbody:"tr",thead:"tr",tfoot:"tr",select:"option",optgroup:"option"},reverseTagMap:{col:"colgroup",tr:"tbody",option:"select",td:"tr",th:"tr",li:"ul"},getParentNode:function(t,e){return e&&11===t.parentNode.nodeType?e:t.parentNode},setAttr:t.attr.set,getAttr:t.attr.get,removeAttr:t.attr.remove,contentText:function(t){return"string"==typeof t?t:t||0===t?""+t:""},after:function(e,n){var o=e[e.length-1];o.nextSibling?t.insertBefore(o.parentNode,n,o.nextSibling,t.document):t.appendChild(o.parentNode,n,t.document)},replace:function(e,r){o.after(e,r),t.remove(t.$(e)).length<e.length&&!n&&t.each(e,function(t){8===t.nodeType&&t.parentNode.removeChild(t)})}};return t.view.elements=o,o});
/*can@2.3.0-pre.1#util/string/string*/
define("can/util/string/string",["can/util/util"],function(e){var r=/_|-/,n=/\=\=/,t=/([A-Z]+)([A-Z][a-z])/g,a=/([a-z\d])([A-Z])/g,u=/([a-z\d])([A-Z])/g,i=/\{([^\}]+)\}/g,c=/"/g,o=/'/g,l=/-+(.)?/g,p=/[a-z][A-Z]/g,f=function(e,r,n){var t=e[r];return void 0===t&&n===!0&&(t=e[r]={}),t},g=function(e){return/^f|^o/.test(typeof e)},d=function(e){var r=null===e||void 0===e||isNaN(e)&&""+e=="NaN";return""+(r?"":e)};return e.extend(e,{esc:function(e){return d(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(c,"&#34;").replace(o,"&#39;")},getObject:function(r,n,t){var a,u,i,c,o=r?r.split("."):[],l=o.length,p=0;if(n=e.isArray(n)?n:[n||window],c=n.length,!l)return n[0];for(p;c>p;p++){for(a=n[p],i=void 0,u=0;l>u&&g(a);u++)i=a,a=f(i,o[u]);if(void 0!==i&&void 0!==a)break}if(t===!1&&void 0!==a&&delete i[o[u-1]],t===!0&&void 0===a)for(a=n[0],u=0;l>u&&g(a);u++)a=f(a,o[u],!0);return a},capitalize:function(e,r){return e.charAt(0).toUpperCase()+e.slice(1)},camelize:function(e){return d(e).replace(l,function(e,r){return r?r.toUpperCase():""})},hyphenate:function(e){return d(e).replace(p,function(e,r){return e.charAt(0)+"-"+e.charAt(1).toLowerCase()})},underscore:function(e){return e.replace(n,"/").replace(t,"$1_$2").replace(a,"$1_$2").replace(u,"_").toLowerCase()},sub:function(r,n,t){var a=[];return r=r||"",a.push(r.replace(i,function(r,u){var i=e.getObject(u,n,t===!0?!1:void 0);return void 0===i||null===i?(a=null,""):g(i)&&a?(a.push(i),""):""+i})),null===a?a:a.length<=1?a[0]:a},replacer:i,undHash:r}),e});
/*can@2.3.0-pre.1#construct/construct*/
define("can/construct/construct",["can/util/string/string"],function(t){var n,r=0;try{Object.getOwnPropertyDescriptor({}),n=!0}catch(e){n=!1}var o=function(t,n){var r=Object.getOwnPropertyDescriptor(t,n);return r&&(r.get||r.set)?r:null},u=function(n,r,e){e=e||n;var u;for(var i in n)(u=o(n,i))?this._defineProperty(e,r,i,u):t.Construct._overwrite(e,r,i,n[i])},i=function(n,r,e){e=e||n;for(var o in n)t.Construct._overwrite(e,r,o,n[o])};return t.Construct=function(){return arguments.length?t.Construct.extend.apply(t.Construct,arguments):void 0},t.extend(t.Construct,{constructorExtends:!0,newInstance:function(){var t,n=this.instance();return n.setup&&(t=n.setup.apply(n,arguments)),n.init&&n.init.apply(n,t||arguments),n},_inherit:n?u:i,_defineProperty:function(t,n,r,e){Object.defineProperty(t,r,e)},_overwrite:function(t,n,r,e){t[r]=e},setup:function(n,r){this.defaults=t.extend(!0,{},n.defaults,this.defaults)},instance:function(){r=1;var t=new this;return r=0,t},extend:function(n,e,o){function u(){return r?void 0:this.constructor!==a&&arguments.length&&a.constructorExtends?a.extend.apply(a,arguments):a.newInstance.apply(a,arguments)}var i=n,s=e,c=o;"string"!=typeof i&&(c=s,s=i,i=null),c||(c=s,s=null),c=c||{};var a,p,f,l,d,y,g,h,v,m=this,w=this.prototype;v=this.instance(),t.Construct._inherit(c,w,v),i&&(p=i.split("."),g=p.pop()),"undefined"==typeof constructorName&&(a=function(){return u.apply(this,arguments)});for(y in m)m.hasOwnProperty(y)&&(a[y]=m[y]);t.Construct._inherit(s,m,a),i&&(f=t.getObject(p.join("."),window,!0),h=f,l=t.underscore(i.replace(/\./g,"_")),d=t.underscore(g),f[g]=a),t.extend(a,{constructor:a,prototype:v,namespace:h,_shortName:d,fullName:i,_fullName:l}),void 0!==g&&(a.shortName=g),a.prototype.constructor=a;var C=[m].concat(t.makeArray(arguments)),_=a.setup.apply(a,C);return a.init&&a.init.apply(a,_||C),a}}),t.Construct.prototype.setup=function(){},t.Construct.prototype.init=function(){},t.Construct});
/*can@2.3.0-pre.1#control/control*/
define("can/control/control",["can/util/util","can/construct/construct"],function(t){var n,e=function(n,e,o){return t.bind.call(n,e,o),function(){t.unbind.call(n,e,o)}},o=t.isFunction,s=t.extend,i=t.each,r=[].slice,u=/\{([^\}]+)\}/g,c=t.getObject("$.event.special",[t])||{},l=function(n,e,o,s){return t.delegate.call(n,e,o,s),function(){t.undelegate.call(n,e,o,s)}},a=function(n,o,s,i){return i?l(n,t.trim(i),o,s):e(n,o,s)},h=t.Control=t.Construct({setup:function(){if(t.Construct.setup.apply(this,arguments),t.Control){var n,e=this;e.actions={};for(n in e.prototype)e._isAction(n)&&(e.actions[n]=e._action(n))}},_shifter:function(n,e){var s="string"==typeof e?n[e]:e;return o(s)||(s=n[s]),function(){return n.called=e,s.apply(n,[this.nodeName?t.$(this):this].concat(r.call(arguments,0)))}},_isAction:function(t){var n=this.prototype[t],e=typeof n;return"constructor"!==t&&("function"===e||"string"===e&&o(this.prototype[n]))&&!!(c[t]||f[t]||/[^\w]/.test(t))},_action:function(e,o){if(u.lastIndex=0,o||!u.test(e)){var s=o?t.sub(e,this._lookup(o)):e;if(!s)return null;var i=t.isArray(s),r=i?s[1]:s,c=r.split(/\s+/g),l=c.pop();return{processor:f[l]||n,parts:[r,c.join(" "),l],delegate:i?s[0]:void 0}}},_lookup:function(t){return[t,window]},processors:{},defaults:{}},{setup:function(n,e){var o,i=this.constructor,r=i.pluginName||i._fullName;return this.element=t.$(n),r&&"can_control"!==r&&this.element.addClass(r),o=t.data(this.element,"controls"),o||(o=[],t.data(this.element,"controls",o)),o.push(this),this.options=s({},i.defaults,e),this.on(),[this.element,this.options]},on:function(n,e,o,s){if(!n){this.off();var i,r,u=this.constructor,c=this._bindings,l=u.actions,h=this.element,f=t.Control._shifter(this,"destroy");for(i in l)l.hasOwnProperty(i)&&(r=l[i]||u._action(i,this.options,this),r&&(c.control[i]=r.processor(r.delegate||h,r.parts[2],r.parts[1],i,this)));return t.bind.call(h,"removed",f),c.user.push(function(n){t.unbind.call(n,"removed",f)}),c.user.length}return"string"==typeof n&&(s=o,o=e,e=n,n=this.element),void 0===s&&(s=o,o=e,e=null),"string"==typeof s&&(s=t.Control._shifter(this,s)),this._bindings.user.push(a(n,o,s,e)),this._bindings.user.length},off:function(){var t=this.element[0],n=this._bindings;n&&(i(n.user||[],function(n){n(t)}),i(n.control||{},function(n){n(t)})),this._bindings={user:[],control:{}}},destroy:function(){if(null!==this.element){var n,e=this.constructor,o=e.pluginName||e._fullName;this.off(),o&&"can_control"!==o&&this.element.removeClass(o),n=t.data(this.element,"controls"),n.splice(t.inArray(this,n),1),t.trigger(this,"destroyed"),this.element=null}}}),f=t.Control.processors;return n=function(n,e,o,s,i){return a(n,e,t.Control._shifter(i,s),o)},i(["change","click","contextmenu","dblclick","keydown","keyup","keypress","mousedown","mousemove","mouseout","mouseover","mouseup","reset","resize","scroll","select","submit","focusin","focusout","mouseenter","mouseleave","touchstart","touchmove","touchcancel","touchend","touchleave","inserted","removed"],function(t){f[t]=n}),h});
/*can@2.3.0-pre.1#util/bind/bind*/
define("can/util/bind/bind",["can/util/util"],function(i){return i.bindAndSetup=function(){return i.addEvent.apply(this,arguments),this._init||(this._bindings?this._bindings++:(this._bindings=1,this._bindsetup&&this._bindsetup())),this},i.unbindAndTeardown=function(n,t){var s=this.__bindEvents[n]||[],d=s.length;return i.removeEvent.apply(this,arguments),null===this._bindings?this._bindings=0:this._bindings=this._bindings-(d-s.length),!this._bindings&&this._bindteardown&&this._bindteardown(),this},i});
/*can@2.3.0-pre.1#map/bubble*/
define("can/map/bubble",["can/util/util"],function(n){var e=n.bubble={event:function(n,e){return n.constructor._bubbleRule(e,n)},childrenOf:function(n,i){n._each(function(b,r){b&&b.bind&&e.toParent(b,n,r,i)})},teardownChildrenFrom:function(n,i){n._each(function(b){e.teardownFromParent(n,b,i)})},toParent:function(e,i,b,r){n.listenTo.call(i,e,r,function(){var r=n.makeArray(arguments),t=r.shift();r[0]=(n.List&&i instanceof n.List?i.indexOf(e):b)+(r[0]?"."+r[0]:""),t.triggeredNS=t.triggeredNS||{},t.triggeredNS[i._cid]||(t.triggeredNS[i._cid]=!0,n.trigger(i,t,r))})},teardownFromParent:function(e,i,b){i&&i.unbind&&n.stopListening.call(e,i,b)},isBubbling:function(n,e){return n._bubbleBindings&&n._bubbleBindings[e]},bind:function(n,i){if(!n._init){var b,r=e.event(n,i),t=r.length;n._bubbleBindings||(n._bubbleBindings={});for(var u=0;t>u;u++)b=r[u],n._bubbleBindings[b]?n._bubbleBindings[b]++:(n._bubbleBindings[b]=1,e.childrenOf(n,b))}},unbind:function(i,b){for(var r,t=e.event(i,b),u=t.length,d=0;u>d;d++)r=t[d],i._bubbleBindings&&i._bubbleBindings[r]--,i._bubbleBindings&&!i._bubbleBindings[r]&&(delete i._bubbleBindings[r],e.teardownChildrenFrom(i,r),n.isEmptyObject(i._bubbleBindings)&&delete i._bubbleBindings)},add:function(i,b,r){if(b instanceof n.Map&&i._bubbleBindings)for(var t in i._bubbleBindings)i._bubbleBindings[t]&&(e.teardownFromParent(i,b,t),e.toParent(b,i,r,t))},removeMany:function(n,i){for(var b=0,r=i.length;r>b;b++)e.remove(n,i[b])},remove:function(i,b){if(b instanceof n.Map&&i._bubbleBindings)for(var r in i._bubbleBindings)i._bubbleBindings[r]&&e.teardownFromParent(i,b,r)},set:function(i,b,r,t){return n.Map.helpers.isObservable(r)&&e.add(i,r,b),n.Map.helpers.isObservable(t)&&e.remove(i,t),r}};return e});
/*can@2.3.0-pre.1#util/batch/batch*/
define("can/util/batch/batch",["can/util/can"],function(t){var n=1,a=0,i=[],c=[],e=null;t.batch={start:function(t){a++,t&&c.push(t)},stop:function(l,u){if(l?a=0:a--,0===a){if(null!==e)return;e=i.slice(0);var h,r,f=c.slice(0);for(i=[],c=[],t.batch.batchNum=n,n++,u&&t.batch.start(),h=0;h<e.length;h++)t.dispatch.apply(e[h][0],e[h][1]);for(e=null,h=0,r=f.length;h<f.length;h++)f[h]();t.batch.batchNum=void 0}},trigger:function(c,l,u){if(!c._init)if(l="string"==typeof l?{type:l}:l,e)e.push([c,[l,u]]);else{if(0===a)return t.dispatch.call(c,l,u);l.batchNum=n,i.push([c,[l,u]])}},afterPreviousEvents:function(n){if(e){var a={};t.bind.call(a,"ready",n),e.push([a,[{type:"ready"},[]]])}else n()}}});
/*can@2.3.0-pre.1#map/map*/
define("can/map/map",["can/util/util","can/util/bind/bind","can/map/bubble","can/construct/construct","can/util/batch/batch"],function(t,e,i){var n=null,s=function(){for(var t in n)n[t].added&&delete n[t].obj._cid;n=null},r=function(t){return n&&n[t._cid]&&n[t._cid].instance},a=null,o=t.Map=t.Construct.extend({setup:function(){if(t.Construct.setup.apply(this,arguments),t.Map){this.defaults||(this.defaults={}),this._computes=[];for(var e in this.prototype)"define"!==e&&"constructor"!==e&&("function"!=typeof this.prototype[e]||this.prototype[e].prototype instanceof t.Construct)?this.defaults[e]=this.prototype[e]:this.prototype[e].isComputed&&this._computes.push(e);this.helpers.define&&this.helpers.define(this)}!t.List||this.prototype instanceof t.List||(this.List=o.List.extend({Map:this},{}))},_bubble:i,_bubbleRule:function(t){return"change"===t||t.indexOf(".")>=0?["change"]:[]},_computes:[],bind:t.bindAndSetup,on:t.bindAndSetup,unbind:t.unbindAndTeardown,off:t.unbindAndTeardown,id:"id",helpers:{define:null,attrParts:function(t,e){return e?[t]:"object"==typeof t?t:(""+t).split(".")},addToMap:function(e,i){var r;n||(r=s,n={});var a=e._cid,o=t.cid(e);return n[o]||(n[o]={obj:e,instance:i,added:!a}),r},isObservable:function(e){return e instanceof t.Map||e&&e===t.route},canMakeObserve:function(e){return e&&!t.isDeferred(e)&&(t.isArray(e)||t.isPlainObject(e))},serialize:function(e,i,n){var s=t.cid(e),r=!1;return a||(r=!0,a={attr:{},serialize:{}}),a[i][s]=n,e.each(function(s,r){var u,h=o.helpers.isObservable(s),c=h&&a[i][t.cid(s)];u=c?c:"serialize"===i?o.helpers._serialize(e,r,s):o.helpers._getValue(e,r,s,i),void 0!==u&&(n[r]=u)}),t.__observe(e,"__keys"),r&&(a=null),n},_serialize:function(t,e,i){return o.helpers._getValue(t,e,i,"serialize")},_getValue:function(t,e,i,n){return o.helpers.isObservable(i)?i[n]():i}},keys:function(e){var i=[];t.__observe(e,"__keys");for(var n in e._data)i.push(n);return i}},{setup:function(e){e instanceof t.Map&&(e=e.serialize()),this._data={},t.cid(this,".map"),this._init=1,this._computedBindings={};var i=this._setupDefaults(e);this._setupComputes(i);var n=e&&t.Map.helpers.addToMap(e,this),s=t.extend(t.extend(!0,{},i),e);this.attr(s),n&&n(),this.bind("change",t.proxy(this._changes,this)),delete this._init},_setupComputes:function(){for(var t,e=this.constructor._computes,i=0,n=e.length;n>i;i++)t=e[i],this[t]=this[t].clone(this),this._computedBindings[t]={count:0}},_setupDefaults:function(){return this.constructor.defaults||{}},_bindsetup:function(){},_bindteardown:function(){},_changes:function(e,i,n,s,r){t.batch.trigger(this,{type:i,batchNum:e.batchNum,target:e.target},[s,r])},_triggerChange:function(e,n,s,r){i.isBubbling(this,"change")?t.batch.trigger(this,{type:"change",target:this},[e,n,s,r]):t.batch.trigger(this,e,[s,r]),("remove"===n||"add"===n)&&t.batch.trigger(this,{type:"__keys",target:this})},_each:function(t){var e=this.__get();for(var i in e)e.hasOwnProperty(i)&&t(e[i],i)},attr:function(t,e){var i=typeof t;return"string"!==i&&"number"!==i?this._attrs(t,e):1===arguments.length?this._get(t):(this._set(t,e),this)},each:function(){return t.each.apply(void 0,[this].concat(t.makeArray(arguments)))},removeAttr:function(e){var i=t.List&&this instanceof t.List,n=t.Map.helpers.attrParts(e),s=n.shift(),r=i?this[s]:this._data[s];return n.length&&r?r.removeAttr(n):("string"==typeof e&&~e.indexOf(".")&&(s=e),this._remove(s,r),r)},_remove:function(t,e){t in this._data&&(delete this._data[t],t in this.constructor.prototype||delete this[t],this._triggerChange(t,"remove",void 0,e))},_get:function(e){e=""+e;var i=e.indexOf(".");if(i>=0){var n=this.__get(e);if(void 0!==n)return n;var s=e.substr(0,i),r=e.substr(i+1);t.__observe(this,s);var a=this.__get(s);return a&&a._get?a._get(r):void 0}return t.__observe(this,e),this.__get(e)},__get:function(t){return t?this._computedBindings[t]?this[t]():this._data[t]:this._data},__type:function(e,i){if(!(e instanceof t.Map)&&t.Map.helpers.canMakeObserve(e)){var n=r(e);if(n)return n;if(t.isArray(e)){var s=t.List;return new s(e)}var a=this.constructor.Map||t.Map;return new a(e)}return e},_set:function(t,e,i){t=""+t;var n,s=t.indexOf(".");if(!i&&s>=0){var r=t.substr(0,s),a=t.substr(s+1);if(n=this._init?void 0:this.__get(r),!o.helpers.isObservable(n))throw"can.Map: Object does not exist";n._set(a,e)}else this.__convert&&(e=this.__convert(t,e)),n=this._init?void 0:this.__get(t),this.__set(t,this.__type(e,t),n)},__set:function(t,e,i){if(e!==i){var n=void 0!==i||this.__get().hasOwnProperty(t)?"set":"add";this.___set(t,this.constructor._bubble.set(this,t,e,i)),this._computedBindings[t]||this._triggerChange(t,n,e,i),i&&this.constructor._bubble.teardownFromParent(this,i)}},___set:function(t,e){this._computedBindings[t]?this[t](e):this._data[t]=e,"function"==typeof this.constructor.prototype[t]||this._computedBindings[t]||(this[t]=e)},one:t.one,bind:function(e,i){var n=this._computedBindings&&this._computedBindings[e];if(n)if(n.count)n.count++;else{n.count=1;var s=this;n.handler=function(i,n,r){t.batch.trigger(s,{type:e,batchNum:i.batchNum,target:s},[n,r])},this[e].bind("change",n.handler)}return this.constructor._bubble.bind(this,e),t.bindAndSetup.apply(this,arguments)},unbind:function(e,i){var n=this._computedBindings&&this._computedBindings[e];return n&&(1===n.count?(n.count=0,this[e].unbind("change",n.handler),delete n.handler):n.count--),this.constructor._bubble.unbind(this,e),t.unbindAndTeardown.apply(this,arguments)},serialize:function(){return t.Map.helpers.serialize(this,"serialize",{})},_attrs:function(e,i){if(void 0===e)return o.helpers.serialize(this,"attr",{});e=t.simpleExtend({},e);var n,s,r=this;t.batch.start(),this.each(function(t,n){if("_cid"!==n){if(s=e[n],void 0===s)return void(i&&r.removeAttr(n));r.__convert&&(s=r.__convert(n,s)),o.helpers.isObservable(s)?r.__set(n,r.__type(s,n),t):o.helpers.isObservable(t)&&o.helpers.canMakeObserve(s)?t.attr(s,i):t!==s&&r.__set(n,r.__type(s,n),t),delete e[n]}});for(n in e)"_cid"!==n&&(s=e[n],this._set(n,s,!0));return t.batch.stop(),this},compute:function(e){if(t.isFunction(this.constructor.prototype[e]))return t.compute(this[e],this);var i=e.split("."),n=i.length-1,s={args:[]};return t.compute(function(e){return arguments.length?void t.compute.read(this,i.slice(0,n)).value.attr(i[n],e):t.compute.read(this,i,s).value},this)}});return o.prototype.on=o.prototype.bind,o.prototype.off=o.prototype.unbind,o});
/*can@2.3.0-pre.1#list/list*/
define("can/list/list",["can/util/util","can/map/map","can/map/bubble"],function(t,e,i){var r=[].splice,h=function(){var t={0:"a",length:1};return r.call(t,0,1),!t[0]}(),n=e.extend({Map:e},{setup:function(e,i){this.length=0,t.cid(this,".map"),this._init=1,this._computedBindings={},this._setupComputes(),e=e||[];var r;t.isDeferred(e)?this.replace(e):(r=e.length&&t.Map.helpers.addToMap(e,this),this.push.apply(this,t.makeArray(e||[]))),r&&r(),this.bind("change",t.proxy(this._changes,this)),t.simpleExtend(this,i),delete this._init},_triggerChange:function(i,r,h,n){e.prototype._triggerChange.apply(this,arguments);var s=+i;~(""+i).indexOf(".")||isNaN(s)||("add"===r?(t.batch.trigger(this,r,[h,s]),t.batch.trigger(this,"length",[this.length])):"remove"===r?(t.batch.trigger(this,r,[n,s]),t.batch.trigger(this,"length",[this.length])):t.batch.trigger(this,r,[h,s]))},__get:function(e){return e?this[e]&&this[e].isComputed&&t.isFunction(this.constructor.prototype[e])?this[e]():this[e]:this},__set:function(e,i,r){if(e=isNaN(+e)||e%1?e:+e,"number"==typeof e&&e>this.length-1){var h=new Array(e+1-this.length);return h[h.length-1]=i,this.push.apply(this,h),h}return t.Map.prototype.__set.call(this,""+e,i,r)},___set:function(t,e){this[t]=e,+t>=this.length&&(this.length=+t+1)},_remove:function(t,e){isNaN(+t)?(delete this[t],this._triggerChange(t,"remove",void 0,e)):this.splice(t,1)},_each:function(t){for(var e=this.__get(),i=0;i<e.length;i++)t(e[i],i)},serialize:function(){return e.helpers.serialize(this,"serialize",[])},splice:function(e,n){var s,a,l,o=t.makeArray(arguments),c=[],p=o.length>2;for(e=e||0,s=0,a=o.length-2;a>s;s++)l=s+2,o[l]=this.__type(o[l],l),c.push(o[l]),this[s+e]!==o[l]&&(p=!1);if(p&&this.length<=c.length)return c;void 0===n&&(n=o[1]=this.length-e);var g=r.apply(this,o);if(!h)for(s=this.length;s<g.length+this.length;s++)delete this[s];if(t.batch.start(),n>0&&(i.removeMany(this,g),this._triggerChange(""+e,"remove",void 0,g)),o.length>2){for(s=0,a=c.length;a>s;s++)i.set(this,s,c[s]);this._triggerChange(""+e,"add",c,g)}return t.batch.stop(),g},_attrs:function(i,r){return void 0===i?e.helpers.serialize(this,"attr",[]):(i=t.makeArray(i),t.batch.start(),this._updateAttrs(i,r),void t.batch.stop())},_updateAttrs:function(t,i){for(var r=Math.min(t.length,this.length),h=0;r>h;h++){var n=this[h],s=t[h];e.helpers.isObservable(n)&&e.helpers.canMakeObserve(s)?n.attr(s,i):n!==s&&this._set(h,s)}t.length>this.length?this.push.apply(this,t.slice(this.length)):t.length<this.length&&i&&this.splice(t.length)}}),s=function(e){return e[0]&&t.isArray(e[0])?e[0]:t.makeArray(e)};return t.each({push:"length",unshift:0},function(t,e){var r=[][e];n.prototype[e]=function(){for(var e,h,n=[],s=t?this.length:0,a=arguments.length;a--;)h=arguments[a],n[a]=i.set(this,a,this.__type(h,a));return e=r.apply(this,n),(!this.comparator||n.length)&&this._triggerChange(""+s,"add",n,void 0),e}}),t.each({pop:"length",shift:0},function(t,e){n.prototype[e]=function(){if(!this.length)return void 0;var r=s(arguments),h=t&&this.length?this.length-1:0,n=[][e].apply(this,r);return this._triggerChange(""+h,"remove",void 0,[n]),n&&n.unbind&&i.remove(this,n),n}}),t.extend(n.prototype,{indexOf:function(e,i){return this.attr("length"),t.inArray(e,this,i)},join:function(){return[].join.apply(this.attr(),arguments)},reverse:function(){var e=[].reverse.call(t.makeArray(this));this.replace(e)},slice:function(){var t=Array.prototype.slice.apply(this,arguments);return new this.constructor(t)},concat:function(){var e=[];return t.each(t.makeArray(arguments),function(i,r){e[r]=i instanceof t.List?i.serialize():i}),new this.constructor(Array.prototype.concat.apply(this.serialize(),e))},forEach:function(e,i){return t.each(this,e,i||this)},replace:function(e){return t.isDeferred(e)?e.then(t.proxy(this.replace,this)):this.splice.apply(this,[0,this.length].concat(t.makeArray(e||[]))),this},filter:function(e,i){var r,h=new t.List,n=this;return this.each(function(t,s,a){r=e.call(i|n,t,s,n),r&&h.push(t)}),h},map:function(e,i){var r=new t.List,h=this;return this.each(function(t,n,s){var a=e.call(i|h,t,n,h);r.push(a)}),r}}),t.List=e.List=n,t.List});
/*can@2.3.0-pre.1#compute/read*/
define("can/compute/read",["can/util/util"],function(e){var t=function(e,r,o){o=o||{};for(var a,s,u={foundObservable:!1},i=n(e,0,r,o,u),d=r.length,c=0;d>c;){s=i;for(var l=0,f=t.propertyReaders.length;f>l;l++){var v=t.propertyReaders[l];if(v.test(i)){i=v.read(i,r[c],c,o,u);break}}if(c+=1,i=n(i,c,r,o,u,s),a=typeof i,c<r.length&&(null===i||"function"!==a&&"object"!==a))return o.earlyExit&&o.earlyExit(s,c-1,i),{value:void 0,parent:s}}return void 0===i&&o.earlyExit&&o.earlyExit(s,c-1),{value:i,parent:s}},n=function(e,n,r,o,a,s){var u;do{u=!1;for(var i=0,d=t.valueReaders.length;d>i;i++)t.valueReaders[i].test(e,n,r,o)&&(e=t.valueReaders[i].read(e,n,r,o,a,s))}while(u);return e};return t.valueReaders=[{name:"compute",test:function(e,t,n,r){return e&&e.isComputed},read:function(t,n,r,o,a){return o.isArgument&&n===r.length?t:(!a.foundObservable&&o.foundObservable&&(o.foundObservable(t,n),a.foundObservable=!0),t instanceof e.Compute?t.get():t())}},{name:"function",test:function(t,n,r,o){var a=typeof t;return!("function"!==a||t.isComputed||!(o.executeAnonymousFunctions||o.isArgument&&n===r.length)||e.Construct&&t.prototype instanceof e.Construct||e.route&&t===e.route)},read:function(t,n,r,o,a,s){return o.isArgument&&n===r.length?o.proxyMethods!==!1?e.proxy(t,s):t:t.call(s)}}],t.propertyReaders=[{name:"map",test:e.isMapLike,read:function(t,n,r,o,a){return!a.foundObservable&&o.foundObservable&&(o.foundObservable(t,r),a.foundObservable=!0),"function"==typeof t[n]&&t.constructor.prototype[n]===t[n]?o.returnObserveMethods?t[n]:"constructor"===n&&t instanceof e.Construct||t[n].prototype instanceof e.Construct?t[n]:t[n].apply(t,o.args||[]):t.attr(n)}},{name:"promise",test:function(t){return e.isPromise(t)},read:function(t,n,r,o,a){!a.foundObservable&&o.foundObservable&&(o.foundObservable(t,r),a.foundObservable=!0);var s=t.__observeData;return t.__observeData||(s=t.__observeData={isPending:!0,state:"pending",isResolved:!1,isRejected:!1,value:void 0,reason:void 0},e.cid(s),e.simpleExtend(s,e.event),t.then(function(e){s.isPending=!1,s.isResolved=!0,s.value=e,s.state="resolved",s.dispatch("state",["resolved","pending"])},function(e){s.isPending=!1,s.isRejected=!0,s.reason=e,s.state="rejected",s.dispatch("state",["rejected","pending"])})),e.__observe(s,"state"),n in s?s[n]:t[n]}},{name:"object",test:function(){return!0},read:function(e,t){return null==e?void 0:e[t]}}],t.write=function(t,n,r,o){return o=o||{},e.isMapLike(t)?!o.isArgument&&t._data&&t._data[n]&&t._data[n].isComputed?t._data[n](r):t.attr(n,r):t[n]&&t[n].isComputed?t[n](r):void("object"==typeof t&&(t[n]=r))},t});
/*can@2.3.0-pre.1#compute/get_value_and_bind*/
define("can/compute/get_value_and_bind",["can/util/util"],function(e){function n(n,r,i,v){var o=t(n,r),d=o.observed,u=i.observed;return o.names!==i.names&&(a(u,d,v),s(u,v)),e.batch.afterPreviousEvents(function(){o.ready=!0}),o}var r=[];e.__isRecordingObserves=function(){return r.length},e.__observe=e.__reading=function(e,n){if(r.length){var t=e._cid+"|"+n,a=r[r.length-1];a.names+=t,a.observed[t]={obj:e,event:n+""}}},e.__notObserve=function(n){return function(){var r=e.__clearObserved(),t=n.apply(this,arguments);return e.__setObserved(r),t}},e.__clearObserved=e.__clearReading=function(){if(r.length){var e=r[r.length-1];return r[r.length-1]={names:"",observed:{}},e}},e.__setObserved=e.__setReading=function(e){r.length&&(r[r.length-1]=e)},e.__addObserved=e.__addReading=function(n){if(r.length){var t=r[r.length-1];e.simpleExtend(t.observed,n.observed),t.names+=n.names}};var t=function(e,n){r.push({names:"",observed:{}});var t=e.call(n),a=r.pop();return a.value=t,a},a=function(e,n,r){for(var t in n)i(e,n,t,r)},i=function(e,n,r,t){if(e[r])delete e[r];else{var a=n[r];a.obj.bind(a.event,t)}},s=function(e,n){for(var r in e){var t=e[r];t.obj.unbind(t.event,n)}};return n});
/*can@2.3.0-pre.1#compute/proto_compute*/
define("can/compute/proto_compute",["can/util/util","can/util/bind/bind","can/compute/read","can/compute/get_value_and_bind","can/util/batch/batch"],function(t,e,n,i){var s=function(e,n,i,s){n!==i&&t.batch.trigger(e,s?{type:"change",batchNum:s}:"change",[n,i])},u=function(e,n,s,u){var o,h,r;return u=!1,{on:function(a){var c=this;h||(h=function(t){if(o.ready&&e.bound&&(void 0===t.batchNum||t.batchNum!==r)){var a,f=o.value;u?(a=n.call(s),o.value=a):(o=i(n,s,o,h),a=o.value),c.updater(a,f,t.batchNum),r=r=t.batchNum}}),o=i(n,s,{observed:{}},h),u&&(n=t.__notObserve(n)),e.value=o.value,e.hasDependencies=!t.isEmptyObject(o.observed)},off:function(t){for(var e in o.observed){var n=o.observed[e];n.obj.unbind(n.event,h)}}}},o=function(){},h=function(t,e,n){this.value=t,s(this,t,e,n)},r=function(t,e,n){return function(){return t.call(e,n.get())}},a=function(t,e){return function(n){void 0!==n&&e(n,t.value)}};t.Compute=function(e,n,i,s){for(var u=[],o=0,h=arguments.length;h>o;o++)u[o]=arguments[o];var r=typeof u[1];"function"==typeof u[0]?this._setupGetterSetterFn(u[0],u[1],u[2],u[3]):u[1]?"string"===r?this._setupContextString(u[0],u[1],u[2]):"function"===r?this._setupContextFunction(u[0],u[1],u[2]):u[1]&&u[1].fn?this._setupAsyncCompute(u[0],u[1]):this._setupContextSettings(u[0],u[1]):this._setupInitialValue(u[0]),this._args=u,this.isComputed=!0,t.cid(this,"compute")},t.simpleExtend(t.Compute.prototype,{_bindsetup:t.__notObserve(function(){this.bound=!0,this._on(this.updater)}),_bindteardown:function(){this._off(this.updater),this.bound=!1},bind:t.bindAndSetup,unbind:t.unbindAndTeardown,clone:function(e){return e&&"function"==typeof this._args[0]?this._args[1]=e:e&&(this._args[2]=e),new t.Compute(this._args[0],this._args[1],this._args[2],this._args[3])},_on:o,_off:o,get:function(){return t.__isRecordingObserves()&&this._canObserve!==!1&&(t.__observe(this,"change"),this.bound||t.Compute.temporarilyBind(this)),this.bound?this.value:this._get()},_get:function(){return this.value},set:function(t){var e=this.value,n=this._set(t,e);return this.hasDependencies?this._setUpdates?this.value:this._get():(void 0===n?this.value=this._get():this.value=n,s(this,this.value,e),this.value)},_set:function(t){return this.value=t},updater:h,_computeFn:function(t){return arguments.length?this.set(t):this.get()},toFunction:function(){return t.proxy(this._computeFn,this)},_setupGetterSetterFn:function(e,n,i,s){this._set=t.proxy(e,n),this._get=t.proxy(e,n),this._canObserve=i===!1?!1:!0;var o=u(this,e,n||this,s);this._on=o.on,this._off=o.off},_setupContextString:function(e,n,i){var s=t.isMapLike(e),u=this,o=function(t,e,n){u.updater(e,n,t.batchNum)};s?(this.hasDependencies=!0,this._get=function(){return e.attr(n)},this._set=function(t){e.attr(n,t)},this._on=function(t){e.bind(i||n,o),this.value=this._get()},this._off=function(){return e.unbind(i||n,o)}):(this._get=t.proxy(this._get,e),this._set=t.proxy(this._set,e))},_setupContextFunction:function(e,n,i){this.value=e,this._set=n,t.simpleExtend(this,i)},_setupContextSettings:function(e,n){if(this.value=e,this._set=n.set?t.proxy(n.set,n):this._set,this._get=n.get?t.proxy(n.get,n):this._get,!n.__selfUpdater){var i=this,s=this.updater;this.updater=function(){s.call(i,i._get(),i.value)}}this._on=n.on?n.on:this._on,this._off=n.off?n.off:this._off},_setupAsyncCompute:function(e,n){this.value=e;var i,s=t.proxy(this.updater,this),o=this,h=n.fn;this.updater=s;var c=new t.Compute(e);this.lastSetValue=c,this._setUpdates=!0,this._set=function(t){return t===c.get()?this.value:c.set(t)},this._get=r(h,n.context,c),0===h.length?i=u(this,h,n.context):1===h.length?i=u(this,function(){return h.call(n.context,c.get())},n):(this.updater=a(this,s),i=u(this,function(){var t=h.call(n.context,c.get(),function(t){s(t,o.value)});return void 0!==t?t:this.value},n)),this._on=i.on,this._off=i.off},_setupInitialValue:function(t){this.value=t}});var c,f=function(){for(var t=0,e=c.length;e>t;t++)c[t].unbind("change",o);c=null};return t.Compute.temporarilyBind=function(t){t.bind("change",o),c||(c=[],setTimeout(f,10)),c.push(t)},t.Compute.async=function(e,n,i){return new t.Compute(e,{fn:n,context:i})},t.Compute.read=n,t.Compute.set=n.write,t.Compute.truthy=function(e){return new t.Compute(function(){var t=e.get();return"function"==typeof t&&(t=t.get()),!!t})},t.Compute});
/*can@2.3.0-pre.1#compute/compute*/
define("can/compute/compute",["can/util/util","can/util/bind/bind","can/util/batch/batch","can/compute/proto_compute"],function(n,t){n.compute=function(t,e,u,o){var c=new n.Compute(t,e,u,o),r=function(n){return arguments.length?c.set(n):c.get()};return r.bind=n.proxy(c.bind,c),r.unbind=n.proxy(c.unbind,c),r.isComputed=c.isComputed,r.clone=function(u){return"function"==typeof t&&(e=u),n.compute(t,e,u,o)},r.computeInstance=c,r};var e,u=function(){},o=function(){for(var n=0,t=e.length;t>n;n++)e[n].unbind("change",u);e=null};return n.compute.temporarilyBind=function(n){n.bind("change",u),e||(e=[],setTimeout(o,10)),e.push(n)},n.compute.truthy=function(t){return n.compute(function(){var n=t();return"function"==typeof n&&(n=n()),!!n})},n.compute.async=function(t,e,u){return n.compute(t,{fn:e,context:u})},n.compute.read=n.Compute.read,n.compute.set=n.Compute.set,n.__notObserve=function(t){return function(){var e=n.__clearReading(),u=t.apply(this,arguments);return n.__setReading(e),u}},n.compute});
/*can@2.3.0-pre.1#observe/observe*/
define("can/observe/observe",["can/util/util","can/map/map","can/list/list","can/compute/compute"],function(t){return t.Observe=t.Map,t.Observe.startBatch=t.batch.start,t.Observe.stopBatch=t.batch.stop,t.Observe.triggerBatch=t.batch.trigger,t});
/*can@2.3.0-pre.1#view/scope/compute_data*/
define("can/view/scope/compute_data",["can/util/util","can/compute/compute","can/compute/get_value_and_bind"],function(e,t,n){var o=function(t){return t.reads&&1===t.reads.length&&t.root instanceof e.Map&&!e.isFunction(t.root[t.reads[0]])},a=function(e,t){return n(e,null,{observed:{}},t)},u=function(e,t){for(var n in e.observed){var o=e.observed[n];o.obj.unbind(o.event,t)}},r=function(e,t){var n=e.root,o=e.reads[0];return n.bind(o,t),{value:e.initialValue,observed:{something:!0}}},c=function(e,t){e.root.unbind(e.reads[0],t)},s=function(t,n,o,a,u){if(!(arguments.length>4)){if(a.root)return e.compute.read(a.root,a.reads,o).value;var r=t.read(n,o);return a.scope=r.scope,a.initialValue=r.value,a.reads=r.reads,a.root=r.rootObserve,a.setRoot=r.setRoot,r.value}var c=a.root||a.setRoot;if(c.isComputed)c(u);else if(a.reads.length){var s=a.reads.length-1,i=a.reads.length?e.compute.read(c,a.reads.slice(0,s)).value:c;e.compute.set(i,a.reads[s],u,o)}};return function(t,i,d){d=d||{args:[]};var v,l,f={},p=function(e){return arguments.length?s(t,i,d,f,e):s(t,i,d,f)},m=function(e){if(l.ready&&g.computeInstance.bound&&(void 0===e.batchNum||e.batchNum!==v)){var t,o=l.value;l=n(p,null,l,m),t=l.value,g.computeInstance.updater(t,o,e.batchNum),v=v=e.batchNum}},b=function(e,t,n){"function"!=typeof t?g.computeInstance.updater(t,n,e.batchNum):(c(f,b),l=a(p,m),h=!1,g.computeInstance.updater(l.value,n,e.batchNum))},h=!1,g=e.compute(void 0,{on:function(){if(l=a(p,m),o(f)){var t=l;l=r(f,b),u(t,m),h=!0}g.computeInstance.value=l.value,g.computeInstance.hasDependencies=!e.isEmptyObject(l.observed)},off:function(){h?c(f,b):u(l,m)},set:p,get:p,__selfUpdater:!0});return f.compute=g,f}});
/*can@2.3.0-pre.1#view/scope/scope*/
define("can/view/scope/scope",["can/util/util","can/view/scope/compute_data","can/construct/construct","can/map/map","can/list/list","can/view/view","can/compute/compute"],function(e,t){var n=/(\\)?\./g,r=/\\\./g,s=function(e){var t=[],s=0;return e.replace(n,function(n,i,o){i||(t.push(e.slice(s,o).replace(r,".")),s=o+n.length)}),t.push(e.slice(s).replace(r,".")),t},i=e.Construct.extend({read:e.compute.read,Refs:e.Map.extend({}),refsScope:function(){return new e.view.Scope(new this.Refs)}},{init:function(e,t){this._context=e,this._parent=t,this.__cache={}},attr:e.__notObserve(function(t,n){var r={isArgument:!0,returnObserveMethods:!0,proxyMethods:!1},s=this.read(t,r);if(2===arguments.length){var i=t.lastIndexOf("."),o=-1!==i?t.substring(0,i):".",a=this.read(o,r).value;-1!==i&&(t=t.substring(i+1,t.length)),e.compute.set(a,t,n,r)}return s.value}),add:function(e){return e!==this._context?new this.constructor(e,this):this},computeData:function(e,n){return t(this,e,n)},compute:function(e,t){return this.computeData(e,t).compute},getRefs:function(){for(var e,t=this;t;){if(e=t._context,e instanceof i.Refs)return e;t=t._parent}},cloneFromRef:function(){for(var t,n,r=[],s=this;s;){if(t=s._context,t instanceof i.Refs){n=s._parent;break}r.push(t),s=s._parent}return n?(e.each(r,function(e){n=n.add(e)}),n):this},read:function(t,n){var r;if("./"===t.substr(0,2))r=!0,t=t.substr(2);else{if("../"===t.substr(0,3))return this._parent.read(t.substr(3),n);if(".."===t)return{value:this._parent._context};if("."===t||"this"===t)return{value:this._context};if("@root"===t){for(var o=this,a=this;o._parent;)a=o,o=o._parent;return o._context instanceof i.Refs&&(o=a),{value:o._context}}}for(var c,u,f,p,l,v,h=-1===t.indexOf("\\.")?t.split("."):s(t),d=this,_=[],m=-1,x=!1,b=e.simpleExtend({foundObservable:function(e,t){u=e,f=h.slice(t)},earlyExit:function(e,t){t>m&&(l=u,p=f,m=t)},executeAnonymousFunctions:!0},n);d;){if(c=d._context,v=c instanceof i.Refs,!(null===c||"object"!=typeof c&&"function"!=typeof c||x&&v)){v&&(x=!0);var g=e.compute.read(c,h,b);if(void 0!==g.value)return{scope:d,rootObserve:u,value:g.value,reads:f};_.push(e.__clearObserved())}d=r?null:d._parent}var w=_.length;if(w)for(var R=0;w>R;R++)e.__addObserved(_[R]);return{setRoot:l,reads:p,value:void 0}}});return e.view.Scope=i,i});
/*can@2.3.0-pre.1#view/scanner*/
define("can/view/scanner",["can/view/view","can/view/elements","can/view/callbacks/callbacks"],function(can,elements,viewCallbacks){var newLine=/(\r|\n)+/g,notEndTag=/\//,clean=function(t){return t.split("\\").join("\\\\").split("\n").join("\\n").split('"').join('\\"').split("	").join("\\t")},getTag=function(t,e,n){if(t)return t;for(;n<e.length;){if("<"===e[n]&&!notEndTag.test(e[n+1]))return elements.reverseTagMap[e[n+1]]||"span";n++}return""},bracketNum=function(t){return--t.split("{").length- --t.split("}").length},myEval=function(script){eval(script)},attrReg=/([^\s]+)[\s]*=[\s]*$/,startTxt="var ___v1ew = [];",finishTxt="return ___v1ew.join('')",put_cmd="___v1ew.push(\n",insert_cmd=put_cmd,htmlTag=null,quote=null,beforeQuote=null,rescan=null,getAttrName=function(){var t=beforeQuote.match(attrReg);return t&&t[1]},status=function(){return quote?"'"+getAttrName()+"'":htmlTag?1:0},top=function(t){return t[t.length-1]},Scanner;return can.view.Scanner=Scanner=function(t){can.extend(this,{text:{},tokens:[]},t),this.text.options=this.text.options||"",this.tokenReg=[],this.tokenSimple={"<":"<",">":">",'"':'"',"'":"'"},this.tokenComplex=[],this.tokenMap={};for(var e,n=0;e=this.tokens[n];n++)e[2]?(this.tokenReg.push(e[2]),this.tokenComplex.push({abbr:e[1],re:new RegExp(e[2]),rescan:e[3]})):(this.tokenReg.push(e[1]),this.tokenSimple[e[1]]=e[0]),this.tokenMap[e[0]]=e[1];this.tokenReg=new RegExp("("+this.tokenReg.slice(0).concat(["<",">",'"',"'"]).join("|")+")","g")},Scanner.prototype={helpers:[],scan:function(t,e){var n=[],s=0,a=this.tokenSimple,r=this.tokenComplex;t=t.replace(newLine,"\n"),this.transform&&(t=this.transform(t)),t.replace(this.tokenReg,function(e,i){var o=arguments[arguments.length-2];if(o>s&&n.push(t.substring(s,o)),a[e])n.push(e);else for(var u,c=0;u=r[c];c++)if(u.re.test(e)){n.push(u.abbr),u.rescan&&n.push(u.rescan(i));break}s=o+i.length}),s<t.length&&n.push(t.substr(s));var i,o,u,c,l="",p=[startTxt+(this.text.start||"")],h=function(t,e){p.push(put_cmd,'"',clean(t),'"'+(e||"")+");")},g=[],f=null,m=!1,k={attributeHookups:[],tagHookups:[],lastTagHookup:""},b=function(){k.lastTagHookup=k.tagHookups.pop()+k.tagHookups.length},v="",x=[],w=!1,T=!1,d=0,_=this.tokenMap;for(htmlTag=quote=beforeQuote=null;void 0!==(u=n[d++]);){if(null===f)switch(u){case _.left:case _.escapeLeft:case _.returnLeft:m=htmlTag&&1;case _.commentLeft:f=u,l.length&&h(l),l="";break;case _.escapeFull:m=htmlTag&&1,rescan=1,f=_.escapeLeft,l.length&&h(l),rescan=n[d++],l=rescan.content||rescan,rescan.before&&h(rescan.before),n.splice(d,0,_.right);break;case _.commentFull:break;case _.templateLeft:l+=_.left;break;case"<":0!==n[d].indexOf("!--")&&(htmlTag=1,m=0),l+=u;break;case">":htmlTag=0;var H="/"===l.substr(l.length-1)||"--"===l.substr(l.length-2),N="";if(k.attributeHookups.length&&(N="attrs: ['"+k.attributeHookups.join("','")+"'], ",k.attributeHookups=[]),v+k.tagHookups.length!==k.lastTagHookup&&v===top(k.tagHookups))H&&(l=l.substr(0,l.length-1)),p.push(put_cmd,'"',clean(l),'"',",can.view.pending({tagName:'"+v+"',"+N+"scope: "+(this.text.scope||"this")+this.text.options),H?(p.push("}));"),l="/>",b()):"<"===n[d]&&n[d+1]==="/"+v?(p.push("}));"),l=u,b()):(p.push(",subtemplate: function("+this.text.argNames+"){\n"+startTxt+(this.text.start||"")),l="");else if(m||!w&&elements.tagToContentPropMap[x[x.length-1]]||N){var R=",can.view.pending({"+N+"scope: "+(this.text.scope||"this")+this.text.options+'}),"';H?h(l.substr(0,l.length-1),R+'/>"'):h(l,R+'>"'),l="",m=0}else l+=u;(H||w)&&(x.pop(),v=x[x.length-1],w=!1),k.attributeHookups=[];break;case"'":case'"':if(htmlTag)if(quote&&quote===u){quote=null;var L=getAttrName();if(viewCallbacks.attr(L)&&k.attributeHookups.push(L),T){l+=u,h(l),p.push(finishTxt,"}));\n"),l="",T=!1;break}}else if(null===quote&&(quote=u,beforeQuote=i,c=getAttrName(),"img"===v&&"src"===c||"style"===c)){h(l.replace(attrReg,"")),l="",T=!0,p.push(insert_cmd,"can.view.txt(2,'"+getTag(v,n,d)+"',"+status()+",this,function(){",startTxt),h(c+"="+u);break}default:if("<"===i){v="!--"===u.substr(0,3)?"!--":u.split(/\s/)[0];var S,y=!1;0===v.indexOf("/")&&(y=!0,S=v.substr(1)),y?(top(x)===S&&(v=S,w=!0),top(k.tagHookups)===S&&(h(l.substr(0,l.length-1)),p.push(finishTxt+"}}) );"),l="><",b())):(v.lastIndexOf("/")===v.length-1&&(v=v.substr(0,v.length-1)),"!--"!==v&&viewCallbacks.tag(v)&&("content"===v&&elements.tagMap[top(x)]&&(u=u.replace("content",elements.tagMap[top(x)])),k.tagHookups.push(v)),x.push(v))}l+=u}else switch(u){case _.right:case _.returnRight:switch(f){case _.left:o=bracketNum(l),1===o?(p.push(insert_cmd,"can.view.txt(0,'"+getTag(v,n,d)+"',"+status()+",this,function(){",startTxt,l),g.push({before:"",after:finishTxt+"}));\n"})):(s=g.length&&-1===o?g.pop():{after:";"},s.before&&p.push(s.before),p.push(l,";",s.after));break;case _.escapeLeft:case _.returnLeft:o=bracketNum(l),o&&g.push({before:finishTxt,after:"}));\n"});for(var j=f===_.escapeLeft?1:0,C={insert:insert_cmd,tagName:getTag(v,n,d),status:status(),specialAttribute:T},q=0;q<this.helpers.length;q++){var E=this.helpers[q];if(E.name.test(l)){l=E.fn(l,C),E.name.source===/^>[\s]*\w*/.source&&(j=0);break}}"object"==typeof l?l.startTxt&&l.end&&T?p.push(insert_cmd,"can.view.toStr( ",l.content,"() ) );"):(l.startTxt?p.push(insert_cmd,"can.view.txt(\n"+("string"==typeof status()||(null!=l.escaped?l.escaped:j))+",\n'"+v+"',\n"+status()+",\nthis,\n"):l.startOnlyTxt&&p.push(insert_cmd,"can.view.onlytxt(this,\n"),p.push(l.content),l.end&&p.push("));")):T?p.push(insert_cmd,l,");"):p.push(insert_cmd,"can.view.txt(\n"+("string"==typeof status()||j)+",\n'"+v+"',\n"+status()+",\nthis,\nfunction(){ "+(this.text.escape||"")+"return ",l,o?startTxt:"}));\n"),rescan&&rescan.after&&rescan.after.length&&(h(rescan.after.length),rescan=null)}f=null,l="";break;case _.templateLeft:l+=_.left;break;default:l+=u}i=u}l.length&&h(l),p.push(";");var M=p.join(""),A={out:(this.text.outStart||"")+M+" "+finishTxt+(this.text.outEnd||"")};return myEval.call(A,"this.fn = (function("+this.text.argNames+"){"+A.out+"});\r\n//# sourceURL="+e+".js"),A}},can.view.pending=function(t){var e=can.view.getHooks();return can.view.hook(function(n){can.each(e,function(t){t(n)}),t.templateType="legacy",t.tagName&&viewCallbacks.tagHandler(n,t.tagName,t),can.each(t&&t.attrs||[],function(e){t.attributeName=e;var s=viewCallbacks.attr(e);s&&s(n,t)})})},can.view.tag("content",function(t,e){return e.scope}),can.view.Scanner=Scanner,Scanner});
/*can@2.3.0-pre.1#view/node_lists/node_lists*/
define("can/view/node_lists/node_lists",["can/util/util","can/view/elements"],function(e){var n=!0;try{document.createTextNode("")._=0}catch(t){n=!1}var r={},a={},i="ejs_"+Math.random(),s=0,u=function(e,t){var r=t||a,u=l(e,r);return u?u:n||3!==e.nodeType?(++s,e[i]=(e.nodeName?"element_":"obj_")+s):(++s,r["text_"+s]=e,"text_"+s)},l=function(e,t){if(n||3!==e.nodeType)return e[i];for(var r in t)if(t[r]===e)return r},c=[].splice,o=[].push,p=function(e){for(var n=0,t=0,r=e.length;r>t;t++){var a=e[t];a.nodeType?n++:n+=p(a)}return n},f=function(e,n){for(var t={},r=0,a=e.length;a>r;r++){var i=d.first(e[r]);t[u(i,n)]=e[r]}return t},d={id:u,update:function(n,t){var r=d.unregisterChildren(n);t=e.makeArray(t);var a=n.length;return c.apply(n,[0,a].concat(t)),n.replacements?d.nestReplacements(n):d.nestList(n),r},nestReplacements:function(e){for(var n=0,t={},r=f(e.replacements,t),a=e.replacements.length;n<e.length&&a;){var i=e[n],s=r[l(i,t)];s&&(e.splice(n,p(s),s),a--),n++}e.replacements=[]},nestList:function(e){for(var n=0;n<e.length;){var t=e[n],a=r[u(t)];a?a!==e&&e.splice(n,p(a),a):r[u(t)]=e,n++}},last:function(e){var n=e[e.length-1];return n.nodeType?n:d.last(n)},first:function(e){var n=e[0];return n.nodeType?n:d.first(n)},flatten:function(e){for(var n=[],t=0;t<e.length;t++){var r=e[t];r.nodeType?n.push(r):n.push.apply(n,d.flatten(r))}return n},register:function(e,n,t){return e.unregistered=n,e.parentList=t,t===!0?e.replacements=[]:t?(t.replacements.push(e),e.replacements=[]):d.nestList(e),e},unregisterChildren:function(n){var t=[];return e.each(n,function(e){e.nodeType?(n.replacements||delete r[u(e)],t.push(e)):o.apply(t,d.unregister(e))}),t},unregister:function(e){var n=d.unregisterChildren(e);if(e.unregistered){var t=e.unregistered;delete e.unregistered,delete e.replacements,t()}return n},nodeMap:r};return e.view.nodeLists=d,d});
/*can@2.3.0-pre.1#view/parser/parser*/
define("can/view/parser/parser",[],function(){function e(e,t){for(var r=0;r<e.length;r++)t(e[r],r)}function t(t){var r={},a=t.split(",");return e(a,function(e){r[e]=!0}),r}function r(e,t){for(var r=0,a=e.length;a>r;r++){var n=e[r];t[n.tokenType].apply(t,n.args)}return e}var a="-:A-Za-z0-9_",n="[^=>\\s\\{\\}\\/]+",s="\\s*=\\s*",i='"((?:\\\\.|[^"])*)"',o="'((?:\\\\.|[^'])*)'",l="(?:"+s+"(?:(?:\"[^\"]*\")|(?:'[^']*')|[^>\\s]+))?",c="\\{\\{[^\\}]*\\}\\}\\}?",u="\\{\\{([^\\}]*)\\}\\}\\}?",p=new RegExp("^<(["+a+"]+)((?:\\s*(?:(?:(?:"+n+")?"+l+")|(?:"+c+")+))*)\\s*(\\/?)>"),f=new RegExp("^<\\/(["+a+"]+)[^>]*>"),d=new RegExp("(?:(?:("+n+")|"+u+")(?:"+s+"(?:(?:"+i+")|(?:"+o+")|([^>\\s]+)))?)","g"),g=new RegExp(u,"g"),h=/<|\{\{/,m=t("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed"),b=t("a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video"),v=t("abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"),x=t("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr"),w=t("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"),y=t("script,style"),E="start,end,close,attrStart,attrEnd,attrValue,chars,comment,special,done".split(","),k=function(){},A=function(t,a,n){function s(e,t,r,n){if(t=t.toLowerCase(),b[t])for(;O.last()&&v[O.last()];)i("",O.last());x[t]&&O.last()===t&&i("",t),n=m[t]||!!n,a.start(t,n),n||O.push(t),A.parseAttrs(r,a),a.end(t,n)}function i(e,t){var r;if(t)for(r=O.length-1;r>=0&&O[r]!==t;r--);else r=0;if(r>=0){for(var n=O.length-1;n>=r;n--)a.close&&a.close(O[n]);O.length=r}}function o(e,t){a.special&&a.special(t)}if("object"==typeof t)return r(t,a);var l=[];a=a||{},n&&e(E,function(e){var t=a[e]||k;a[e]=function(){t.apply(this,arguments)!==!1&&l.push({tokenType:e,args:[].slice.call(arguments,0)})}});var c,u,d,w=function(){S&&a.chars&&a.chars(S),S=""},O=[],R=t,S="";for(O.last=function(){return this[this.length-1]};t;){if(u=!0,O.last()&&y[O.last()])t=t.replace(new RegExp("([\\s\\S]*?)</"+O.last()+"[^>]*>"),function(e,t){return t=t.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g,"$1$2"),a.chars&&a.chars(t),""}),i("",O.last());else if(0===t.indexOf("<!--")?(c=t.indexOf("-->"),c>=0&&(w(),a.comment&&a.comment(t.substring(4,c)),t=t.substring(c+3),u=!1)):0===t.indexOf("</")?(d=t.match(f),d&&(w(),t=t.substring(d[0].length),d[0].replace(f,i),u=!1)):0===t.indexOf("<")?(d=t.match(p),d&&(w(),t=t.substring(d[0].length),d[0].replace(p,s),u=!1)):0===t.indexOf("{{")&&(d=t.match(g),d&&(w(),t=t.substring(d[0].length),d[0].replace(g,o))),u){c=t.search(h),0===c&&t===R&&(S+=t.charAt(0),t=t.substr(1),c=t.search(h));var j=0>c?t:t.substring(0,c);t=0>c?"":t.substring(c),j&&(S+=j)}if(t===R)throw"Parse Error: "+t;R=t}return w(),i(),a.done(),l};return A.parseAttrs=function(e,t){(null!=e?e:"").replace(d,function(e,r,a,n,s,i){if(a&&t.special(a),r||n||s||i){var o=arguments[3]?arguments[3]:arguments[4]?arguments[4]:arguments[5]?arguments[5]:w[r.toLowerCase()]?r:"";t.attrStart(r||"");for(var l,c=g.lastIndex=0,u=g.exec(o);u;)l=o.substring(c,g.lastIndex-u[0].length),l.length&&t.attrValue(l),t.special(u[1]),c=g.lastIndex,u=g.exec(o);l=o.substr(c,o.length),l&&t.attrValue(l),t.attrEnd(r||"")}})},A});
/*can@2.3.0-pre.1#view/live/live*/
define("can/view/live/live",["can/util/util","can/view/elements","can/view/view","can/view/node_lists/node_lists","can/view/parser/parser"],function(e,t,n,r,i){t=t||e.view.elements,r=r||e.view.NodeLists,i=i||e.view.parser;var a=function(t,n,r){var i=!1,a=function(){return i||(i=!0,r(o),e.unbind.call(t,"removed",a)),!0},o={teardownCheck:function(e){return e?!1:a()}};return e.bind.call(t,"removed",a),n(o),o},o=function(e){var t=e.childNodes;if("length"in t)return t;for(var n=e.firstChild,r=[];n;)r.push(n),n=n.nextSibling;return r},u=function(e,t,n){return a(e,function(){t.bind("change",n)},function(e){t.unbind("change",n),e.nodeList&&r.unregister(e.nodeList)})},c=function(e){var t,n={};return i.parseAttrs(e,{attrStart:function(e){n[e]="",t=e},attrValue:function(e){n[t]+=e},attrEnd:function(){}}),n},s=[].splice,d=function(e){return e&&e.nodeType},l=function(e){e.firstChild||e.appendChild(e.ownerDocument.createTextNode(""))},f={list:function(n,i,u,c,d,l){var p,v=l||[n],h=[],g=!1,b=!1,w=function(n,i,a){if(g){var d=N.ownerDocument.createDocumentFragment(),f=[],p=[];e.each(i,function(t,n){var i=[];l&&r.register(i,null,!0);var s=e.compute(n+a),v=u.call(c,t,s,i),h="string"==typeof v,g=e.frag(v);g=h?e.view.hookup(g):g;var b=e.makeArray(o(g));l?(r.update(i,b),f.push(i)):f.push(r.register(b)),d.appendChild(g),p.push(s)});var b=a+1;if(v[b]){var w=r.first(v[b]);e.insertBefore(w.parentNode,d,w)}else t.after(1===b?[N]:[r.last(v[b-1])],d);s.apply(v,[b,0].concat(f)),s.apply(h,[a,0].concat(p));for(var m=a+p.length,k=h.length;k>m;m++)h[m](m)}},m=function(t,n,i,a,o){if(g&&(a||!y.teardownCheck(N.parentNode))){0>i&&(i=h.length+i);var u=v.splice(i+1,n.length),c=[];e.each(u,function(e){var t=r.unregister(e);[].push.apply(c,t)}),h.splice(i,n.length);for(var s=i,d=h.length;d>s;s++)h[s](s);o?r.unregister(v):e.remove(e.$(c))}},k=function(t,n,i,a){if(g){i+=1,a+=1;var o,u=v[i],c=e.frag(r.flatten(v[a]));o=i>a?r.last(u).nextSibling:r.first(u);var s=v[0].parentNode;s.insertBefore(c,o);var d=v[a];[].splice.apply(v,[a,1]),[].splice.apply(v,[i,0,d])}},N=n.ownerDocument.createTextNode(""),A=function(e){p&&p.unbind&&p.unbind("add",w).unbind("remove",m).unbind("move",k),m({},{length:v.length-1},0,!0,e)},C=function(t,n,r){b||(A(),p=n||[],p.bind&&p.bind("add",w).bind("remove",m).bind("move",k),g=!0,w({},p,0),g=!1,e.batch.afterPreviousEvents(function(){g=!0}))};d=t.getParentNode(n,d);var y=a(d,function(){e.isFunction(i)&&i.bind("change",C)},function(){e.isFunction(i)&&i.unbind("change",C),A(!0)});l?(t.replace(v,N),r.update(v,[N]),l.unregistered=function(){y.teardownCheck(),b=!0}):f.replace(v,N,y.teardownCheck),C({},e.isFunction(i)?i():i)},html:function(n,i,a,c){var s;a=t.getParentNode(n,a),s=u(a,i,function(e,t,n){var i=r.first(f).parentNode;i&&p(t),s.teardownCheck(r.first(f).parentNode)});var f=c||[n],p=function(n){var i="function"==typeof n,u=d(n),c=e.frag(i?"":n),s=e.makeArray(f);l(c),u||i||(c=e.view.hookup(c,a)),s=r.update(f,o(c)),i&&n(c.firstChild),t.replace(s,c)};s.nodeList=f,c?c.unregistered=s.teardownCheck:r.register(f,s.teardownCheck),p(i())},replace:function(n,i,a){var u=n.slice(0),c=e.frag(i);return r.register(n,a),"string"==typeof i&&(c=e.view.hookup(c,n[0].parentNode)),r.update(n,o(c)),t.replace(u,c),n},text:function(n,i,a,o){var c=t.getParentNode(n,a),s=u(c,i,function(t,n,r){"unknown"!=typeof d.nodeValue&&(d.nodeValue=e.view.toStr(n)),s.teardownCheck(d.parentNode)}),d=n.ownerDocument.createTextNode(e.view.toStr(i()));o?(o.unregistered=s.teardownCheck,s.nodeList=o,r.update(o,[d]),t.replace([n],d)):s.nodeList=f.replace([n],d,s.teardownCheck)},setAttributes:function(t,n){var r=c(n);for(var i in r)e.attr.set(t,i,r[i])},attributes:function(n,r,i){var a={},o=function(r){var i,o=c(r);for(i in o){var u=o[i],s=a[i];u!==s&&e.attr.set(n,i,u),delete a[i]}for(i in a)t.removeAttr(n,i);a=o};u(n,r,function(e,t){o(t)}),arguments.length>=3?a=c(i):o(r())},attributePlaceholder:"__!!__",attributeReplace:/__!!__/g,attribute:function(n,r,i){u(n,i,function(e,i){t.setAttr(n,r,c.render())});var a,o=e.$(n);a=e.data(o,"hooks"),a||e.data(o,"hooks",a={});var c,s=t.getAttr(n,r),d=s.split(f.attributePlaceholder),l=[];l.push(d.shift(),d.join(f.attributePlaceholder)),a[r]?a[r].computes.push(i):a[r]={render:function(){var e=0,n=s?s.replace(f.attributeReplace,function(){return t.contentText(c.computes[e++]())}):t.contentText(c.computes[e++]());return n},computes:[i],batchNum:void 0},c=a[r],l.splice(1,0,i()),t.setAttr(n,r,l.join(""))},specialAttribute:function(e,n,r){u(e,r,function(r,i){t.setAttr(e,n,v(i))}),t.setAttr(e,n,v(r()))},simpleAttribute:function(e,n,r){u(e,r,function(r,i){t.setAttr(e,n,i)}),t.setAttr(e,n,r())}};f.attr=f.simpleAttribute,f.attrs=f.attributes;var p=/(\r|\n)+/g,v=function(e){var n=/^["'].*["']$/;return e=e.replace(t.attrReg,"").replace(p,""),n.test(e)?e.substr(1,e.length-2):e};return e.view.live=f,f});
/*can@2.3.0-pre.1#view/render*/
define("can/view/render",["can/view/view","can/view/elements","can/view/live/live","can/util/string/string"],function(t,n,e){var i,r=[],u=function(t){var e=n.tagMap[t]||"span";return"span"===e?"@@!!@@":"<"+e+">"+u(e)+"</"+e+">"},o=function(n,e){if("string"==typeof n)return n;if(!n&&0!==n)return"";var i=n.hookup&&function(t,e){n.hookup.call(n,t,e)}||"function"==typeof n&&n;return i?e?"<"+e+" "+t.view.hook(i)+"></"+e+">":(r.push(i),""):""+n},c=function(n,e){return"string"==typeof n||"number"==typeof n?t.esc(n):o(n,e)},s=!1,a=function(){};return t.extend(t.view,{live:e,setupLists:function(){var n,e=t.view.lists;return t.view.lists=function(t,e){return n={list:t,renderer:e},Math.random()},function(){return t.view.lists=e,n}},getHooks:function(){var t=r.slice(0);return i=t,r=[],t},onlytxt:function(t,n){return c(n.call(t))},txt:function(f,p,l,v,h){var w,g,d,b,y=n.tagMap[p]||"span",k=!1,m=a;if(s)w=h.call(v);else{("string"==typeof l||1===l)&&(s=!0);var x=t.view.setupLists();m=function(){d.unbind("change",a)},d=t.compute(h,v,!1),d.bind("change",a),g=x(),w=d(),s=!1,k=d.computeInstance.hasDependencies}if(g)return m(),"<"+y+t.view.hook(function(t,n){e.list(t,g.list,g.renderer,v,n)})+"></"+y+">";if(!k||"function"==typeof w)return m(),(s||2===f||!f?o:c)(w,0===l&&y);var M=n.tagToContentPropMap[p];return 0!==l||M?1===l?(r.push(function(t){e.attributes(t,d,d()),m()}),d()):2===f?(b=l,r.push(function(t){e.specialAttribute(t,b,d),m()}),d()):(b=0===l?M:l,(0===l?i:r).push(function(t){e.attribute(t,b,d),m()}),e.attributePlaceholder):"<"+y+t.view.hook(f&&"object"!=typeof w?function(t,n){e.text(t,d,n),m()}:function(t,n){e.html(t,d,n),m()})+">"+u(y)+"</"+y+">"}}),t});
/*can@2.3.0-pre.1#view/stache/utils*/
define("can/view/stache/utils",["can/util/util"],function(){return{isArrayLike:function(t){return t&&t.splice&&"number"==typeof t.length},isObserveLike:function(t){return t instanceof can.Map||t&&!!t._get},emptyHandler:function(){},jsonParse:function(str){return"'"===str[0]?str.substr(1,str.length-2):"undefined"===str?void 0:can.global.JSON?JSON.parse(str):eval("("+str+")")},mixins:{last:function(){return this.stack[this.stack.length-1]},add:function(t){this.last().add(t)},subSectionDepth:function(){return this.stack.length-1}}}});
/*can@2.3.0-pre.1#view/stache/mustache_helpers*/
define("can/view/stache/mustache_helpers",["can/util/util","can/view/stache/utils","can/view/live/live"],function(e,n,t){t=t||e.view.live;var i=function(t){return n.isObserveLike(t)&&n.isArrayLike(t)&&t.attr("length")?t:e.isFunction(t)?t():t},r={each:function(r,s){var o,u,a,c=i(r),f=[];if(c instanceof e.List)return function(n){var i=[n];i.expression="live.list",e.view.nodeLists.register(i,null,s.nodeList),e.view.nodeLists.update(s.nodeList,[n]);var o=function(e,n,t){return s.fn(s.scope.add({"@index":n}).add(e),s.options,t)};t.list(n,r,o,s.context,n.parentNode,i)};var l=c;if(l&&n.isArrayLike(l))for(a=0;a<l.length;a++)f.push(s.fn(s.scope.add({"@index":a}).add(l[a])));else if(n.isObserveLike(l))for(o=e.Map.keys(l),a=0;a<o.length;a++)u=o[a],f.push(s.fn(s.scope.add({"@key":u}).add(l[u])));else if(l instanceof Object)for(u in l)f.push(s.fn(s.scope.add({"@key":u}).add(l[u])));return f},"@index":function(n,t){t||(t=n,n=0);var i=t.scope.attr("@index");return""+((e.isFunction(i)?i():i)+n)},"if":function(n,t){var r;return r=e.isFunction(n)?e.compute.truthy(n)():!!i(n),r?t.fn(t.scope||this):t.inverse(t.scope||this)},is:function(){var n,t,r=arguments[arguments.length-1];if(arguments.length-2<=0)return r.inverse();for(var s=0;s<arguments.length-1;s++){if(t=i(arguments[s]),t=e.isFunction(t)?t():t,s>0&&t!==n)return r.inverse();n=t}return r.fn()},eq:function(){return r.is.apply(this,arguments)},unless:function(n,t){return r["if"].apply(this,[e.isFunction(n)?e.compute(function(){return!n()}):!n,t])},"with":function(e,n){var t=e;return e=i(e),e?n.fn(t):void 0},log:function(e,n){"undefined"!=typeof console&&console.log&&(n?console.log(e,n.context):console.log(e.context))},data:function(n){var t=2===arguments.length?this:arguments[1];return function(i){e.data(e.$(i),n,t||this.context)}}},s=function(e,n){r[e]=n};return{registerHelper:s,registerSimpleHelper:function(n,t){s(n,e.view.simpleHelper(t))},getHelper:function(e,n){var t=n.attr("helpers."+e);return t||(t=r[e]),t?{fn:t}:void 0}}});
/*can@2.3.0-pre.1#view/stache/mustache_core*/
define("can/view/stache/mustache_core",["can/util/util","can/view/stache/utils","can/view/stache/mustache_helpers","can/view/live/live","can/view/elements","can/view/scope/scope","can/view/node_lists/node_lists"],function(e,t,n,r,i,a,s){r=r||e.view.live,i=i||e.view.elements,a=a||e.view.Scope,s=s||e.view.nodeLists;var o=/((([^'"\s]+?=)?('.*?'|".*?"))|.*?)\s/g,u=/^(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(?:(.+?)=(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(.+))))$/,c=/(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g,l=function(e){return e&&"string"==typeof e.get},f=function(t,n,r,i){for(var a=(e.document||e.global.document).createDocumentFragment(),s=0,o=t.length;o>s;s++)p(a,r.fn(n?t.attr(""+s):t[s],i));return a},p=function(e,t){t&&e.appendChild("string"==typeof t?e.ownerDocument.createTextNode(t):t)},h=function(e,t,n,r){for(var i="",a=0,s=e.length;s>a;a++)i+=n.fn(t?e.attr(""+a):e[a],r);return i},v=function(t,n,r){var i=n.computeData(t,{isArgument:r,args:[n.attr("."),n]});return e.compute.temporarilyBind(i.compute),i},d=function(e,t){var n=v(e,t,!0);return n.compute.computeInstance.hasDependencies?n.compute:n.initialValue},g=function(e,t,n,r,i,a){i&&(e.fn=m(i,t,n,r)),a&&(e.inverse=m(a,t,n,r))},m=function(t,n,r,i){var a=function(e,r,i){return t(e||n,r,i)};return e.__notObserve(function(t,s,o){void 0===t||t instanceof e.view.Scope||(t=n.add(t)),void 0===s||s instanceof x.Options||(s=r.add(s));var u=a(t,s||r,o||i);return u})},x={expressionData:function(n){var r=[],i={},a=0;return(e.trim(n)+" ").replace(o,function(e,n){var s;a&&(s=n.match(u))?s[1]||s[2]?r.push(t.jsonParse(s[1]||s[2])):i[s[3]]=s[6]?{get:s[6]}:t.jsonParse(s[4]||s[5]):r.push({get:n}),a++}),{name:r.shift(),args:r,hash:i}},makeEvaluator:function(r,i,a,s,o,u,c,p){for(var m,x,b,w=[],y={},O={fn:function(){},inverse:function(){}},_=r.attr("."),D=o.name,k=o.args.length||!e.isEmptyObject(o.hash),E=0,L=o.args.length;L>E;E++){var A=o.args[E];A&&l(A)?w.push(d(A.get,r,!0)):w.push(A)}for(var N in o.hash)l(o.hash[N])?y[N]=d(o.hash[N].get,r):y[N]=o.hash[N];if(l(D)&&(k&&(m=n.getHelper(D.get,i),m||"function"!=typeof _[D.get]||(m={fn:_[D.get]})),!m)){var S=D.get,B=v(D.get,r,!1),F=B.compute;x=B.initialValue,D=B.compute.computeInstance.hasDependencies?F:x,k||void 0!==x?"function"==typeof x&&(m={fn:x}):m=n.getHelper(S,i)}if("^"===s){var j=u;u=c,c=j}if(m)return g(O,r,i,a,u,c),e.simpleExtend(O,{context:_,scope:r,contexts:r,hash:y,nodeList:a,exprData:o}),w.push(O),b=function(){return m.fn.apply(_,w)||""},b.bindOnce=!1,b;if(!s)return D&&D.isComputed?D:function(){return""+(null!=D?D:"")};if("#"===s||"^"===s){g(O,r,i,a,u,c);var M=function(){var n;if(n=e.isFunction(D)&&D.isComputed?D():D,t.isArrayLike(n)){var a=t.isObserveLike(n);return(a?n.attr("length"):n.length)?(p?h:f)(n,a,O,i):O.inverse(r,i)}return n?O.fn(n||r,i):O.inverse(r,i)};return M.bindOnce=!1,M}},makeLiveBindingPartialRenderer:function(t,n){return t=e.trim(t),function(i,a,o){var u=[this];u.expression=">"+t,s.register(u,null,n.directlyNested?o||!0:!0);var c=e.compute(function(){var n,r=t,s=a.attr("partials."+r);if(s)n=s.render?s.render(i,a):s(i,a);else{var o=i.read(r,{isArgument:!0,returnObserveMethods:!0,proxyMethods:!1}).value;if(null===o)return e.frag("");o&&(r=o),n=e.isFunction(r)?r(i,a):e.view.render(r,i,a)}return e.frag(n)});r.html(this,c,this.parentNode,u)}},makeStringBranchRenderer:function(e,t){var n=w(t),r=e+t;return function(t,i,a,s){var o=t.__cache[r];(e||!o)&&(o=b(t,i,null,e,n,a,s,!0),e||(t.__cache[r]=o));var u=o();return null==u?"":""+u}},makeLiveBindingBranchRenderer:function(t,n,a){var o=w(n);return function(u,c,l,f,p){var h=[this];h.expression=n,s.register(h,null,a.directlyNested?l||!0:!0);var v=b(u,c,h,t,o,f,p,a.tag),d=e.compute(v,null,!1,v.bindOnce===!1?!1:!0);d.bind("change",e.k);var g=d();if("function"==typeof g){var m=e.__clearObserved();g(this),e.__setObserved(m)}else d.computeInstance.hasDependencies?a.attr?r.simpleAttribute(this,a.attr,d):a.tag?r.attributes(this,d):a.text&&"object"!=typeof g?r.text(this,d,this.parentNode,h):r.html(this,d,this.parentNode,h):a.attr?e.attr.set(this,a.attr,g):a.tag?r.setAttributes(this,g):a.text&&"string"==typeof g?this.nodeValue=g:g&&i.replace([this],e.frag(g,this.ownerDocument));d.unbind("change",e.k)}},splitModeFromExpression:function(t,n){t=e.trim(t);var r=t.charAt(0);return"#/{&^>!".indexOf(r)>=0?t=e.trim(t.substr(1)):r=null,"{"===r&&n.node&&(r=null),{mode:r,expression:t}},cleanLineEndings:function(e){return e.replace(c,function(e,t,n,r,i,a,s,o,u,c){a=a||"",t=t||"",n=n||"";var l=y(i||u,{});return o||">{".indexOf(l.mode)>=0?e:"^#!/".indexOf(l.mode)>=0?r+(0!==c&&s.length?t+"\n":""):n+r+a+(n.length||0!==c?t+"\n":"")})},Options:e.view.Scope.extend({init:function(t,n){t.helpers||t.partials||t.tags||(t={helpers:t}),e.view.Scope.prototype.init.apply(this,arguments)}})},b=x.makeEvaluator,w=x.expressionData,y=x.splitModeFromExpression;return x});
/*can@2.3.0-pre.1#view/bindings/bindings*/
define("can/view/bindings/bindings",["can/util/util","can/view/stache/mustache_core","can/view/callbacks/callbacks","can/control/control","can/view/scope/scope"],function(e,t){var n=function(){var e={"":!0,"true":!0,"false":!1},t=function(t){if(t&&t.getAttribute){var n=t.getAttribute("contenteditable");return e[n]}};return function(e){var n=t(e);return"boolean"==typeof n?n:!!t(e.parentNode)}}(),i=function(e,t,n){return t=t||"{",n=n||"}",e[0]===t&&e[e.length-1]===n?e.substr(1,e.length-2):e};e.view.attr("can-value",function(t,a){var s,l,h=e.trim(i(t.getAttribute("can-value"))),v=a.scope.computeData(h,{args:[]}).compute;return"input"===t.nodeName.toLowerCase()&&("checkbox"===t.type&&(s=e.attr.has(t,"can-true-value")?t.getAttribute("can-true-value"):!0,l=e.attr.has(t,"can-false-value")?t.getAttribute("can-false-value"):!1),"checkbox"===t.type||"radio"===t.type)?void new u(t,{value:v,trueValue:s,falseValue:l}):"select"===t.nodeName.toLowerCase()&&t.multiple?void new r(t,{value:v}):n(t)?void new c(t,{value:v}):void new o(t,{value:v})});var a={enter:function(e,t,n){return{event:"keyup",handler:function(e){return 13===e.keyCode?n.call(this,e):void 0}}}},s=function(n,s){var o=s.attributeName,u=0===o.indexOf("can-")?o.substr("can-".length):i(o,"(",")"),r=function(a){var u=n.getAttribute(o);if(u){var r=t.expressionData(i(u)),c=s.scope.read(r.name.get,{returnObserveMethods:!0,isArgument:!0,executeAnonymousFunctions:!0}),l=[],h=e.$(this),v=e.viewModel(h[0]),f=s.scope.add({"@element":h,"@event":a,"@viewModel":v,"@scope":s.scope,"@context":s.scope._context});if(!e.isEmptyObject(r.hash)){var p={};e.each(r.hash,function(e,t){if(e&&e.hasOwnProperty("get")){var n=e.get.indexOf("@")?s.scope:f;p[t]=n.read(e.get,{}).value}else p[t]=e}),l.unshift(p)}if(r.args.length)for(var d,m=r.args.length-1;m>=0;m--)if(d=r.args[m],d&&d.hasOwnProperty("get")){var g=d.get.indexOf("@")?s.scope:f;l.unshift(g.read(d.get,{}).value)}else l.unshift(d);return l.length||(l=[s.scope._context,h].concat(e.makeArray(arguments))),c.value.apply(c.parent,l)}};if(a[u]){var c=a[u](s,n,r);r=c.handler,u=c.event}e.bind.call(n,u,r)};e.view.attr(/can-[\w\.]+/,s),e.view.attr(/\([\w\.]+\)/,s);var o=e.Control.extend({init:function(){"SELECT"===this.element[0].nodeName.toUpperCase()?setTimeout(e.proxy(this.set,this),1):this.set()},"{value} change":"set",set:function(){if(this.element){var e=this.options.value();this.element[0].value=null==e?"":e}},change:function(){if(this.element){var e=this.element[0];this.options.value(e.value);var t=this.options.value();e.value!==t&&(e.value=t)}}}),u=e.Control.extend({init:function(){this.isCheckbox="checkbox"===this.element[0].type.toLowerCase(),this.check()},"{value} change":"check",check:function(){if(this.isCheckbox){var t=this.options.value(),n=this.options.trueValue||!0;this.element[0].checked=t==n}else{var i=this.options.value()==this.element[0].value?"set":"remove";e.attr[i](this.element[0],"checked",!0)}},change:function(){this.isCheckbox?this.options.value(this.element[0].checked?this.options.trueValue:this.options.falseValue):this.element[0].checked&&this.options.value(this.element[0].value)}}),r=o.extend({init:function(){this.delimiter=";",setTimeout(e.proxy(this.set,this),1)},set:function(){var t=this.options.value();"string"==typeof t?(t=t.split(this.delimiter),this.isString=!0):t&&(t=e.makeArray(t));var n={};e.each(t,function(e){n[e]=!0}),e.each(this.element[0].childNodes,function(e){e.value&&(e.selected=!!n[e.value])})},get:function(){var t=[],n=this.element[0].childNodes;return e.each(n,function(e){e.selected&&e.value&&t.push(e.value)}),t},change:function(){var t=this.get(),n=this.options.value();this.isString||"string"==typeof n?(this.isString=!0,this.options.value(t.join(this.delimiter))):n instanceof e.List?n.attr(t,!0):this.options.value(t)}}),c=e.Control.extend({init:function(){this.set(),this.on("blur","setValue")},"{value} change":"set",set:function(){var e=this.options.value();this.element[0].innerHTML="undefined"==typeof e?"":e},setValue:function(){this.options.value(this.element[0].innerHTML)}});e.view.attr(/\[[\w\.\-_]+\]/,function(t,n){var a=i(t.getAttribute(n.attributeName)),s=e.camelize(i(n.attributeName,"[","]")),o=e.viewModel(t),u=new e.view.Scope(o),r=u.computeData(a,{args:[]}),c=r.compute,l=function(e,t){n.scope.attr(s,t)};c.bind("change",l),n.scope.attr(s,c()),e.one.call(t,"removed",function(){c.unbind("change",l)})}),e.view.attr(/#[\w\.\-_]+/,function(t,n){var a=i(t.getAttribute(n.attributeName))||".",s=e.camelize(n.attributeName.substr(1).toLowerCase()),o=e.viewModel(t),u=new e.view.Scope(o),r=n.scope.getRefs(),c=u.computeData(a,{args:[],isArgument:!0}),l=c.compute,h=function(e,t){r.attr(s,t)};l.bind("change",h);var v=l();r.attr(s,void 0===v?null:v),e.one.call(t,"removed",function(){l.unbind("change",h)})})});
/*can@2.3.0-pre.1#view/mustache/mustache*/
define("can/view/mustache/mustache",["can/util/util","can/view/scope/scope","can/view/view","can/view/scanner","can/compute/compute","can/view/render","can/view/bindings/bindings"],function(e){e.view.ext=".mustache";var n="scope",t="___h4sh",r="{scope:"+n+",options:options}",i="{scope:"+n+",options:options, special: true}",s=n+",options",o=/((([^'"\s]+?=)?('.*?'|".*?"))|.*?)\s/g,a=/^(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)|((.+?)=(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|(.+))))$/,c=function(e){return'{get:"'+e.replace(/"/g,'\\"')+'"}'},u=function(e){return e&&"string"==typeof e.get},f=function(n){return n instanceof e.Map||n&&!!n._get},p=function(e){return e&&e.splice&&"number"==typeof e.length},l=function(n,t,r){var i=function(e,r){return n(e||t,r)};return function(n,s){return void 0===n||n instanceof e.view.Scope||(n=t.add(n)),void 0===s||s instanceof e.view.Options||(s=r.add(s)),i(n,s||r)}},h=function(n,t){if(this.constructor!==h){var r=new h(n);return function(e,n){return r.render(e,n)}}return"function"==typeof n?void(this.template={fn:n}):(e.extend(this,n),void(this.template=this.scanner.scan(this.text,this.name)))};e.Mustache=e.global.Mustache=h,h.prototype.render=function(n,t){return n instanceof e.view.Scope||(n=new e.view.Scope(n||{})),t instanceof e.view.Options||(t=new e.view.Options(t||{})),t=t||{},this.template.fn.call(n,n,t)},e.extend(h.prototype,{scanner:new e.view.Scanner({text:{start:"",scope:n,options:",options: options",argNames:s},tokens:[["returnLeft","{{{","{{[{&]"],["commentFull","{{!}}","^[\\s\\t]*{{!.+?}}\\n"],["commentLeft","{{!","(\\n[\\s\\t]*{{!|{{!)"],["escapeFull","{{}}","(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)",function(e){return{before:/^\n.+?\n$/.test(e)?"\n":"",content:e.match(/\{\{(.+?)\}\}/)[1]||""}}],["escapeLeft","{{"],["returnRight","}}}"],["right","}}"]],helpers:[{name:/^>[\s]*\w*/,fn:function(n,t){var r=e.trim(n.replace(/^>\s?/,"")).replace(/["|']/g,"");return"can.Mustache.renderPartial('"+r+"',"+s+")"}},{name:/^\s*data\s/,fn:function(e,t){var r=e.match(/["|'](.*)["|']/)[1];return"can.proxy(function(__){can.data(can.$(__),'"+r+"', this.attr('.')); }, "+n+")"}},{name:/\s*\(([\$\w]+)\)\s*->([^\n]*)/,fn:function(e){var t=/\s*\(([\$\w]+)\)\s*->([^\n]*)/,r=e.match(t);return"can.proxy(function(__){var "+r[1]+"=can.$(__);with("+n+".attr('.')){"+r[2]+"}}, this);"}},{name:/^.*$/,fn:function(n,u){var f=!1,p={content:"",startTxt:!1,startOnlyTxt:!1,end:!1};if(n=e.trim(n),n.length&&(f=n.match(/^([#^\/]|else$)/))){switch(f=f[0]){case"#":case"^":u.specialAttribute?p.startOnlyTxt=!0:(p.startTxt=!0,p.escaped=0);break;case"/":return p.end=!0,p.content+='return ___v1ew.join("");}}])',p}n=n.substring(1)}if("else"!==f){var l,h=[],v=[],g=0;p.content+="can.Mustache.txt(\n"+(u.specialAttribute?i:r)+",\n"+(f?'"'+f+'"':"null")+",",(e.trim(n)+" ").replace(o,function(e,n){g&&(l=n.match(a))?l[2]?h.push(l[0]):v.push(l[4]+":"+(l[6]?l[6]:c(l[5]))):h.push(c(n)),g++}),p.content+=h.join(","),v.length&&(p.content+=",{"+t+":{"+v.join(",")+"}}")}switch(f&&"else"!==f&&(p.content+=",[\n\n"),f){case"^":case"#":p.content+="{fn:function("+s+"){var ___v1ew = [];";break;case"else":p.content+='return ___v1ew.join("");}},\n{inverse:function('+s+"){\nvar ___v1ew = [];";break;default:p.content+=")"}return f||(p.startTxt=!0,p.end=!0),p}}]})});for(var v=e.view.Scanner.prototype.helpers,g=0;g<v.length;g++)h.prototype.scanner.helpers.unshift(v[g]);return h.txt=function(n,r,i){for(var s,o,a=n.scope,c=n.options,v=[],g={fn:function(){},inverse:function(){}},d=a.attr("."),m=!0,w=3;w<arguments.length;w++){var _=arguments[w];if(r&&e.isArray(_))g=e.extend.apply(e,[g].concat(_));else if(_&&_[t]){s=_[t];for(var x in s)u(s[x])&&(s[x]=h.get(s[x].get,n,!1,!0))}else _&&u(_)?v.push(h.get(_.get,n,!1,!0,!0)):v.push(_)}if(u(i)){var y=i.get;i=h.get(i.get,n,v.length,!1),m=y===i}if(g.fn=l(g.fn,a,c),g.inverse=l(g.inverse,a,c),"^"===r){var b=g.fn;g.fn=g.inverse,g.inverse=b}return(o=m&&"string"==typeof i&&h.getHelper(i,c)||e.isFunction(i)&&!i.isComputed&&{fn:i})?(e.extend(g,{context:d,scope:a,contexts:a,hash:s}),v.push(g),function(){return o.fn.apply(d,v)||""}):function(){var n;n=e.isFunction(i)&&i.isComputed?i():i;var t,s,o,a=v.length?v:[n],c=!0,u=[];if(r)for(t=0;t<a.length;t++)o=a[t],s="undefined"!=typeof o&&f(o),p(o)?"#"===r?c=c&&!!(s?o.attr("length"):o.length):"^"===r&&(c=c&&!(s?o.attr("length"):o.length)):c="#"===r?c&&!!o:"^"===r?c&&!o:c;if(c){if("#"===r){if(p(n)){var l=f(n);for(t=0;t<n.length;t++)u.push(g.fn(l?n.attr(""+t):n[t]));return u.join("")}return g.fn(n||{})||""}return"^"===r?g.inverse(n||{})||"":""+(null!=n?n:"")}return""}},h.get=function(n,t,r,i,s){var o=t.scope.attr("."),a=t.options||{};if(r){if(h.getHelper(n,a))return n;if(t.scope&&e.isFunction(o[n]))return o[n]}var c=t.scope.computeData(n,{isArgument:i,args:[o,t.scope]}),u=c.compute;e.compute.temporarilyBind(u);var f=c.initialValue;h.getHelper(n,a);return s||void 0!==f&&c.scope===t.scope||!h.getHelper(n,a)?u.computeInstance.hasDependencies?u:f:n},h.resolve=function(n){return f(n)&&p(n)&&n.attr("length")?n:e.isFunction(n)?n():n},e.view.Options=e.view.Scope.extend({init:function(n,t){n.helpers||n.partials||n.tags||(n={helpers:n}),e.view.Scope.prototype.init.apply(this,arguments)}}),h._helpers={},h.registerHelper=function(e,n){this._helpers[e]={name:e,fn:n}},h.registerSimpleHelper=function(n,t){h.registerHelper(n,e.view.simpleHelper(t))},h.getHelper=function(e,n){var t;return n&&(t=n.attr("helpers."+e)),t?{fn:t}:this._helpers[e]},h.render=function(n,t,r){if(!e.view.cached[n]){var i=e.__clearReading(),s=t.attr(n);s&&(n=s),e.__setReading(i)}return e.view.render(n,t,r)},h.safeString=function(e){return{toString:function(){return e}}},h.renderPartial=function(n,t,r){var i=r.attr("partials."+n);return i?i.render?i.render(t,r):i(t,r):e.Mustache.render(n,t,r)},e.each({"if":function(n,t){var r;return r=e.isFunction(n)?e.compute.truthy(n)():!!h.resolve(n),r?t.fn(t.contexts||this):t.inverse(t.contexts||this)},is:function(){var n,t,r=arguments[arguments.length-1];if(arguments.length-2<=0)return r.inverse();for(var i=0;i<arguments.length-1;i++){if(t=h.resolve(arguments[i]),t=e.isFunction(t)?t():t,i>0&&t!==n)return r.inverse();n=t}return r.fn()},eq:function(){return h._helpers.is.fn.apply(this,arguments)},unless:function(n,t){return h._helpers["if"].fn.apply(this,[e.isFunction(n)?e.compute(function(){return!n()}):!n,t])},each:function(n,t){var r,i,s,o=h.resolve(n),a=[];if(e.view.lists&&(o instanceof e.List||n&&n.isComputed&&void 0===o))return e.view.lists(n,function(e,n){return t.fn(t.scope.add({"@index":n}).add(e))});if(n=o,n&&p(n)){for(s=0;s<n.length;s++)a.push(t.fn(t.scope.add({"@index":s}).add(n[s])));return a.join("")}if(f(n)){for(r=e.Map.keys(n),s=0;s<r.length;s++)i=r[s],a.push(t.fn(t.scope.add({"@key":i}).add(n[i])));return a.join("")}if(n instanceof Object){for(i in n)a.push(t.fn(t.scope.add({"@key":i}).add(n[i])));return a.join("")}},"with":function(e,n){var t=e;return e=h.resolve(e),e?n.fn(t):void 0},log:function(e,n){"undefined"!=typeof console&&console.log&&(n?console.log(e,n.context):console.log(e.context))},"@index":function(n,t){t||(t=n,n=0);var r=t.scope.attr("@index");return""+((e.isFunction(r)?r():r)+n)}},function(e,n){h.registerHelper(n,e)}),e.view.register({suffix:"mustache",contentType:"x-mustache-template",script:function(e,n){return"can.Mustache(function("+s+") { "+new h({text:n,name:e}).template.out+" })"},renderer:function(e,n){return h({text:n,name:e})}}),e.mustache.registerHelper=e.proxy(e.Mustache.registerHelper,e.Mustache),e.mustache.safeString=e.Mustache.safeString,e});
/*can@2.3.0-pre.1#component/component*/
define("can/component/component",["can/util/util","can/view/callbacks/callbacks","can/view/elements","can/control/control","can/observe/observe","can/view/mustache/mustache","can/view/bindings/bindings"],function(t,e,n){var o=/^(dataViewId|class|id|\[[\w\.-]+\]|#[\w\.-])$/i,i=/\{([^\}]+)\}/g,s=t.Component=t.Construct.extend({setup:function(){if(t.Construct.setup.apply(this,arguments),t.Component){var e=this,n=this.prototype.scope||this.prototype.viewModel;if(this.Control=a.extend(this.prototype.events),n&&("object"!=typeof n||n instanceof t.Map)?n.prototype instanceof t.Map&&(this.Map=n):this.Map=t.Map.extend(n||{}),this.attributeScopeMappings={},t.each(this.Map?this.Map.defaults:{},function(t,n){"@"===t&&(e.attributeScopeMappings[n]=n)}),this.prototype.template)if("function"==typeof this.prototype.template){var o=this.prototype.template;this.renderer=function(){return t.view.frag(o.apply(null,arguments))}}else this.renderer=t.view.mustache(this.prototype.template);t.view.tag(this.prototype.tag,function(t,n){new e(t,n)})}}},{setup:function(i,s){var a,c,p={"@root":s.scope.attr("@root")},r=this,u=("undefined"==typeof this.leakScope?!1:!this.leakScope)&&this.template,l={},h=this.scope||this.viewModel,d={},f=[],m=function(){for(var t=0,e=f.length;e>t;t++)f[t]()};if(t.each(this.constructor.attributeScopeMappings,function(e,n){p[n]=i.getAttribute(t.hyphenate(e))}),t.each(t.makeArray(i.attributes),function(n,i){var c=t.camelize(n.name.toLowerCase()),u=n.value;if(!(r.constructor.attributeScopeMappings[c]||o.test(c)||e.attr(n.nodeName))){if("{"===u[0]&&"}"===u[u.length-1])u=u.substr(1,u.length-2);else if("legacy"!==s.templateType)return void(p[c]=u);var h=s.scope.computeData(u,{args:[]}),m=h.compute,v=function(e,n){d[c]=(d[c]||0)+1,a.attr(c,n),t.batch.afterPreviousEvents(function(){--d[c]})};m.bind("change",v),p[c]=m(),m.computeInstance.hasDependencies?(f.push(function(){m.unbind("change",v)}),l[c]=h):m.unbind("change",v)}}),this.constructor.Map)a=new this.constructor.Map(p);else if(h instanceof t.Map)a=h;else if(t.isFunction(h)){var v=h.call(this,p,s.scope,i);a=v instanceof t.Map?v:v.prototype instanceof t.Map?new v(p):new(t.Map.extend(v))(p)}var g={};t.each(l,function(t,e){g[e]=function(n,o){d[e]||t.compute(o)},a.bind(e,g[e])}),t.isEmptyObject(this.constructor.attributeScopeMappings)&&"legacy"===s.templateType||t.bind.call(i,"attributes",function(e){var n=t.camelize(e.attributeName);l[n]||o.test(n)||a.attr(n,i.getAttribute(e.attributeName))}),this.scope=this.viewModel=a,t.data(t.$(i),"scope",this.scope),t.data(t.$(i),"viewModel",this.scope);var b=(u?t.view.Scope.refsScope():s.scope.add(new t.view.Scope.Refs)).add(this.scope),y={helpers:{}},w=function(t,e){y.helpers[t]=function(){return e.apply(a,arguments)}};if(t.each(this.helpers||{},function(e,n){t.isFunction(e)&&w(n,e)}),t.each(this.simpleHelpers||{},function(e,n){w(n,t.view.simpleHelper(e))}),f.push(function(){t.each(g,function(t,e){a.unbind(e,g[e])})}),this._control=new this.constructor.Control(i,{scope:this.scope,viewModel:this.scope}),this._control&&this._control.destroy){var M=this._control.destroy;this._control.destroy=function(){M.apply(this,arguments),m()},this._control.on()}else t.bind.call(i,"removed",function(){m()});var C=t.view.nodeLists.register([],void 0,!0);f.push(function(){t.view.nodeLists.unregister(C)}),this.constructor.renderer?(y.tags||(y.tags={}),y.tags.content=function _(e,o){var i=s.subtemplate||o.subtemplate,a=i===s.subtemplate;if(i){delete y.tags.content;var c;if(c=a?u?s:{scope:o.scope.cloneFromRef(),options:o.options}:o,o.parentNodeList){var p=i(c.scope,c.options,o.parentNodeList);n.replace([e],p)}else t.view.live.replace([e],i(c.scope,c.options));y.tags.content=_}},c=this.constructor.renderer(b,s.options.add(y),C)):c="legacy"===s.templateType?t.view.frag(s.subtemplate?s.subtemplate(b,s.options.add(y)):""):s.subtemplate?s.subtemplate(b,s.options.add(y),C):document.createDocumentFragment(),t.appendChild(i,c,t.document),t.view.nodeLists.update(C,t.childNodes(i))}}),a=t.Control.extend({_lookup:function(t){return[t.scope,t,window]},_action:function(e,n,o){var s,a;if(i.lastIndex=0,s=i.test(e),o||!s){if(s){a=t.compute(function(){var o,s=e.replace(i,function(e,i){var s;return"scope"===i||"viewModel"===i?(o=n.scope,""):(i=i.replace(/^(scope|^viewModel)\./,""),s=t.compute.read(n.scope,i.split("."),{isArgument:!0}).value,void 0===s&&(s=t.getObject(i)),"string"==typeof s?s:(o=s,""))}),a=s.split(/\s+/g),c=a.pop();return{processor:this.processors[c]||this.processors.click,parts:[s,a.join(" "),c],delegate:o||void 0}},this);var c=function(t,n){o._bindings.control[e](o.element),o._bindings.control[e]=n.processor(n.delegate||o.element,n.parts[2],n.parts[1],e,o)};return a.bind("change",c),o._bindings.readyComputes[e]={compute:a,handler:c},a()}return t.Control._action.apply(this,arguments)}}},{setup:function(e,n){return this.scope=n.scope,this.viewModel=n.viewModel,t.Control.prototype.setup.call(this,e,n)},off:function(){this._bindings&&t.each(this._bindings.readyComputes||{},function(t){t.compute.unbind("change",t.handler)}),t.Control.prototype.off.apply(this,arguments),this._bindings.readyComputes={}}}),c=t.$;return c.fn&&(c.fn.scope=c.fn.viewModel=function(){return t.viewModel.apply(t,[this].concat(t.makeArray(arguments)))}),s});
/*can@2.3.0-pre.1#model/model*/
define("can/model/model",["can/util/util","can/map/map","can/list/list"],function(t){var e=function(e,r,i){var n=new t.Deferred;return e.then(function(){var e=t.makeArray(arguments),s=!0;try{e[0]=i.apply(r,e)}catch(o){s=!1,n.rejectWith(n,[o].concat(e))}s&&n.resolveWith(n,e)},function(){n.rejectWith(this,arguments)}),"function"==typeof e.abort&&(n.abort=function(){return e.abort()}),n},r=0,i=function(e){return t.__observe(e,e.constructor.id),e.__get(e.constructor.id)},n=function(e,r,i,n,s,o){var a={};if("string"==typeof e){var u=e.split(/\s+/);a.url=u.pop(),u.length&&(a.type=u.pop())}else t.extend(a,e);return a.data="object"!=typeof r||t.isArray(r)?r:t.extend(a.data||{},r),a.url=t.sub(a.url,a.data,!0),t.ajax(t.extend({type:i||"post",dataType:n||"json",success:s,error:o},a))},s=function(r,n,s,o,a){var u;t.isArray(r)?(u=r[1],r=r[0]):u=r.serialize(),u=[u];var c,l,d=r.constructor;return("update"===n||"destroy"===n)&&u.unshift(i(r)),l=d[n].apply(d,u),c=e(l,r,function(t){return r[a||n+"d"](t,l),r}),l.abort&&(c.abort=function(){l.abort()}),c.then(s,o),c},o={models:function(e,r,i){if(t.Model._reqs++,e){if(e instanceof this.List)return e;var n=this,s=[],o=n.List||f,a=r instanceof t.List?r:new o,u=e instanceof f,c=u?e.serialize():e;if(c=n.parseModels(c,i),c.data&&(e=c,c=c.data),"undefined"==typeof c||!t.isArray(c))throw new Error("Could not get any raw data while converting using .models");return a.length&&a.splice(0),t.each(c,function(t){s.push(n.model(t,i))}),a.push.apply(a,s),t.isArray(e)||t.each(e,function(t,e){"data"!==e&&a.attr(e,t)}),setTimeout(t.proxy(this._clean,this),1),a}},model:function(e,r,i){if(e){e="function"==typeof e.serialize?e.serialize():this.parseModel(e,i);var n=e[this.id];(n||0===n)&&this.store[n]&&(r=this.store[n]);var s=r&&t.isFunction(r.attr)?r.attr(e,this.removeAttr||!1):new this(e);return s}}},a={parseModel:function(e){return function(r){return e?t.getObject(e,r):r}},parseModels:function(e){return function(r){if(t.isArray(r))return r;e=e||"data";var i=t.getObject(e,r);if(!t.isArray(i))throw new Error("Could not get any raw data while converting using .models");return i}}},u={create:{url:"_shortName",type:"post"},update:{data:function(e,r){r=r||{};var i=this.id;return r[i]&&r[i]!==e&&(r["new"+t.capitalize(e)]=r[i],delete r[i]),r[i]=e,r},type:"put"},destroy:{type:"delete",data:function(t,e){return e=e||{},e.id=e[this.id]=t,e}},findAll:{url:"_shortName"},findOne:{}},c=function(t,e){return function(r){return r=t.data?t.data.apply(this,arguments):r,n(e||this[t.url||"_url"],r,t.type||"get")}},l=function(t,e){if(t.resource){var r=t.resource.replace(/\/+$/,"");return"findAll"===e||"create"===e?r:r+"/{"+t.id+"}"}};t.Model=t.Map.extend({fullName:"can.Model",_reqs:0,setup:function(e,i,n,s){if("string"!=typeof i&&(s=n,n=i),s||(s=n),this.store={},t.Map.setup.apply(this,arguments),t.Model){n&&n.List?(this.List=n.List,this.List.Map=this):this.List=e.List.extend({Map:this},{});var d=this,p=t.proxy(this._clean,d);t.each(u,function(r,i){if(n&&n[i]&&("string"==typeof n[i]||"object"==typeof n[i])?d[i]=c(r,n[i]):n&&n.resource&&!t.isFunction(n[i])&&(d[i]=c(r,l(d,i))),d["make"+t.capitalize(i)]){var s=d["make"+t.capitalize(i)](d[i]);t.Construct._overwrite(d,e,i,function(){t.Model._reqs++;var e=s.apply(this,arguments),r=e.then(p,p);return r.abort=e.abort,r})}});var h={};t.each(o,function(r,i){var s="parse"+t.capitalize(i),o=n&&n[i]||d[i];"string"==typeof o?(d[s]=o,t.Construct._overwrite(d,e,i,r)):n&&n[i]&&(h[s]=!0)}),t.each(a,function(r,i){var s=n&&n[i]||d[i];if("string"==typeof s)t.Construct._overwrite(d,e,i,r(s));else if(!(n&&t.isFunction(n[i])||d[i])){var o=r();o.useModelConverter=h[i],t.Construct._overwrite(d,e,i,o)}}),"can.Model"!==d.fullName&&d.fullName||(d.fullName="Model"+ ++r),t.Model._reqs=0,this._url=this._shortName+"/{"+this.id+"}"}},_ajax:c,_makeRequest:s,_clean:function(){if(t.Model._reqs--,!t.Model._reqs)for(var e in this.store)this.store[e]._bindings||delete this.store[e];return arguments[0]},models:o.models,model:o.model},{setup:function(e){var r=e&&e[this.constructor.id];t.Model._reqs&&null!=r&&(this.constructor.store[r]=this),t.Map.prototype.setup.apply(this,arguments)},isNew:function(){var t=i(this);return!(t||0===t)},save:function(t,e){return s(this,this.isNew()?"create":"update",t,e)},destroy:function(e,r){if(this.isNew()){var i=this,n=t.Deferred();return n.then(e,r),n.done(function(t){i.destroyed(t)}).resolve(i)}return s(this,"destroy",e,r,"destroyed")},_bindsetup:function(){var e=this.__get(this.constructor.id);return null!=e&&(this.constructor.store[e]=this),t.Map.prototype._bindsetup.apply(this,arguments)},_bindteardown:function(){return delete this.constructor.store[i(this)],t.Map.prototype._bindteardown.apply(this,arguments)},___set:function(e,r){t.Map.prototype.___set.call(this,e,r),e===this.constructor.id&&this._bindings&&(this.constructor.store[i(this)]=this)}});var d=function(t){return function(e,r,i){return this[t](e,null,i)}},p=function(t){return this.parseModel.useModelConverter?this.model(t):this.parseModel(t)},h={makeFindAll:d("models"),makeFindOne:d("model"),makeCreate:p,makeUpdate:p,makeDestroy:p};t.each(h,function(r,i){t.Model[i]=function(i){return function(){var n=t.makeArray(arguments),s=t.isFunction(n[1])?n.splice(0,1):n.splice(0,2),o=e(i.apply(this,s),this,r);return o.then(n[0],n[1]),o}}}),t.each(["created","updated","destroyed"],function(e){t.Model.prototype[e]=function(r){var i=this,n=i.constructor;r&&"object"==typeof r&&this.attr(t.isFunction(r.attr)?r.attr():r),t.dispatch.call(this,{type:"change",target:this},[e]),t.dispatch.call(n,e,[this])}});var f=t.Model.List=t.List.extend({_bubbleRule:function(e,r){var i=t.List._bubbleRule(e,r);return i.push("destroyed"),i}},{setup:function(e){t.isPlainObject(e)&&!t.isArray(e)?(t.List.prototype.setup.apply(this),this.replace(t.isDeferred(e)?e:this.constructor.Map.findAll(e))):t.List.prototype.setup.apply(this,arguments),this._init=1,this.bind("destroyed",t.proxy(this._destroyed,this)),delete this._init},_destroyed:function(t,e){if(/\w+/.test(e))for(var r;(r=this.indexOf(t.target))>-1;)this.splice(r,1)}});return t.Model});
/*can@2.3.0-pre.1#util/string/deparam/deparam*/
define("can/util/string/deparam/deparam",["can/util/util","can/util/string/string"],function(t){var n=/^\d+$/,e=/([^\[\]]+)|(\[\])/g,r=/([^?#]*)(#.*)?$/,i=function(t){return decodeURIComponent(t.replace(/\+/g," "))};return t.extend(t,{deparam:function(a){var u,c,o={};return a&&r.test(a)&&(u=a.split("&"),t.each(u,function(t){var r=t.split("="),a=i(r.shift()),u=i(r.join("=")),p=o;if(a){r=a.match(e);for(var s=0,d=r.length-1;d>s;s++)p[r[s]]||(p[r[s]]=n.test(r[s+1])||"[]"===r[s+1]?[]:{}),p=p[r[s]];c=r.pop(),"[]"===c?p.push(u):p[c]=u}})),o}}),t});
/*can@2.3.0-pre.1#route/route*/
define("can/route/route",["can/util/util","can/map/map","can/list/list","can/util/string/deparam/deparam"],function(t){var e,r,n,a,u=/\:([\w\.]+)/g,o=/^(?:&[^=]+=[^&]*)+/,i=function(e){var r=[];return t.each(e,function(e,n){r.push(("className"===n?"class":n)+'="'+("href"===n?e:t.esc(e))+'"')}),r.join(" ")},c=function(t,e){var r=0,n=0,a={};for(var u in t.defaults)t.defaults[u]===e[u]&&(a[u]=1,r++);for(;n<t.names.length;n++){if(!e.hasOwnProperty(t.names[n]))return-1;a[t.names[n]]||r++}return r},l=window.location,s=function(t){return(t+"").replace(/([.?*+\^$\[\]\\(){}|\-])/g,"\\$1")},d=t.each,f=t.extend,h=function(e){return e&&"object"==typeof e?(e=e instanceof t.Map?e.attr():t.isFunction(e.slice)?e.slice():t.extend({},e),t.each(e,function(t,r){e[r]=h(t)})):void 0!==e&&null!==e&&t.isFunction(e.toString)&&(e=e.toString()),e},p=function(t){return t.replace(/\\/g,"")},g=[],m=function(r,u,o,i){a=1,g.push(u),clearTimeout(e),e=setTimeout(function(){a=0;var e=t.route.data.serialize(),r=t.route.param(e,!0);t.route._call("setURL",r,g),t.batch.trigger(_,"__url",[r,n]),n=r,g=[]},10)},_=t.extend({},t.event);t.route=function(e,r){var n=t.route._call("root");n.lastIndexOf("/")===n.length-1&&0===e.indexOf("/")&&(e=e.substr(1)),r=r||{};for(var a,o,i=[],c="",l=u.lastIndex=0,d=t.route._call("querySeparator"),f=t.route._call("matchSlashes");a=u.exec(e);)i.push(a[1]),c+=p(e.substring(l,u.lastIndex-a[0].length)),o="\\"+(p(e.substr(u.lastIndex,1))||d+(f?"":"|/")),c+="([^"+o+"]"+(r[a[1]]?"*":"+")+")",l=u.lastIndex;return c+=e.substr(l).replace("\\",""),t.route.routes[e]={test:new RegExp("^"+c+"($|"+s(d)+")"),route:e,names:i,defaults:r,length:e.split("/").length},t.route},f(t.route,{param:function(e,r){var n,a,o=0,i=e.route,l=0;if(delete e.route,d(e,function(){l++}),d(t.route.routes,function(t,r){return a=c(t,e),a>o&&(n=t,o=a),a>=l?!1:void 0}),t.route.routes[i]&&c(t.route.routes[i],e)===o&&(n=t.route.routes[i]),n){var s,h=f({},e),p=n.route.replace(u,function(t,r){return delete h[r],e[r]===n.defaults[r]?"":encodeURIComponent(e[r])}).replace("\\","");return d(n.defaults,function(t,e){h[e]===t&&delete h[e]}),s=t.param(h),r&&t.route.attr("route",n.route),p+(s?t.route._call("querySeparator")+s:"")}return t.isEmptyObject(e)?"":t.route._call("querySeparator")+t.param(e)},deparam:function(e){var r=t.route._call("root");r.lastIndexOf("/")===r.length-1&&0===e.indexOf("/")&&(e=e.substr(1));var n={length:-1},a=t.route._call("querySeparator"),u=t.route._call("paramsMatcher");if(d(t.route.routes,function(t,r){t.test.test(e)&&t.length>n.length&&(n=t)}),n.length>-1){var o=e.match(n.test),i=o.shift(),c=e.substr(i.length-(o[o.length-1]===a?1:0)),l=c&&u.test(c)?t.deparam(c.slice(1)):{};return l=f(!0,{},n.defaults,l),d(o,function(t,e){t&&t!==a&&(l[n.names[e]]=decodeURIComponent(t))}),l.route=n.route,l}return e.charAt(0)!==a&&(e=a+e),u.test(e)?t.deparam(e.slice(1)):{}},data:new t.Map({}),map:function(e){var r;r=e.prototype instanceof t.Map?new e:e,t.route.data=r},routes:{},ready:function(e){return e!==!0&&(t.route._setup(),t.isNode||t.route.setState()),t.route},url:function(e,r){return r&&(e=t.extend({},t.route.deparam(t.route._call("matchingPartOfURL")),e)),t.route._call("root")+t.route.param(e)},link:function(e,r,n,a){return"<a "+i(f({href:t.route.url(r,a)},n))+">"+e+"</a>"},current:function(e){return t.__observe(_,"__url"),this._call("matchingPartOfURL")===t.route.param(e)},bindings:{hashchange:{paramsMatcher:o,querySeparator:"&",matchSlashes:!1,bind:function(){t.bind.call(window,"hashchange",b)},unbind:function(){t.unbind.call(window,"hashchange",b)},matchingPartOfURL:function(){return l.href.split(/#!?/)[1]||""},setURL:function(t){return l.hash!=="#"+t&&(l.hash="!"+t),t},root:"#!"}},defaultBinding:"hashchange",currentBinding:null,_setup:function(){t.route.currentBinding||(t.route._call("bind"),t.route.bind("change",m),t.route.currentBinding=t.route.defaultBinding)},_teardown:function(){t.route.currentBinding&&(t.route._call("unbind"),t.route.unbind("change",m),t.route.currentBinding=null),clearTimeout(e),a=0},_call:function(){var e=t.makeArray(arguments),r=e.shift(),n=t.route.bindings[t.route.currentBinding||t.route.defaultBinding],a=n[r];return a.apply?a.apply(n,e):a}}),d(["bind","unbind","on","off","delegate","undelegate","removeAttr","compute","_get","__get","each"],function(e){t.route[e]=function(){return t.route.data[e]?t.route.data[e].apply(t.route.data,arguments):void 0}}),t.route.attr=function(e,r){var n,a=typeof e;return n=void 0===r?arguments:"string"!==a&&"number"!==a?[h(e),r]:[e,h(r)],t.route.data.attr.apply(t.route.data,n)};var b=t.route.setState=function(){var e=t.route._call("matchingPartOfURL"),u=r;r=t.route.deparam(e),a&&e===n||(t.batch.start(),v(u,r,t.route.data),t.route.attr(r),t.batch.trigger(_,"__url",[e,n]),t.batch.stop())},v=function(t,e,r){for(var n in t)void 0===e[n]?r.removeAttr(n):"[object Object]"===Object.prototype.toString.call(t[n])&&v(t[n],e[n],r.attr(n))};return t.route});
/*can@2.3.0-pre.1#control/route/route*/
define("can/control/route/route",["can/util/util","can/route/route","can/control/control"],function(t){return t.Control.processors.route=function(o,r,u,n,e){u=u||"",t.route.routes[u]||("/"===u[0]&&(u=u.substring(1)),t.route(u));var c,i=function(o,r,i){if(t.route.attr("route")===u&&(void 0===o.batchNum||o.batchNum!==c)){c=o.batchNum;var a=t.route.attr();delete a.route,t.isFunction(e[n])?e[n](a):e[e[n]](a)}};return t.route.bind("change",i),function(){t.route.unbind("change",i)}},t});
/*can@2.3.0-pre.1#util/event*/
define("can/util/event",["can/util/can","can/event/event"],function(n){return n});
/*[global-shim-end]*/
!function(){window._define=window.define,window.define=window.define.orig,window.System=window.System.orig}();
/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	global.System = {
		define: function(__name, __code){
			global.define = origDefine;
			eval("(function() { " + __code + " \n }).call(global);");
			global.define = ourDefine;
		},
		orig: global.System
	};
})({},window)
/*can@2.3.0-pre.1#map/define/define*/
define('can/map/define/define', [
	'can/util/util',
	'can/observe/observe'
], function (can) {
	var define = can.define = {};
	var getPropDefineBehavior = function (behavior, attr, define) {
		var prop, defaultProp;
		if (define) {
			prop = define[attr];
			defaultProp = define['*'];
			if (prop && prop[behavior] !== undefined) {
				return prop[behavior];
			} else if (defaultProp && defaultProp[behavior] !== undefined) {
				return defaultProp[behavior];
			}
		}
	};
	can.Map.helpers.define = function (Map) {
		var definitions = Map.prototype.define;
		Map.defaultGenerators = {};
		for (var prop in definitions) {
			var type = definitions[prop].type;
			if (typeof type === 'string') {
				if (typeof define.types[type] === 'object') {
					delete definitions[prop].type;
					can.extend(definitions[prop], define.types[type]);
				}
			}
			if ('value' in definitions[prop]) {
				if (typeof definitions[prop].value === 'function') {
					Map.defaultGenerators[prop] = definitions[prop].value;
				} else {
					Map.defaults[prop] = definitions[prop].value;
				}
			}
			if (typeof definitions[prop].Value === 'function') {
				(function (Constructor) {
					Map.defaultGenerators[prop] = function () {
						return new Constructor();
					};
				}(definitions[prop].Value));
			}
		}
	};
	var oldSetupDefaults = can.Map.prototype._setupDefaults;
	can.Map.prototype._setupDefaults = function (obj) {
		var defaults = oldSetupDefaults.call(this), propsCommittedToAttr = {}, Map = this.constructor, originalGet = this._get;
		this._get = function (originalProp) {
			prop = originalProp.indexOf('.') !== -1 ? originalProp.substr(0, originalProp.indexOf('.')) : prop;
			if (prop in defaults && !(prop in propsCommittedToAttr)) {
				this.attr(prop, defaults[prop]);
				propsCommittedToAttr[prop] = true;
			}
			return originalGet.apply(this, arguments);
		};
		for (var prop in Map.defaultGenerators) {
			if (!obj || !(prop in obj)) {
				defaults[prop] = Map.defaultGenerators[prop].call(this);
			}
		}
		this._get = originalGet;
		return defaults;
	};
	var proto = can.Map.prototype, oldSet = proto.__set;
	proto.__set = function (prop, value, current, success, error) {
		var errorCallback = function (errors) {
			var stub = error && error.call(self, errors);
			if (stub !== false) {
				can.trigger(self, 'error', [
					prop,
					errors
				], true);
			}
			return false;
		}, self = this, setter = getPropDefineBehavior('set', prop, this.define), getter = getPropDefineBehavior('get', prop, this.define);
		if (setter) {
			can.batch.start();
			var setterCalled = false, setValue = setter.call(this, value, function (value) {
				if (getter) {
					self[prop](value);
				} else {
					oldSet.call(self, prop, value, current, success, errorCallback);
				}
				setterCalled = true;
			}, errorCallback, getter ? this[prop].computeInstance.lastSetValue.get() : current);
			if (getter) {
				if (setValue !== undefined && !setterCalled && setter.length >= 1) {
					this[prop](setValue);
				}
				can.batch.stop();
				return;
			} else if (setValue === undefined && !setterCalled && setter.length >= 1) {
				can.batch.stop();
				return;
			} else {
				if (!setterCalled) {
					oldSet.call(self, prop, setter.length === 0 && setValue === undefined ? value : setValue, current, success, errorCallback);
				}
				can.batch.stop();
				return this;
			}
		} else {
			oldSet.call(self, prop, value, current, success, errorCallback);
		}
		return this;
	};
	define.types = {
		'date': function (str) {
			var type = typeof str;
			if (type === 'string') {
				str = Date.parse(str);
				return isNaN(str) ? null : new Date(str);
			} else if (type === 'number') {
				return new Date(str);
			} else {
				return str;
			}
		},
		'number': function (val) {
			if (val == null) {
				return val;
			}
			return +val;
		},
		'boolean': function (val) {
			if (val === 'false' || val === '0' || !val) {
				return false;
			}
			return true;
		},
		'htmlbool': function (val) {
			return typeof val === 'string' || !!val;
		},
		'*': function (val) {
			return val;
		},
		'string': function (val) {
			if (val == null) {
				return val;
			}
			return '' + val;
		},
		'compute': {
			set: function (newValue, setVal, setErr, oldValue) {
				if (newValue.isComputed) {
					return newValue;
				}
				if (oldValue && oldValue.isComputed) {
					oldValue(newValue);
					return oldValue;
				}
				return newValue;
			},
			get: function (value) {
				return value && value.isComputed ? value() : value;
			}
		}
	};
	var oldType = proto.__type;
	proto.__type = function (value, prop) {
		var type = getPropDefineBehavior('type', prop, this.define), Type = getPropDefineBehavior('Type', prop, this.define), newValue = value;
		if (typeof type === 'string') {
			type = define.types[type];
		}
		if (type || Type) {
			if (type) {
				newValue = type.call(this, newValue, prop);
			}
			if (Type && !(newValue instanceof Type)) {
				newValue = new Type(newValue);
			}
			return newValue;
		} else if (can.isPlainObject(newValue) && newValue.define) {
			newValue = can.Map.extend(newValue);
			newValue = new newValue();
		}
		return oldType.call(this, newValue, prop);
	};
	var oldRemove = proto._remove;
	proto._remove = function (prop, current) {
		var remove = getPropDefineBehavior('remove', prop, this.define), res;
		if (remove) {
			can.batch.start();
			res = remove.call(this, current);
			if (res === false) {
				can.batch.stop();
				return;
			} else {
				res = oldRemove.call(this, prop, current);
				can.batch.stop();
				return res;
			}
		}
		return oldRemove.call(this, prop, current);
	};
	var oldSetupComputes = proto._setupComputes;
	proto._setupComputes = function (defaultsValues) {
		oldSetupComputes.apply(this, arguments);
		for (var attr in this.define) {
			var def = this.define[attr], get = def.get;
			if (get) {
				this[attr] = can.compute.async(defaultsValues[attr], get, this);
				this._computedBindings[attr] = { count: 0 };
			}
		}
	};
	var oldSingleSerialize = can.Map.helpers._serialize;
	can.Map.helpers._serialize = function (map, name, val) {
		return serializeProp(map, name, val);
	};
	var serializeProp = function (map, attr, val) {
		var serializer = attr === '*' ? false : getPropDefineBehavior('serialize', attr, map.define);
		if (serializer === undefined) {
			return oldSingleSerialize.apply(this, arguments);
		} else if (serializer !== false) {
			return typeof serializer === 'function' ? serializer.call(map, val, attr) : oldSingleSerialize.apply(this, arguments);
		}
	};
	var oldSerialize = proto.serialize;
	proto.serialize = function (property) {
		var serialized = oldSerialize.apply(this, arguments);
		if (property) {
			return serialized;
		}
		var serializer, val;
		for (var attr in this.define) {
			if (!(attr in serialized)) {
				serializer = this.define && this.define[attr] && this.define[attr].serialize;
				if (serializer) {
					val = serializeProp(this, attr, this.attr(attr));
					if (val !== undefined) {
						serialized[attr] = val;
					}
				}
			}
		}
		return serialized;
	};
	return can.define;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
	window.System = window.System.orig;
})();
/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	global.System = {
		define: function(__name, __code){
			global.define = origDefine;
			eval("(function() { " + __code + " \n }).call(global);");
			global.define = ourDefine;
		},
		orig: global.System
	};
})({},window)
/*can@2.3.0-pre.1#view/target/target*/
define('can/view/target/target', [
	'can/util/util',
	'can/view/elements'
], function (can, elements, vdom) {
	var processNodes = function (nodes, paths, location, document) {
		var frag = document.createDocumentFragment();
		for (var i = 0, len = nodes.length; i < len; i++) {
			var node = nodes[i];
			frag.appendChild(processNode(node, paths, location.concat(i), document));
		}
		return frag;
	}, keepsTextNodes = typeof document !== 'undefined' && function () {
			var testFrag = document.createDocumentFragment();
			var div = document.createElement('div');
			div.appendChild(document.createTextNode(''));
			div.appendChild(document.createTextNode(''));
			testFrag.appendChild(div);
			var cloned = testFrag.cloneNode(true);
			return can.childNodes(cloned.firstChild).length === 2;
		}(), clonesWork = typeof document !== 'undefined' && function () {
			var a = document.createElement('a');
			a.innerHTML = '<xyz></xyz>';
			var clone = a.cloneNode(true);
			return clone.innerHTML === '<xyz></xyz>';
		}(), namespacesWork = typeof document !== 'undefined' && !!document.createElementNS, attributeDummy = typeof document !== 'undefined' ? document.createElement('div') : null, setAttribute = function (el, attrName, value) {
		try {
			el.setAttribute(attrName, value);
		} catch (e) {
			attributeDummy.innerHTML = '<div ' + attrName + '="' + value + '"></div>';
			el.setAttributeNode(attributeDummy.childNodes[0].attributes[0].cloneNode());
		}
	};
	var cloneNode = clonesWork ? function (el) {
		return el.cloneNode(true);
	} : function (node) {
		var copy;
		if (node.nodeType === 1) {
			copy = document.createElement(node.nodeName);
		} else if (node.nodeType === 3) {
			copy = document.createTextNode(node.nodeValue);
		} else if (node.nodeType === 8) {
			copy = document.createComment(node.nodeValue);
		} else if (node.nodeType === 11) {
			copy = document.createDocumentFragment();
		}
		if (node.attributes) {
			var attributes = can.makeArray(node.attributes);
			can.each(attributes, function (node) {
				if (node && node.specified) {
					setAttribute(copy, node.nodeName, node.nodeValue);
				}
			});
		}
		if (node.childNodes) {
			can.each(node.childNodes, function (child) {
				copy.appendChild(cloneNode(child));
			});
		}
		return copy;
	};
	function processNode(node, paths, location, document) {
		var callback, loc = location, nodeType = typeof node, el, p, i, len;
		var getCallback = function () {
			if (!callback) {
				callback = {
					path: location,
					callbacks: []
				};
				paths.push(callback);
				loc = [];
			}
			return callback;
		};
		if (nodeType === 'object') {
			if (node.tag) {
				if (namespacesWork && node.namespace) {
					el = document.createElementNS(node.namespace, node.tag);
				} else {
					el = document.createElement(node.tag);
				}
				if (node.attrs) {
					for (var attrName in node.attrs) {
						var value = node.attrs[attrName];
						if (typeof value === 'function') {
							getCallback().callbacks.push({ callback: value });
						} else {
							setAttribute(el, attrName, value);
						}
					}
				}
				if (node.attributes) {
					for (i = 0, len = node.attributes.length; i < len; i++) {
						getCallback().callbacks.push({ callback: node.attributes[i] });
					}
				}
				if (node.children && node.children.length) {
					if (callback) {
						p = callback.paths = [];
					} else {
						p = paths;
					}
					el.appendChild(processNodes(node.children, p, loc, document));
				}
			} else if (node.comment) {
				el = document.createComment(node.comment);
				if (node.callbacks) {
					for (i = 0, len = node.attributes.length; i < len; i++) {
						getCallback().callbacks.push({ callback: node.callbacks[i] });
					}
				}
			}
		} else if (nodeType === 'string') {
			el = document.createTextNode(node);
		} else if (nodeType === 'function') {
			if (keepsTextNodes) {
				el = document.createTextNode('');
				getCallback().callbacks.push({ callback: node });
			} else {
				el = document.createComment('~');
				getCallback().callbacks.push({
					callback: function () {
						var el = document.createTextNode('');
						elements.replace([this], el);
						return node.apply(el, arguments);
					}
				});
			}
		}
		return el;
	}
	function getCallbacks(el, pathData, elementCallbacks) {
		var path = pathData.path, callbacks = pathData.callbacks, paths = pathData.paths, child = el, pathLength = path ? path.length : 0, pathsLength = paths ? paths.length : 0;
		for (var i = 0; i < pathLength; i++) {
			child = child.childNodes.item(path[i]);
		}
		elementCallbacks.push({
			element: child,
			callbacks: callbacks
		});
		for (i = 0; i < pathsLength; i++) {
			getCallbacks(child, paths[i], elementCallbacks);
		}
	}
	function hydrateCallbacks(callbacks, args) {
		var len = callbacks.length, callbacksLength, callbackElement, callbackData;
		for (var i = 0; i < len; i++) {
			callbackData = callbacks[i];
			callbacksLength = callbackData.callbacks.length;
			callbackElement = callbackData.element;
			for (var c = 0; c < callbacksLength; c++) {
				callbackData.callbacks[c].callback.apply(callbackElement, args);
			}
		}
	}
	function makeTarget(nodes, doc) {
		var paths = [];
		var frag = processNodes(nodes, paths, [], doc || can.global.document);
		return {
			paths: paths,
			clone: frag,
			hydrate: function () {
				var cloned = cloneNode(this.clone);
				var args = can.makeArray(arguments);
				var callbacks = [];
				for (var i = 0; i < paths.length; i++) {
					getCallbacks(cloned, paths[i], callbacks);
				}
				hydrateCallbacks(callbacks, args);
				return cloned;
			}
		};
	}
	makeTarget.keepsTextNodes = keepsTextNodes;
	can.view.target = makeTarget;
	return makeTarget;
});
/*can@2.3.0-pre.1#view/stache/html_section*/
define('can/view/stache/html_section', [
	'can/util/util',
	'can/view/target/target',
	'can/view/stache/utils',
	'can/view/stache/mustache_core'
], function (can, target, utils, mustacheCore) {
	var decodeHTML = typeof document !== 'undefined' && function () {
			var el = document.createElement('div');
			return function (html) {
				if (html.indexOf('&') === -1) {
					return html.replace(/\r\n/g, '\n');
				}
				el.innerHTML = html;
				return el.childNodes.length === 0 ? '' : el.childNodes[0].nodeValue;
			};
		}();
	var HTMLSectionBuilder = function () {
		this.stack = [new HTMLSection()];
	};
	can.extend(HTMLSectionBuilder.prototype, utils.mixins);
	can.extend(HTMLSectionBuilder.prototype, {
		startSubSection: function (process) {
			var newSection = new HTMLSection(process);
			this.stack.push(newSection);
			return newSection;
		},
		endSubSectionAndReturnRenderer: function () {
			if (this.last().isEmpty()) {
				this.stack.pop();
				return null;
			} else {
				var htmlSection = this.endSection();
				return can.proxy(htmlSection.compiled.hydrate, htmlSection.compiled);
			}
		},
		startSection: function (process) {
			var newSection = new HTMLSection(process);
			this.last().add(newSection.targetCallback);
			this.stack.push(newSection);
		},
		endSection: function () {
			this.last().compile();
			return this.stack.pop();
		},
		inverse: function () {
			this.last().inverse();
		},
		compile: function () {
			var compiled = this.stack.pop().compile();
			return function (scope, options, nodeList) {
				if (!(scope instanceof can.view.Scope)) {
					scope = can.view.Scope.refsScope().add(scope || {});
				}
				if (!(options instanceof mustacheCore.Options)) {
					options = new mustacheCore.Options(options || {});
				}
				return compiled.hydrate(scope, options, nodeList);
			};
		},
		push: function (chars) {
			this.last().push(chars);
		},
		pop: function () {
			return this.last().pop();
		}
	});
	var HTMLSection = function (process) {
		this.data = 'targetData';
		this.targetData = [];
		this.targetStack = [];
		var self = this;
		this.targetCallback = function (scope, options, sectionNode) {
			process.call(this, scope, options, sectionNode, can.proxy(self.compiled.hydrate, self.compiled), self.inverseCompiled && can.proxy(self.inverseCompiled.hydrate, self.inverseCompiled));
		};
	};
	can.extend(HTMLSection.prototype, {
		inverse: function () {
			this.inverseData = [];
			this.data = 'inverseData';
		},
		push: function (data) {
			this.add(data);
			this.targetStack.push(data);
		},
		pop: function () {
			return this.targetStack.pop();
		},
		add: function (data) {
			if (typeof data === 'string') {
				data = decodeHTML(data);
			}
			if (this.targetStack.length) {
				this.targetStack[this.targetStack.length - 1].children.push(data);
			} else {
				this[this.data].push(data);
			}
		},
		compile: function () {
			this.compiled = target(this.targetData, can.document || can.global.document);
			if (this.inverseData) {
				this.inverseCompiled = target(this.inverseData, can.document || can.global.document);
				delete this.inverseData;
			}
			delete this.targetData;
			delete this.targetStack;
			return this.compiled;
		},
		children: function () {
			if (this.targetStack.length) {
				return this.targetStack[this.targetStack.length - 1].children;
			} else {
				return this[this.data];
			}
		},
		isEmpty: function () {
			return !this.targetData.length;
		}
	});
	return HTMLSectionBuilder;
});
/*can@2.3.0-pre.1#view/stache/text_section*/
define('can/view/stache/text_section', [
	'can/util/util',
	'can/view/live/live',
	'can/view/stache/utils'
], function (can, live, utils) {
	live = live || can.view.live;
	var TextSectionBuilder = function () {
		this.stack = [new TextSection()];
	}, emptyHandler = function () {
	};
	can.extend(TextSectionBuilder.prototype, utils.mixins);
	can.extend(TextSectionBuilder.prototype, {
		startSection: function (process) {
			var subSection = new TextSection();
			this.last().add({
				process: process,
				truthy: subSection
			});
			this.stack.push(subSection);
		},
		endSection: function () {
			this.stack.pop();
		},
		inverse: function () {
			this.stack.pop();
			var falseySection = new TextSection();
			this.last().last().falsey = falseySection;
			this.stack.push(falseySection);
		},
		compile: function (state) {
			var renderer = this.stack[0].compile();
			return function (scope, options) {
				var compute = can.compute(function () {
					return renderer(scope, options);
				}, this, false, true);
				compute.bind('change', emptyHandler);
				var value = compute();
				if (compute.computeInstance.hasDependencies) {
					if (state.attr) {
						live.simpleAttribute(this, state.attr, compute);
					} else {
						live.attributes(this, compute);
					}
					compute.unbind('change', emptyHandler);
				} else {
					if (state.attr) {
						can.attr.set(this, state.attr, value);
					} else {
						live.setAttributes(this, value);
					}
				}
			};
		}
	});
	var passTruthyFalsey = function (process, truthy, falsey) {
		return function (scope, options) {
			return process.call(this, scope, options, truthy, falsey);
		};
	};
	var TextSection = function () {
		this.values = [];
	};
	can.extend(TextSection.prototype, {
		add: function (data) {
			this.values.push(data);
		},
		last: function () {
			return this.values[this.values.length - 1];
		},
		compile: function () {
			var values = this.values, len = values.length;
			for (var i = 0; i < len; i++) {
				var value = this.values[i];
				if (typeof value === 'object') {
					values[i] = passTruthyFalsey(value.process, value.truthy && value.truthy.compile(), value.falsey && value.falsey.compile());
				}
			}
			return function (scope, options) {
				var txt = '', value;
				for (var i = 0; i < len; i++) {
					value = values[i];
					txt += typeof value === 'string' ? value : value.call(this, scope, options);
				}
				return txt;
			};
		}
	});
	return TextSectionBuilder;
});
/*can@2.3.0-pre.1#view/import/import*/
define('can/view/import/import', [
	'can/util/util',
	'can/view/callbacks/callbacks'
], function (can) {
	can.view.tag('can-import', function (el, tagData) {
		var moduleName = el.getAttribute('from');
		var importPromise;
		if (moduleName) {
			importPromise = can['import'](moduleName);
		} else {
			importPromise = can.Deferred().reject('No moduleName provided').promise();
		}
		var root = tagData.scope.attr('@root');
		if (root && can.isFunction(root.waitFor)) {
			root.waitFor(importPromise);
		}
		can.data(can.$(el), 'viewModel', importPromise);
		var scope = tagData.scope.add(importPromise);
		var handOffTag = el.getAttribute('can-tag');
		if (handOffTag) {
			var callback = can.view.callbacks._tags[handOffTag];
			callback(el, can.extend(tagData, { scope: scope }));
			var viewModel = can.viewModel(el);
			importPromise.then(function (val) {
				viewModel.attr('value', val);
			});
		} else {
			var frag = tagData.subtemplate ? tagData.subtemplate(scope, tagData.options) : document.createDocumentFragment();
			var nodeList = can.view.nodeLists.register([], undefined, true);
			can.one.call(el, 'removed', function () {
				can.view.nodeLists.unregister(nodeList);
			});
			can.appendChild(el, frag, can.document);
			can.view.nodeLists.update(nodeList, can.childNodes(el));
		}
	});
});
/*can@2.3.0-pre.1#view/stache/intermediate_and_imports*/
define('can/view/stache/intermediate_and_imports', [
	'can/view/stache/mustache_core',
	'can/view/parser/parser',
	'can/view/import/import'
], function (mustacheCore, parser) {
	return function (source) {
		var template = mustacheCore.cleanLineEndings(source);
		var imports = [], ases = {}, inImport = false, inFrom = false, inAs = false, currentAs = '', currentFrom = '';
		var intermediate = parser(template, {
			start: function (tagName, unary) {
				if (tagName === 'can-import') {
					inImport = true;
				} else if (inImport) {
					inImport = false;
				}
			},
			attrStart: function (attrName) {
				if (attrName === 'from') {
					inFrom = true;
				} else if (inImport && attrName === '[.]') {
					inAs = true;
					currentAs = 'viewModel';
					return false;
				}
			},
			attrEnd: function (attrName) {
				if (attrName === 'from') {
					inFrom = false;
				} else if (inImport && attrName === '[.]') {
					inAs = false;
					return false;
				}
			},
			attrValue: function (value) {
				if (inFrom && inImport) {
					imports.push(value);
					currentFrom = value;
				} else if (inAs && currentAs === 'viewModel') {
					return false;
				}
			},
			end: function (tagName) {
				if (tagName === 'can-import') {
					if (currentAs) {
						ases[currentAs] = currentFrom;
						currentAs = '';
						inAs = false;
					}
				}
			},
			close: function (tagName) {
				if (tagName === 'can-import') {
					imports.pop();
				}
			}
		}, true);
		return {
			intermediate: intermediate,
			imports: imports,
			ases: ases
		};
	};
});
/*can@2.3.0-pre.1#view/stache/stache*/
define('can/view/stache/stache', [
	'can/util/util',
	'can/view/parser/parser',
	'can/view/target/target',
	'can/view/stache/html_section',
	'can/view/stache/text_section',
	'can/view/stache/mustache_core',
	'can/view/stache/mustache_helpers',
	'can/view/stache/intermediate_and_imports',
	'can/view/callbacks/callbacks',
	'can/view/bindings/bindings'
], function (can, parser, target, HTMLSectionBuilder, TextSectionBuilder, mustacheCore, mustacheHelpers, getIntermediateAndImports, viewCallbacks) {
	parser = parser || can.view.parser;
	can.view.parser = parser;
	viewCallbacks = viewCallbacks || can.view.callbacks;
	var svgNamespace = 'http://www.w3.org/2000/svg';
	var namespaces = {
		'svg': svgNamespace,
		'g': svgNamespace
	};
	function stache(template) {
		if (typeof template === 'string') {
			template = mustacheCore.cleanLineEndings(template);
		}
		var section = new HTMLSectionBuilder(), state = {
			node: null,
			attr: null,
			sectionElementStack: [],
			text: false,
			namespaceStack: []
		}, makeRendererAndUpdateSection = function (section, mode, stache) {
			if (mode === '>') {
				section.add(mustacheCore.makeLiveBindingPartialRenderer(stache, state));
			} else if (mode === '/') {
				section.endSection();
				if (section instanceof HTMLSectionBuilder) {
					state.sectionElementStack.pop();
				}
			} else if (mode === 'else') {
				section.inverse();
			} else {
				var makeRenderer = section instanceof HTMLSectionBuilder ? mustacheCore.makeLiveBindingBranchRenderer : mustacheCore.makeStringBranchRenderer;
				if (mode === '{' || mode === '&') {
					section.add(makeRenderer(null, stache, copyState()));
				} else if (mode === '#' || mode === '^') {
					section.startSection(makeRenderer(mode, stache, copyState()));
					if (section instanceof HTMLSectionBuilder) {
						state.sectionElementStack.push('section');
					}
				} else {
					section.add(makeRenderer(null, stache, copyState({ text: true })));
				}
			}
		}, copyState = function (overwrites) {
			var lastElement = state.sectionElementStack[state.sectionElementStack.length - 1];
			var cur = {
				tag: state.node && state.node.tag,
				attr: state.attr && state.attr.name,
				directlyNested: state.sectionElementStack.length ? lastElement === 'section' || lastElement === 'custom' : true
			};
			return overwrites ? can.simpleExtend(cur, overwrites) : cur;
		}, addAttributesCallback = function (node, callback) {
			if (!node.attributes) {
				node.attributes = [];
			}
			node.attributes.unshift(callback);
		};
		parser(template, {
			start: function (tagName, unary) {
				var matchedNamespace = namespaces[tagName];
				if (matchedNamespace && !unary) {
					state.namespaceStack.push(matchedNamespace);
				}
				state.node = {
					tag: tagName,
					children: [],
					namespace: matchedNamespace || can.last(state.namespaceStack)
				};
			},
			end: function (tagName, unary) {
				var isCustomTag = viewCallbacks.tag(tagName);
				if (unary) {
					section.add(state.node);
					if (isCustomTag) {
						addAttributesCallback(state.node, function (scope, options, parentNodeList) {
							viewCallbacks.tagHandler(this, tagName, {
								scope: scope,
								options: options,
								subtemplate: null,
								templateType: 'stache',
								parentNodeList: parentNodeList
							});
						});
					}
				} else {
					section.push(state.node);
					state.sectionElementStack.push(isCustomTag ? 'custom' : 'element');
					if (isCustomTag) {
						section.startSubSection();
					}
				}
				state.node = null;
			},
			close: function (tagName) {
				var matchedNamespace = namespaces[tagName];
				if (matchedNamespace) {
					state.namespaceStack.pop();
				}
				var isCustomTag = viewCallbacks.tag(tagName), renderer;
				if (isCustomTag) {
					renderer = section.endSubSectionAndReturnRenderer();
				}
				var oldNode = section.pop();
				if (isCustomTag) {
					addAttributesCallback(oldNode, function (scope, options, parentNodeList) {
						viewCallbacks.tagHandler(this, tagName, {
							scope: scope,
							options: options,
							subtemplate: renderer,
							templateType: 'stache',
							parentNodeList: parentNodeList
						});
					});
				}
				state.sectionElementStack.pop();
			},
			attrStart: function (attrName) {
				if (state.node.section) {
					state.node.section.add(attrName + '="');
				} else {
					state.attr = {
						name: attrName,
						value: ''
					};
				}
			},
			attrEnd: function (attrName) {
				if (state.node.section) {
					state.node.section.add('" ');
				} else {
					if (!state.node.attrs) {
						state.node.attrs = {};
					}
					state.node.attrs[state.attr.name] = state.attr.section ? state.attr.section.compile(copyState()) : state.attr.value;
					var attrCallback = viewCallbacks.attr(attrName);
					if (attrCallback) {
						if (!state.node.attributes) {
							state.node.attributes = [];
						}
						state.node.attributes.push(function (scope, options) {
							attrCallback(this, {
								attributeName: attrName,
								scope: scope,
								options: options
							});
						});
					}
					state.attr = null;
				}
			},
			attrValue: function (value) {
				var section = state.node.section || state.attr.section;
				if (section) {
					section.add(value);
				} else {
					state.attr.value += value;
				}
			},
			chars: function (text) {
				section.add(text);
			},
			special: function (text) {
				var firstAndText = mustacheCore.splitModeFromExpression(text, state), mode = firstAndText.mode, expression = firstAndText.expression;
				if (expression === 'else') {
					(state.attr && state.attr.section ? state.attr.section : section).inverse();
					return;
				}
				if (mode === '!') {
					return;
				}
				if (state.node && state.node.section) {
					makeRendererAndUpdateSection(state.node.section, mode, expression);
					if (state.node.section.subSectionDepth() === 0) {
						state.node.attributes.push(state.node.section.compile(copyState()));
						delete state.node.section;
					}
				} else if (state.attr) {
					if (!state.attr.section) {
						state.attr.section = new TextSectionBuilder();
						if (state.attr.value) {
							state.attr.section.add(state.attr.value);
						}
					}
					makeRendererAndUpdateSection(state.attr.section, mode, expression);
				} else if (state.node) {
					if (!state.node.attributes) {
						state.node.attributes = [];
					}
					if (!mode) {
						state.node.attributes.push(mustacheCore.makeLiveBindingBranchRenderer(null, expression, copyState()));
					} else if (mode === '#' || mode === '^') {
						if (!state.node.section) {
							state.node.section = new TextSectionBuilder();
						}
						makeRendererAndUpdateSection(state.node.section, mode, expression);
					} else {
						throw mode + ' is currently not supported within a tag.';
					}
				} else {
					makeRendererAndUpdateSection(section, mode, expression);
				}
			},
			comment: function (text) {
				section.add({ comment: text });
			},
			done: function () {
			}
		});
		return section.compile();
	}
	var escMap = {
		'\n': '\\n',
		'\r': '\\r',
		'\u2028': '\\u2028',
		'\u2029': '\\u2029'
	};
	var esc = function (string) {
		return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
			if ('\'"\\'.indexOf(character) >= 0) {
				return '\\' + character;
			} else {
				return escMap[character];
			}
		});
	};
	can.view.register({
		suffix: 'stache',
		contentType: 'x-stache-template',
		fragRenderer: function (id, text) {
			return stache(text);
		},
		script: function (id, src) {
			return 'can.stache("' + esc(src) + '")';
		}
	});
	can.view.ext = '.stache';
	can.extend(can.stache, mustacheHelpers);
	can.extend(stache, mustacheHelpers);
	can.stache.safeString = stache.safeString = function (text) {
		return {
			toString: function () {
				return text;
			}
		};
	};
	can.stache.async = function (source) {
		var iAi = getIntermediateAndImports(source);
		var importPromises = can.map(iAi.imports, function (moduleName) {
			return can['import'](moduleName);
		});
		return can.when.apply(can, importPromises).then(function () {
			return stache(iAi.intermediate);
		});
	};
	return stache;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
	window.System = window.System.orig;
})();
/*!
 * CanJS - 2.3.0-pre.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Tue, 02 Jun 2015 20:00:57 GMT
 * Licensed MIT
 */

/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	global.System = {
		define: function(__name, __code){
			global.define = origDefine;
			eval("(function() { " + __code + " \n }).call(global);");
			global.define = ourDefine;
		},
		orig: global.System
	};
})({},window)
/*can@2.3.0-pre.0#view/href/href*/
define('can/view/href/href', [
	'can/util/util',
	'can/view/stache/mustache_core',
	'can/view/callbacks/callbacks',
	'can/view/scope/scope'
], function (can, mustacheCore) {
	var removeCurly = function (value) {
		if (value[0] === '{' && value[value.length - 1] === '}') {
			return value.substr(1, value.length - 2);
		}
		return value;
	};
	can.view.attr('can-href', function (el, attrData) {
		var attrInfo = mustacheCore.expressionData('tmp ' + removeCurly(el.getAttribute('can-href')));
		var routeHref = can.compute(function () {
			var hash = {};
			can.each(attrInfo.hash, function (val, key) {
				if (val && val.hasOwnProperty('get')) {
					hash[key] = attrData.scope.read(val.get, {}).value;
				} else {
					hash[key] = val;
				}
			});
			return can.route.url(hash);
		});
		el.setAttribute('href', routeHref());
		var handler = function (ev, newVal) {
			el.setAttribute('href', newVal);
		};
		routeHref.bind('change', handler);
		can.bind.call(el, 'removed', function () {
			routeHref.unbind('change', handler);
		});
	});
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
	window.System = window.System.orig;
})();