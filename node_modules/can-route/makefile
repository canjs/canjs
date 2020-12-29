publish-docs:
	npm install --no-shrinkwrap
	git checkout -b gh-pages
	./node_modules/.bin/docco can-route.js src/*.js
	git add -f docs/
	git fetch
	git commit -m "Publish docs"
	git push -f origin gh-pages
	git rm -q -r --cached node_modules
	git checkout -
	git branch -D gh-pages