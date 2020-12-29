console.log("dependent module loaded");
let module = {
  name: 'dep'
};
window.MODULE_DEP = module;

export default module;