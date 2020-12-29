/* eslint-disable no-console */

var shell = require('shelljs');

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

console.info('Running git checkout -b gh-pages');
checkResultCode(shell.exec('git checkout -b gh-pages'));

console.info('Running rm -rf node_modules');
checkResultCode(shell.rm('-rf', 'node_modules'));

console.info('Running rm -rf site/node_modules');
checkResultCode(shell.rm('-rf', 'site/node_modules'));

console.info('Running rm -rf docs');
checkResultCode(shell.rm('-rf', 'docs'));

console.info('Running rm -rf guides');
checkResultCode(shell.rm('-rf', 'guides'));

console.info('Running $(MAKE) -C site build');
checkResultCode(shell.exec('cd site && npm install --no-shrinkwrap && npm run build && cd ..'));

console.info('Running npm install --no-shrinkwrap');
checkResultCode(shell.exec('npm install --no-shrinkwrap'));

console.info('Running npm run document:force');
checkResultCode(shell.exec('npm run document:force'));

console.info('Running git add -f docs/');
checkResultCode(shell.exec('git add -f docs/'));

console.info('Running git add -f guides/');
checkResultCode(shell.exec('git add -f guides/'));

console.info('Running git add -f site/static/');
checkResultCode(shell.exec('git add -f site/static/'));

console.info('Running git add -f examples/');
checkResultCode(shell.exec('git add -f examples/'));

console.info('Running git add -f index.html');
checkResultCode(shell.exec('git add -f index.html'));

console.info('Running git add -f CNAME');
checkResultCode(shell.exec('git add -f CNAME'));

console.info('Running git commit -m "Publish docs"');
checkResultCode(shell.exec('git commit -m "Publish docs"'));

console.info('Running git push -f origin gh-pages');
checkResultCode(shell.exec('git push -f origin gh-pages'));

console.info('Running git checkout -');
checkResultCode(shell.exec('git checkout -'));

console.info('Running git branch -D gh-pages');
checkResultCode(shell.exec('git branch -D gh-pages'));

function checkResultCode(result) {
  if (result.code !== 0) {
    shell.exit(result.code);
  }
}
