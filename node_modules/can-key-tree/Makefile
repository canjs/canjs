publish-docs:
	npm install --no-shrinkwrap
	git checkout -b gh-pages
	./node_modules/.bin/docco can-key-tree.js
	git add -f docs/
	git fetch
	git checkout origin/gh-pages
	git commit -m "Publish docs"
	git push -f git@github.com:canjs/can-key-tree gh-pages
	git rm -q -r --cached node_modules
	git checkout -
	git branch -D gh-pages
