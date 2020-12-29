GRUNT_CLI := $(shell which grunt 2> /dev/null)

all: test

grunt-cli:
ifndef GRUNT_CLI
	[ -x "$(PWD)/node_modules/.bin/grunt" ] || npm install grunt-cli
GRUNT_CLI := "$(PWD)/node_modules/.bin/grunt"
endif

deps: grunt-cli
	npm install

test: deps
	$(GRUNT_CLI) test

.PHONY: grunt-cli deps test all
