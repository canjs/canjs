#!/bin/sh
#
# Customize firefox to allow popups
# See https://mike.kaply.com/2012/03/15/customizing-firefox-default-preference-files/
#
cd /usr/local/firefox/browser
mkdir -p defaults/preferences
cd defaults/preferences

touch prefs.js
echo "// Fist line should be skipped" > prefs.js
echo "pref('dom.disable_open_during_load', false);" >> prefs.js
