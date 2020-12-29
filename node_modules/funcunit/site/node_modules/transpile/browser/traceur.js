var globalTraceur = require('traceur/bin/traceur');

if(!globalTraceur) {
    globalTraceur = {
        System: System,
        Traceur: Traceur,
        $traceurRuntime: $traceurRuntime
    };
}

// traceur is a module and thus frozen.
module.exports = {
  __proto__: globalTraceur.traceur
};