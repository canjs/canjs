<!--
@page changelog Changelog
@parent guides 5
-->

__2.0.4__ ( Dec 23 2013 )

- change: [2.0.4 test fixes](https://github.com/bitovi/canjs/pull/625)
- change: [Makes live safeStrings work](https://github.com/bitovi/canjs/pull/624)
- change: [Working @index in mustache templates](https://github.com/bitovi/canjs/pull/620)
- change: [Fixes nested components and `&lt;content&gt;` tags.](https://github.com/bitovi/canjs/pull/619)
- change: [Fixes a problem with double inserted events](https://github.com/bitovi/canjs/pull/618)
- change: [benchmark.js and minor performance improvements](https://github.com/bitovi/canjs/pull/616)
- change: [Node lists rewrite](https://github.com/bitovi/canjs/pull/615)
- change: [temporary fixed mustache index calculation with simple can.List when remove first item of list](https://github.com/bitovi/canjs/pull/613)
- change: [Serialization](https://github.com/bitovi/canjs/pull/611)
- change: [can.Component ATTR value is undefined when passing a function as a scope](https://github.com/bitovi/canjs/issues/609)
- change: [restore will not remove properties that were added since the last backup](https://github.com/bitovi/canjs/pull/607)
- change: [can.Mustache.safestring does not work with computed properties](https://github.com/bitovi/canjs/issues/606)
- change: [Items pushed on lists don&#39;t get removed from the DOM in some cases](https://github.com/bitovi/canjs/issues/605)
- change: [Functions globally defined when it shouldn&#39;t be](https://github.com/bitovi/canjs/pull/604)
- change: [undefined list passed to {{#each}}](https://github.com/bitovi/canjs/pull/602)
- change: [Added test for inserted event bug (live binding block)](https://github.com/bitovi/canjs/pull/601)
- change: [Support Offline Testing](https://github.com/bitovi/canjs/pull/600)
- change: [When using certain html-comments, can.view.Scanner does not recognize them correctly](https://github.com/bitovi/canjs/pull/598)
- change: [teardownMap slows perfomance drastically](https://github.com/bitovi/canjs/issues/595)
- change: [test for component content extension stack overflow bug](https://github.com/bitovi/canjs/pull/594)
- change: [Split element classnames fails with {{#if}}](https://github.com/bitovi/canjs/pull/592)
- change: [fixed an error that is caused by the timeout firing after the element has been removed from the DOM](https://github.com/bitovi/canjs/pull/591)
- change: [Please add trailing slash support for can.route.pushstate](https://github.com/bitovi/canjs/issues/588)
- change: [Overwrite can.Map.List.prototype.serialize to avoid infinite loops](https://github.com/bitovi/canjs/pull/585)
- change: [Iterating over component data not as expected](https://github.com/bitovi/canjs/issues/583)
- change: [can-value shows &quot;undefined&quot; if bound to undefined value](https://github.com/bitovi/canjs/pull/580)
- change: [Maximum Call Stack Exceeded When Destroying a nested model](https://github.com/bitovi/canjs/pull/476)
- change: [Individual test pages should run in CI as well](https://github.com/bitovi/canjs/pull/446)

__2.0.3__ ( Nov 26 2013 )

- change: [fixes #577](https://github.com/bitovi/canjs/pull/578)
- change: [Text live binding remains bound](https://github.com/bitovi/canjs/issues/577)
- change: [fixes for #575 - non-component custom tags](https://github.com/bitovi/canjs/pull/576)
- change: [Non component custom tag problems.](https://github.com/bitovi/canjs/issues/575)
- change: [fixes for jQuery's inserted event and some quick inserted helpers](https://github.com/bitovi/canjs/pull/574)
- change: [Component inserted event doesn't work with jQuery 1.10](https://github.com/bitovi/canjs/issues/572)
- change: [fixes #568 and makes nulls render to empty string](https://github.com/bitovi/canjs/pull/569)
- change: [Mustache loops do not print 0.](https://github.com/bitovi/canjs/issues/568)
- change: [Observe builder update](https://github.com/bitovi/canjs/pull/567)
- change: [Providing a can.Map constructor function to a component's scope does not work.](https://github.com/bitovi/canjs/issues/563)
- change: [552 index calculation](https://github.com/bitovi/canjs/pull/553)
- change: [@index is not calculated correctly when there are identical elements in the list](https://github.com/bitovi/canjs/issues/552)
- change: [Inside the eventHandler this.scope is not set (as it's called on the scope itself)](https://github.com/bitovi/canjs/pull/550)
- change: [Bower support, multiple jQuery versions](https://github.com/bitovi/canjs/pull/529)

__2.0.2__ ( Nov 14 2013 )

- change: [cloning setter comptues](https://github.com/bitovi/canjs/issues/547)
- change: [Event listeners leak in 2.0.1](https://github.com/bitovi/canjs/issues/545)
- change: [can.VERSION for 2.0.1 says @EDGE rather than 2.0.1](https://github.com/bitovi/canjs/issues/544)
- change: ['key' property breaks mustache helpers](https://github.com/bitovi/canjs/pull/542)
- change: [component does not respect can.compute passed via attributes](https://github.com/bitovi/canjs/issues/540)
- change: [Wrapping can.compute in can.Map breaks live-binding](https://github.com/bitovi/canjs/issues/530)

__2.0.1__ ( Nov 12 2013 )

- change: [Fixes #538 helpers aren't called is data passed to the template happens ...](https://github.com/bitovi/canjs/pull/541)
- change: [Update included plugins and release tasks](https://github.com/bitovi/canjs/pull/539)
- change: [mustache: 'with' string is interpreted as with helper keyword](https://github.com/bitovi/canjs/issues/538)
- change: [can.Component two way binding issues](https://github.com/bitovi/canjs/issues/537)
- change: [New lines are not handled properly in special attributes](https://github.com/bitovi/canjs/pull/535)
- change: [can.Control: {document} events are not working](https://github.com/bitovi/canjs/issues/534)
- change: [&quot;{document} body click&quot; breaks in latest](https://github.com/bitovi/canjs/pull/531)
- change: [pushstate() and preventDefault() were not working on default route becau...](https://github.com/bitovi/canjs/pull/528)
- change: [Make $#domManip patch jq2.0-compatible](https://github.com/bitovi/canjs/pull/526)
- change: [broken livebinding after replace can.Map property or remove property](https://github.com/bitovi/canjs/issues/525)
- change: [fixes a problem with each not working if the whole list is replaced](https://github.com/bitovi/canjs/pull/522)
- change: [can.Map stack exceeded on circular data structures](https://github.com/bitovi/canjs/issues/521)
- change: [Fixes #512 #513, sees the glorious return of can.camelize and his trusty sidekick, can.hyphenate](https://github.com/bitovi/canjs/pull/520)
- change: [List.join is not compute-able](https://github.com/bitovi/canjs/issues/519)
- change: [Fix to multiple tags not necessarily having the right context. Close #515](https://github.com/bitovi/canjs/pull/518)
- change: [avoids jQuery's event system when binding on observes which fixes #280](https://github.com/bitovi/canjs/pull/517)
- change: [Implement can.Mustache.safeString](https://github.com/bitovi/canjs/pull/516)
- change: [can.Component helpers context issue](https://github.com/bitovi/canjs/issues/515)
- change: [can.camelize](https://github.com/bitovi/canjs/issues/513)
- change: [can.Component template attributes name case](https://github.com/bitovi/canjs/issues/512)
- change: [Makes attribute arguments passed to a component two way binding](https://github.com/bitovi/canjs/pull/508)
- change: [Fix `Model.List.prototype.findAll()` in IE8.](https://github.com/bitovi/canjs/pull/506)
- change: [Return a new can.compute every time (new can.view.Scope()).compute() is called](https://github.com/bitovi/canjs/pull/505)
- change: [Mustache and EJS issues with attributes and truthy blocks](https://github.com/bitovi/canjs/pull/504)
- change: [Handlebars {{#if}} losing scope of var](https://github.com/bitovi/canjs/issues/503)
- change: [can.Model.List() updates its length after destoy() of one of its models only if it has bindings](https://github.com/bitovi/canjs/issues/495)
- change: [can.Mustache doesn't support SafeString](https://github.com/bitovi/canjs/issues/468)
- change: [can.Mustache: inconsistent behavior when updating nested attributes of an Observe](https://github.com/bitovi/canjs/issues/441)
- change: [Support Handlebars @key and @index directives](https://github.com/bitovi/canjs/issues/383)
- change: [Accessing a parent array property from within mustche](https://github.com/bitovi/canjs/issues/378)
- change: [can.Observe binds for nested object. First time event trigger is only on top level object instead of nested one.](https://github.com/bitovi/canjs/issues/280)

__2.0.0__ ( Nov 07 2013 )

- change: [Replacing lists live-binding](https://github.com/bitovi/canjs/pull/502)
- change: [Fix destroy params](https://github.com/bitovi/canjs/pull/499)
- change: [Special attribute binding](https://github.com/bitovi/canjs/pull/498)
- change: [Fix Mustache binding lists in helpers](https://github.com/bitovi/canjs/pull/496)
- change: [Certain HTML attributes need special live-binding](https://github.com/bitovi/canjs/issues/494)
- change: [Destroy templates and attributes.](https://github.com/bitovi/canjs/pull/492)
- change: [Fix some typo's in the documentation.](https://github.com/bitovi/canjs/pull/489)
- change: [attr() not working in some cases in IE9](https://github.com/bitovi/canjs/issues/488)
- change: [docs update: can.Object dependency for can.fixture](https://github.com/bitovi/canjs/issues/487)
- change: [View renderer functions don't work with Deferreds](https://github.com/bitovi/canjs/issues/486)
- change: [Issue: can.view.ejs(str) and can.view.ejs(id, str) return different responses](https://github.com/bitovi/canjs/pull/485)
- change: [can.Mustache: #if sections are rendered twice when activated from live-binding](https://github.com/bitovi/canjs/issues/477)
- change: [can.route.ready should not be called automatically](https://github.com/bitovi/canjs/issues/475)
- change: [fixed issue #470 can.route default values are not working](https://github.com/bitovi/canjs/pull/474)
- change: [can.route.ready called multiple times](https://github.com/bitovi/canjs/pull/473)
- change: [Mustache two way helpers don't work as documented](https://github.com/bitovi/canjs/issues/469)
- change: [Can't 2-way bind Array](https://github.com/bitovi/canjs/issues/463)
- change: [Bower component does not work with steal](https://github.com/bitovi/canjs/issues/459)
- change: [Live Binding Broken with Models with Nested Sub-models](https://github.com/bitovi/canjs/issues/457)
- change: [String parameter not working as expected for: jQuery.fn.control / jQuery.fn.controls](https://github.com/bitovi/canjs/pull/448)
- change: [error passing can.Observe.List to custom Mustache element helper](https://github.com/bitovi/canjs/issues/438)
- change: [Wrong variable name in the Guide.](https://github.com/bitovi/canjs/issues/431)
- change: [Model.destroy request params](https://github.com/bitovi/canjs/issues/428)
- change: [Fixing can.ajax missing test for error handler with mootools](https://github.com/bitovi/canjs/pull/421)
- change: [Fixing error that occurs when an item in an Observe.List contains a comp...](https://github.com/bitovi/canjs/pull/419)
- change: [Observe#on](https://github.com/bitovi/canjs/issues/394)
- change: [Array is skipped on serialize](https://github.com/bitovi/canjs/issues/393)
- change: [`can.Mustache` live-binding on `can.route` attributes](https://github.com/bitovi/canjs/issues/351)
- change: [create can.Component for custom tags](https://github.com/bitovi/canjs/issues/327)
- change: [Feature/route to string](https://github.com/bitovi/canjs/pull/306)
- change: [Default can.route.ready to false](https://github.com/bitovi/canjs/issues/298)
- change: [Attributes automatic conversion to Map/Model specified type](https://github.com/bitovi/canjs/pull/293)
- change: [can.route.pushstate mishandles hash fragments](https://github.com/bitovi/canjs/issues/259)
- change: [Needed host check for pushstate.js](https://github.com/bitovi/canjs/pull/249)
- change: [Support for rendering document fragments (returned from the renderer function) in the templates](https://github.com/bitovi/canjs/pull/244)
- change: [Model.save: handle response data or return data in save callback](https://github.com/bitovi/canjs/issues/236)
- change: [AMD Consistency](https://github.com/bitovi/canjs/issues/211)
- change: [Extensionless views fail](https://github.com/bitovi/canjs/pull/193)
- change: [can.Model.findAll promotes usage of XSS attack vector](https://github.com/bitovi/canjs/issues/186)
- change: [Allow context change after element has been rendered](https://github.com/bitovi/canjs/issues/180)
- change: [Make it easier to setup 2-way-binding and other interesting behaviors](https://github.com/bitovi/canjs/issues/178)
- change: [Accessing attributes in Model destroy](https://github.com/bitovi/canjs/issues/171)
- change: [mustache: support for backtrack path](https://github.com/bitovi/canjs/issues/163)
- change: [Live-bound dynamic attributes don't get updated properly if they don't exist on initial execution](https://github.com/bitovi/canjs/issues/157)
- change: [The can.Model.models arrayName should be configurable like observable's 'id' property](https://github.com/bitovi/canjs/issues/128)
- change: [can.observe.delegate fails on compound selectors with wildcards](https://github.com/bitovi/canjs/issues/119)

__1.1.8__ ( Sep 24 2013 )

- change: [can.Observe.List.Sort: fix for case when comparator is not a function](https://github.com/bitovi/canjs/pull/481)
- change: [makeFindOne example cache error: http://canjs.com/docs/can.Model.makeFindOne.html](https://github.com/bitovi/canjs/issues/471)
- change: [Two return statements in Mustache.getHelper](https://github.com/bitovi/canjs/pull/465)
- change: [recommended syntax breaks can.route](https://github.com/bitovi/canjs/issues/462)
- change: [Prevent infinite recursion on unbindAndTeardown when Observe's _bindings is undefined and Observe is self-referential](https://github.com/bitovi/canjs/pull/461)
- change: [Catch only exceptions thrown by model[func]() (fix #454 and re #384)](https://github.com/bitovi/canjs/pull/455)
- change: [CanJS Swallowing Errors](https://github.com/bitovi/canjs/issues/454)

__1.1.7__ ( Jul 23 2013 )

- change: [can.Model.model attribute serialization fix](https://github.com/bitovi/canjs/pull/449)
- change: [Build cleanup](https://github.com/bitovi/canjs/pull/445)
- change: [.model should always serialize Observes](https://github.com/bitovi/canjs/issues/444)
- change: [Preloaded recursive views fail to render their recursions](https://github.com/bitovi/canjs/pull/439)
- change: [Use .attr() when evaluating errors in validations](https://github.com/bitovi/canjs/pull/437)
- change: [can.compute error with can.Observe](https://github.com/bitovi/canjs/pull/436)
- change: [Fix the bug where mustache each would fail if called with the empty list](https://github.com/bitovi/canjs/pull/433)
- change: [Mustache's each fails with empty list](https://github.com/bitovi/canjs/issues/432)
- change: [can.sub should return null if value is undefined or null](https://github.com/bitovi/canjs/pull/429)
- change: [can.VERSION shows @EDGE but what about 2 years later?](https://github.com/bitovi/canjs/issues/418)
- change: [can.compute-friendly validations](https://github.com/bitovi/canjs/pull/410)
- change: [Test AMD builds](https://github.com/bitovi/canjs/issues/409)
- change: [fixture based CRUD test fails in phantomjs](https://github.com/bitovi/canjs/issues/408)
- change: [can.Model Fails Silently When Server Doesn't Return an Array for findAll](https://github.com/bitovi/canjs/pull/384)

__1.1.6__ ( May 30 2013 )

- change: [Mustache doesn't read computed List.length correctly](https://github.com/bitovi/canjs/issues/390)
- change: [Removing the semi-colon splitter in EJS transform, too unreliable #242](https://github.com/bitovi/canjs/issues/389)
- change: [EJS transforming wasn't processing semi-colons properly within parentheses #242](https://github.com/bitovi/canjs/issues/388)
- change: [Adds support for EJS shared blocks #242](https://github.com/bitovi/canjs/issues/387)
- change: [. in helpers](https://github.com/bitovi/canjs/issues/379)
- change: [1.1.6pre - something going wrong with can.computes() in Mustache templates](https://github.com/bitovi/canjs/issues/376)
- change: [can.route references delegate but does not include it](https://github.com/bitovi/canjs/issues/373)
- change: [Binding to an Observe.compute value is broken](https://github.com/bitovi/canjs/issues/372)
- change: [Added validatesNumericalityOf to validations](https://github.com/bitovi/canjs/issues/370)
- change: [Include can.Object in CanJS distribution](https://github.com/bitovi/canjs/issues/368)
- change: [can.Map makes can.Deferred into an observable](https://github.com/bitovi/canjs/issues/367)
- change: [Update sub to not break when str is undefined](https://github.com/bitovi/canjs/issues/365)
- change: [List memory leak fix](https://github.com/bitovi/canjs/issues/363)
- change: [Integrated incremental live lists](https://github.com/bitovi/canjs/issues/361)
- change: [can.view.render update is sometimes `undefined`](https://github.com/bitovi/canjs/issues/360)
- change: [Model.store and live bind does not handle same object initialized more times](https://github.com/bitovi/canjs/issues/357)
- change: [Prevent errors if destroy is called multiple times on a Control instance](https://github.com/bitovi/canjs/issues/352)
- change: [Outputting attribute and value containing '=' truncates the value (EJS &amp; Mustache)](https://github.com/bitovi/canjs/issues/342)
- change: [can.sub fix remove param. Allow only to remove properties + tests](https://github.com/bitovi/canjs/issues/341)
- change: [Can.string getNext function fix](https://github.com/bitovi/canjs/issues/340)
- change: [Maximum Call Stack Exceeded When Destroying a nested model](https://github.com/bitovi/canjs/issues/324)
- change: [Add VERSION property to CanJS Object](https://github.com/bitovi/canjs/issues/316)
- change: [Better handling of null values in Mustache sections.](https://github.com/bitovi/canjs/issues/307)
- change: [model override should work for create and update not just findone and findall](https://github.com/bitovi/canjs/issues/301)
- change: [Download builder should include build version in output](https://github.com/bitovi/canjs/issues/289)
- change: [Don't treat links to &quot;#&quot; as &quot;/&quot;](https://github.com/bitovi/canjs/issues/285)
- change: [Run all tests also on pluginified files](https://github.com/bitovi/canjs/issues/270)
- change: [Observable list's length attribute does not update with live binding using dot separated accessors](https://github.com/bitovi/canjs/issues/267)
- change: [Twitter Bower component of CanJS](https://github.com/bitovi/canjs/issues/252)
- change: [ejs files loose variables  after $.each loop](https://github.com/bitovi/canjs/issues/242)

__1.1.5__ ( Mar 28 2013 )

- change: [Added Mustache.resolve to evaluate truthyness in a common way #333](https://github.com/bitovi/canjs/issues/335)
- change: [Fixed incorrect passing of context stacks with partials in Mustache #288](https://github.com/bitovi/canjs/issues/334)
- change: [Mustache {{#if}} does not correctly evaluate boolean value](https://github.com/bitovi/canjs/issues/333)
- change: [deparam: parse params with remaining ampersand](https://github.com/bitovi/canjs/issues/332)
- change: [Null objects within observes weren't working properly with Mustache sections #307](https://github.com/bitovi/canjs/issues/329)
- change: [Mustache: Pass raw array data as the context instead of trying to resolve it #281](https://github.com/bitovi/canjs/issues/328)
- change: [Allow to pass an array index to removeAttr in Observe and Observe.List](https://github.com/bitovi/canjs/issues/325)
- change: [fixing no arg helpers](https://github.com/bitovi/canjs/issues/322)
- change: [Mustache interpolation issues using Observes inside of an attribute tag](https://github.com/bitovi/canjs/issues/321)
- change: [isObject is undefined ](https://github.com/bitovi/canjs/issues/319)
- change: [Allow dots in Observe keys](https://github.com/bitovi/canjs/issues/318)
- change: [data-view-id being rendered in tag closing](https://github.com/bitovi/canjs/issues/317)
- change: [Execute startBatch callbacks](https://github.com/bitovi/canjs/issues/315)
- change: [HTML comments with either an element callback (EJS) or a helper (Mustache) rendered incorrectly](https://github.com/bitovi/canjs/issues/313)
- change: [Prevent leak from computes that have no bindings.](https://github.com/bitovi/canjs/issues/310)
- change: [Treat &quot;--&quot; as delimiter of empty element](https://github.com/bitovi/canjs/issues/303)
- change: [Fixing can.ajax with mootools](https://github.com/bitovi/canjs/issues/300)
- change: [CanJS tries to parse JSON-map which contains a dot in the key](https://github.com/bitovi/canjs/issues/296)
- change: [can.compute evaluations for the default Mustache handlers](https://github.com/bitovi/canjs/issues/292)
- change: [can.Mustache: Array of objects passed as context to partials, breaks data helper and rendering.](https://github.com/bitovi/canjs/issues/288)
- change: [adding greedy space to model url splitter](https://github.com/bitovi/canjs/issues/284)
- change: [Fix for numeric inputs not living binding](https://github.com/bitovi/canjs/issues/282)
- change: [Empty strings not handled properly](https://github.com/bitovi/canjs/issues/281)
- change: [can.Control event delegation problem](https://github.com/bitovi/canjs/issues/279)
- change: [fixing computes from converting type](https://github.com/bitovi/canjs/issues/278)
- change: [can.view with Deferreds doesn't pass failures](https://github.com/bitovi/canjs/issues/276)
- change: [HTML comments trip EJS rendering](https://github.com/bitovi/canjs/issues/271)
- change: [can.Map.prototype.each overrides {{#each}} Mustache helper.](https://github.com/bitovi/canjs/issues/258)
- change: [Any model with a &quot;.&quot; in the key name will cause observe.js _set() to throw and error](https://github.com/bitovi/canjs/issues/257)
- change: [Item.List splice method does not convert inserted elements to Item type](https://github.com/bitovi/canjs/issues/253)
- change: [Mustache: DOM exception when applying certain block patterns](https://github.com/bitovi/canjs/issues/243)
- change: [Mustache: Interpolated values when iterating through an Observe.List fail if not surrounded by a DOM node](https://github.com/bitovi/canjs/issues/153)

__1.1.4__ ( February 5, 2013 )

- fix: [Haschange binding and route ready for all libraries](https://github.com/bitovi/canjs/pull/265)
- fix: [Get converters and .attr working the right way with nested objects](https://github.com/bitovi/canjs/issues/264)
- fix: [CanJS/ejs table+tbody rendering of a list gives nested tbody items](https://github.com/bitovi/canjs/pull/233)
- fix: [Mustache: Inconsistent treatment of function attributes](https://github.com/bitovi/canjs/issues/231)
- fix: [EJS renders "@@!!@@" instead of Model data when a Deferred is passed into can.view that takes a long time to resolve](https://github.com/bitovi/canjs/issues/230)
- fix: [Mustache: registered helpers do not create the context stack correctly](https://github.com/bitovi/canjs/issues/228)
- fix: [Mustache: only the current context is passed to partials, instead of the full stack](https://github.com/bitovi/canjs/issues/227)
- fix: [IE8 error when setting up observe list](https://github.com/bitovi/canjs/pull/226)
- fix: [Resetting a live-bound `<textarea>` changes its value to `__!!__`](https://github.com/bitovi/canjs/pull/223)
- fix: [hashchange binding still broken in mootools](https://github.com/bitovi/canjs/issues/216)
- fix: [can.Mustache - with context lost in nested sections](https://github.com/bitovi/canjs/issues/215)
- fix: [Enabled passing in helpers and partials to Mustache views](https://github.com/bitovi/canjs/pull/214), ([1](https://github.com/bitovi/canjs/pull/260))
- fix: [Make the resolved data available when using can.view](https://github.com/bitovi/canjs/issues/209)
- fix: [.attr method doesn't merge nested objects](https://github.com/bitovi/canjs/pull/207)
- fix: [Live binding on observe.lists nested in an observe doesn't work](https://github.com/bitovi/canjs/issues/204)
- fix: [Attributes/Converters Issue](https://github.com/bitovi/canjs/issues/174)
- fix: [Observe.List push/unshift doesn't fire when sort comparator is set](https://github.com/bitovi/canjs/issues/170)
- fix: [Observe.List sort doesn't use custom method passed](https://github.com/bitovi/canjs/issues/169)
- fix: [test&fix: null values crashing validations](https://github.com/bitovi/canjs/pull/145)
- fix: [EJS rendering null value](https://github.com/bitovi/canjs/pull/118)
- fix: [can.Map sort plugin doesn't trigger add events](https://github.com/bitovi/canjs/issues/205)
- fix: [Observe.List sort plugin erroring on item removal](https://github.com/bitovi/canjs/pull/88)
- fix: [Live binding on observe.lists nested in an observe doesn't work](https://github.com/bitovi/canjs/issues/204)
- fix: [Observe.List sort doesn't use custom method passed](https://github.com/bitovi/canjs/issues/169)
- add: [removeAttr can.Model attribute](https://github.com/bitovi/canjs/pull/245)
- add: [Calling destroy on non persisted model](https://github.com/bitovi/canjs/pull/181)
- add: [jQuery 1.9.x support](https://github.com/bitovi/canjs/pull/237)
- add: [Mustache Helpers that accept computes and return an element should work](https://github.com/bitovi/canjs/issues/254)

__1.1.3__ ( December 11, 2012 )

- fix: [Empty model displays __!!__ as input values](https://github.com/bitovi/canjs/issues/196)
- fix: [Rendering models in tables produces different results than an equivalent observe](https://github.com/bitovi/canjs/issues/202)
- fix: [`data` Mustache helper doesn't parse attribute properly](https://github.com/bitovi/canjs/issues/200)
- fix: [Partial Mustache views assume the right parent tag for live-binding](https://github.com/bitovi/canjs/commit/492a22f7655d1ff15c37b95213252c87a264fe3e)
- fix: [Mustache partials don't parse properly](https://github.com/bitovi/canjs/issues/199)
- fix: [can.Control will fail to find $.event.special in a $.noConflict(true) scenario](https://github.com/bitovi/canjs/issues/191)
- fix: [Nameless view renderers should return document fragment](https://github.com/bitovi/canjs/issues/195)
- fix: [compute only updates once when a list's contents are replaced](https://github.com/bitovi/canjs/commit/9cb47dfabba5dbe3bef161e6aae4a5ce2965ac49)
- add: [Updated jQuery hashchange plugin](https://github.com/bitovi/canjs/pull/201)
- add: [Generate computes from an observe property](https://github.com/bitovi/canjs/issues/203)
- add: [Add can.List.prototype.replace](https://github.com/bitovi/canjs/issues/194)
- add: [Return resolved data models in view callback](https://github.com/bitovi/canjs/issues/1log
83)

__1.1.2__ ( November 28, 2012 )

- fix: [Solve issue when stealing mustache templates](https://github.com/bitovi/canjs/pull/175) - `can/view/mustache` returns `can` object now
- fix: [Controls shouldn't bind to templated events that contain undefined values](https://github.com/bitovi/canjs/commit/e90bc56d9c1ec46ae01f084ccbcab43c9c611d0c)
- fix: [Resetting a form changes input values to __!!__](https://github.com/bitovi/canjs/issues/166)
- fix: [Further AMD build improvements](https://github.com/bitovi/canjs/issues/168)
- fix: [Strange conversion of nested arrays to Observe.List](https://github.com/bitovi/canjs/issues/172)

__1.1.1__ ( November 19, 2012 )

- fix: [@@!!@@ Appears on Page With EJS and Table in non-IE Browsers](https://github.com/bitovi/canjs/issues/156)
- fix: [can.deparam leaks to global scope](https://github.com/bitovi/canjs/issues/152)
- fix: [nested attr() call on a model with List attributes blows away existing List](https://github.com/bitovi/canjs/pull/160)
- add: [https://github.com/bitovi/canjs/issues/162](https://github.com/bitovi/canjs/issues/162)
- Improved AMD support, see [#155](https://github.com/bitovi/canjs/issues/155)

__1.1.0__ ( November 13, 2012 )

 - add: [AMD module](#using_canjs-amd) support for each dependency ([#46](https://github.com/bitovi/canjs/issues/46))

 - can.util
    - Updated jQuery to 1.8.2
    - Updated Zepto to 1.0rc1
    - Updated YUI to 3.7.3

 - can.Mustache
    - Added Mustache/Handlebars support with Live Binding

 - can.view
    - Changed [passing jQuery a node list instead of a fragment in View Modifiers](https://github.com/bitovi/canjs/pull/131)

 - can.EJS
    - fix: [the way EJS handles multiple hookups in the same attribute](https://github.com/bitovi/canjs/pull/134)
    - fix: [Nested Loops in EJS](https://github.com/bitovi/canjs/issues/135)
    - fix: [can.EJS template rendering issue](https://github.com/bitovi/canjs/issues/118)
    - fix: [multiline elements in EJS](https://github.com/bitovi/canjs/pull/76)

 - can.route
    - fix: [hashchange binding with mootools broken](https://github.com/bitovi/canjs/issues/124)

 - can.Control
    - add: [control does not listen to touchmove event on controller itself](https://github.com/bitovi/canjs/issues/104)

 - can.Map
    - add: [List binding on .length of an object](https://github.com/bitovi/canjs/issues/142)
    - fix: [validation error that incorrectly labels an attribute with a value of 0 as empty](https://github.com/bitovi/canjs/pull/132)
    - add: [you can now pluralise event names to listen to matching events of that type (rather than firing a single event)](https://github.com/bitovi/canjs/issues/122)
    - add: [compound sets now behave correctly](https://github.com/bitovi/canjs/issues/119)
    - fix: [can.Map.delegate sets wrong event.currentTarget](https://github.com/bitovi/canjs/issues/123)
    - add: [ability to assign object as attribute type in can.Map](https://github.com/bitovi/canjs/issues/107)

 - can.Model
    - fix: [can.Model with attributes that are models gets corrupted when you call attr()](https://github.com/bitovi/canjs/pull/141)
    - add: [missing dependency to can/model](https://github.com/bitovi/canjs/pull/140)
    - Moved can/model/elements to can/map/elements and renamed `models` to `instances`
    - fix: [can.Model.List doesn't fire the change event on the expando properties ](https://github.com/bitovi/canjs/issues/129)

__1.0.7__ (June 25nd 2012)

 - can.compute
      - Fixed a [global collision](https://github.com/jupiterjs/canjs/commit/7aea62462f3d8d7855f71ccdf16330e60d59f6fa) with `can.Control`.

 - Removed globals
      - Thanks [Daniel Franz](https://github.com/daniel-franz)!

__1.0.6__ (June 22nd 2012)

 - can.compute
      - Added a [computed value type object](https://github.com/jupiterjs/canjs/commit/8eb7847d410c840da38f4dd5157726e560d0a5f5) that can be used to represent several observe properties or a single static value.

 - can.ejs
      - Fixed problem with [trailing text](https://github.com/jupiterjs/canjs/commit/419248bf190febe5c3ccacb188e9c812e997278e) not being added to template.

__1.0.5__ (June 2nd 2012)

 - can.model
      - Added ability to [overwrite model crud operations](https://github.com/jupiterjs/canjs/commit/235097a46e45329d63da9b6d28a6c284c1b2a157) by defining a `make` prefixed static function, such as `makeFindAll`

 - can.EJS
      - [Fixed problem](https://github.com/jupiterjs/canjs/commit/4d4d31f12a57db1ff81f47fa0c8b4261d8133dbb) with nested block statements.

 - can.each
      - [Added optional third argument](https://github.com/jupiterjs/canjs/commit/bbd2ad5e38df90f0ebcc09a20f7ea216fe20bd72) that defines the context for the iterator function.

 - can/util/function
      - Added `can.defer` [method](https://github.com/jupiterjs/canjs/commit/64de5254ce8c284b20c3da487638497457152105) as an alias for `setTimeout(function(){}, 0)`.

 - can.view
      - Fixed `toId` [so it will work](https://github.com/jupiterjs/canjs/commit/19c9ca0f07b00afe3c99bf439c089948c46464a6) with both older and newer `steal` versions.

__1.0.4__ (May 22nd 2012)

 - Fixed plugin build process

__1.0.2__ (May 20th 2012)

 - Fixed breaking namespace issue.

__1.0.1__ (May 18th 2012)

 - can.util
     - fix: `can.each` now makes sure the [collection being iterated](https://github.com/jupiterjs/canjs/commit/c3016bc9d7075e5a31cc37576d944d9734457307) is not `undefined`

 - can.control
     - add: Redirect to another controller [method using a string](https://github.com/jupiterjs/canjs/commit/cab9b518ac0193431815ac0d34938f1168e45d5f)

 - can.model
     - fix: [Model instances in model store will be updated when `findAll` or `findOne` retrieves updated instances fixes](https://github.com/jupiterjs/canjs/commit/e4606906d37797d4ff551d1924d44f0c4d516fb7)
     - fix: Static methods such as `findOne` and `findAll` can [now be rejected](https://github.com/jupiterjs/canjs/commit/ff17833b52162348413ebdc47baaa389a90464f9). Thanks [roelmonnens](https://twitter.com/roelmonnens)!

 - can.route
    - add: Deliminating tokens now [configurable](https://github.com/jupiterjs/canjs/commit/ca98f8f2b781456a42866805e6f9879899dc38af)
    - fix: [Current route wins if all else equal](https://github.com/jupiterjs/canjs/commit/863f37cc3d34f52517050444e0b31b7d63d6c784)

__1.0__ (May 14st 2012)

 - [Registers itself as an AMD](https://github.com/jupiterjs/canjs/blob/master/util/exports.js) module if `define` is in the `window`

 - can.fixture
    - add: [a fixture plugin](https://github.com/jupiterjs/canjs/tree/5277f6f526cfa2514954d66e6f759ec73c47bf09)

 - can.util
    - add: [a util/function plugin](https://github.com/jupiterjs/canjs/commit/75e99f3b1545d4086ccdae259ccc87a3e8e7a018)

 - can.route
    - fix: [favor current route when matching](https://github.com/jupiterjs/canjs/commit/863f37cc3d34f52517050444e0b31b7d63d6c784)
    - fix: [uses defaults to match route better, and current route is not always selected](https://github.com/jupiterjs/canjs/commit/b0e59d287caba8fcb98871e4814b924588aef138)

__1.0 Beta 2__ (April 21st 2012)

 - can.util
    - change: [reverse argument order of can.each](https://github.com/jupiterjs/canjs/commit/234fd3b9eca18abdbc3fdbea114be6a818bfe6e3)
    - change/fix: [buildFragment returns non cached frag](https://github.com/jupiterjs/canjs/issues/33)
    - fix: [zepto's isEmptyObject was broke](https://github.com/jupiterjs/canjs/commit/7fe391f59a1f54e3f197f31e20276646f82e7f2e)
 - can.observe
    - feature: [recursive observes don't blow up](https://github.com/jupiterjs/canjs/issues/27)
    - change: [reverse argument order of can.each](https://github.com/jupiterjs/canjs/commit/234fd3b9eca18abdbc3fdbea114be6a818bfe6e3)
    - fix: [attr change events have old value](https://github.com/jupiterjs/canjs/commit/4081a9baf4441c1002467342baae3cdd885994c6)

 - can.model
    - fix: [findOne and findAll work with super](https://github.com/jupiterjs/canjs/commit/c93ae5478eea7fdb88fa6fc03211d81c8d4ca3bd)
    - fix: [model using custom id for store](https://github.com/jupiterjs/canjs/commit/14d05c29e71ed8c462ba49b740d9eb8e342d3c85)
    - fix: [destroy not working with templated id](https://github.com/jupiterjs/canjs/issues/32)

 - can.route
    - fix: a host of bugs in libaries other than jQuery because can.route was not properly tested in other libraries.
    - fix: can.param fixed in [dojo](https://github.com/jupiterjs/canjs/commit/77dfa012b2f6baa7dfb0fe84f2d62aeb5b04fc90),

__1.0 Beta 1__ (April 1st 2012)

Released!
