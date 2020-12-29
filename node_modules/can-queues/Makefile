publish-docs:
	npm install --no-shrinkwrap
	git checkout -b gh-pages
	npm run docco
	git add -f docs/
	git fetch
	git commit -m "Publish docs"
	git push -f origin gh-pages
	git checkout -
	git branch -D gh-pages
