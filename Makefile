publish-docs:
	npm install
	git checkout -b gh-pages
	./node_modules/.bin/bit-docs -fd
	git add -f doc/
	git add -f index.html
	git add -f node_modules/can-*
	git add -f node_modules/steal
	git add -f node_modules/steal-qunit
	git add -f node_modules/steal-systemjs
	git add -f node_modules/steal-es6-module-loader
	git add -f node_modules/when
	git add -f node_modules/jquery
	git add -f node_modules/jquery-ui
	git commit -m "Publish docs"
	git push -f origin gh-pages
	git rm -q -r --cached node_modules
	git checkout -
	git branch -D gh-pages
