/* global global */
export default async function browserDOMPollyfills() {
  return ((global)=>{
    let Pollyfills = [];
    
    if (!global.location){
      global.location = global.location || { href: ""};
    }
    
    if (!global.window) {
      Pollyfills.push(import("jsdom").then(m=>global.window=new m.default.JSDOM())); //
    }
  
    if (!global.document) {
      Pollyfills.push(import("can-vdom/make-document/make-document").then(m=>global.document=m.default()));
    }
       
    if (!global.XMLHttpRequest) {
      Pollyfills.push(import("xmlhttprequest").then(x=>global.XMLHttpRequest = x.default.XMLHttpRequest));
    }
    
    return Promise.all(Pollyfills);
  })(new Function("return this")());
}