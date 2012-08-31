steal('can/view/handlebars/handlebars-1.0.0.beta.6.js', 
      'can/observe/compute', 
      'can/view', 
      'can/view/scanner.js')
.then(function(){

/**
 * These are the tokens for the scanner.
 */
can.view.tokens = {
    tLeft: "{{$", // Template  ---- Not supported
    tRight: "$}}", // Right Template  ---- Not supported
    rLeft: "{{{", // Return
    reLeft: "{{", // Return Escaped
    cmntLeft: "{{#", // Comment ---- Not supported
    left: "{{", // Run
    right: "}}", // Right -> All have same,
    rRight: "}}}"
};

can.hb = function(template, attrs){
    var template = Handlebars.compile(template);
    template = template(attrs)
    //can.view.hookups[2](can.$("[data-view-id='2']"))
    return can.view._scan(template).out;
};

});