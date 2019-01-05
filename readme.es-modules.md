## Importent design notes
Since CanJS is currently CJS based every package has only a single export that is called default CJS is not able to export more then one property

we keept the re exports only for experimental usage to algin the new api.

the final version of core should use direct exports of the NPM packages 

## tearser 
- don't supports multyentry config! out of the box

## Experiments to do
change all packages that do named exports to import and export in seperated lines to test if treeshaking works better then.

## Remove Statefullness and namespace 
We should remove the namespace hack.

## Switching to .mjs
```bash
find . -name "*.js" -exec bash -c 'mv "$1" "${1%.js}".mjs' - '{}' \;
find . -name "*.js" -exec bash -c 'git mv "$1" "${1%.js}".mjs' - '{}' \;
```

## package.json
- should point to dist in the final version 
- supports now npm run build:steal
- supports now npm run build:rollup

## Todo:
- mimic the current build process with rollup
- create a new build process with rollup that is more nativ.
- folder es should be maybe renamed to src

## Extra packages
- es/can-polyfill.js => can be used for ssr
- es/can-log.js => ESM Version using extra package dependency 
  - import nonew from "class-nonew-decorator"; 
  - npm install class-nonew-decorator 