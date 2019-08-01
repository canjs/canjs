#!/bin/bash

sed -i '' -e 's/@collection can-legacy/@collection can-core/g' "./node_modules/can-define/docs/define.md"
sed -i '' -e 's/@collection can-legacy/@collection can-core/g' "./node_modules/can-define/map/docs/define-map.md"
sed -i '' -e 's/@collection can-legacy/@collection can-core/g' "./node_modules/can-define/list/docs/define-list.md"