#!/bin/bash
BASEDIR=$(dirname $0)
cd $BASEDIR
../../node_modules/.bin/http-server -p 8000 &
git clone ../. can
git clone https://github.com/jupiterjs/funcunit.git
cd funcunit
git submodule update --init --recursive
cd ..
git clone https://github.com/jupiterjs/steal.git