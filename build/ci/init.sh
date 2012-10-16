#!/bin/bash
BASEDIR=$(dirname $0)
mkdir $BASEDIR/can
git archive HEAD | tar -x -C $BASEDIR/can
node_modules/.bin/http-server -p 8000 &
cd $BASEDIR
git clone https://github.com/jupiterjs/funcunit.git
cd funcunit
git submodule update --init --recursive
cd ..
git clone https://github.com/jupiterjs/steal.git