publish-docs:
	npm install
	git checkout -b gh-pages
	./node_modules/.bin/bit-docs -fd
	rm -rf test/builders/
	git add -f test/
	git add -f doc/
	git add -f index.html
	git add -f node_modules/can-*
	git add -f node_modules/steal
	git add -f node_modules/steal-*
	git add -f node_modules/when
	git add -f node_modules/jquery
	git add -f node_modules/jquery-ui
	git add -f node_modules/funcunit
	git add -f node_modules/syn
	git add -f node_modules/grunt-contrib-connect
	git add -f node_modules/grunt-saucelabs
	git commit -m "Publish docs"
	git push -f origin gh-pages
	git rm -q -r --cached node_modules
	git checkout -
	git branch -D gh-pages
