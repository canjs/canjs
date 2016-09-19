module.exports = function (grunt) {
  var browsers = [{
	    browserName: 'firefox',
	    platform: 'linux'
	  }, {
	    browserName: 'googlechrome',
	    platform: 'windows'
	  }, {
	    browserName: 'safari',
	    platform: 'OS X 10.11',
	    version: '9.0'
	  }, {
	    browserName: 'internet explorer',
	    platform: 'Windows 8',
	    version: '10.0'
	  }, {
	    browserName: 'internet explorer',
	    platform: 'Windows 7',
	    version: '9'
	  }
  ];
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          base: '',
          port: 9999
        }
      }
    },
  
    'saucelabs-qunit': {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:9999/test/index.html?hidepassed'
          ],
          browsers: browsers,
          build: process.env.TRAVIS_JOB_ID,
          testname: 'qunit tests',
          throttled: 2,
          sauceConfig: {
            'video-upload-on-pass': false
          }
        }
      }
    },
    watch: {}
  });
  
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs');
  
  grunt.registerTask('default', ['connect', 'saucelabs-qunit']);
};
