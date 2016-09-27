module.exports = function (grunt) {
<<<<<<< e44290c78b45a021321beecba1186590e1fb2e7d
  var browsers = [
	  {
		  browserName: 'firefox',
		  platform: 'Windows 10',
		  version: '48.0'
		}, {
		  browserName: 'googlechrome',
		  platform: 'Windows 10'
		}, {
		  browserName: 'safari',
		  platform: 'OS X 10.11',
		  version: '9.0'
		}, {
		  browserName: 'internet explorer',
		  platform: 'Windows 8',
		  version: '10.0'
		}
=======
  var browsers = [{
	    browserName: 'firefox',
	    platform: 'Windows 10',
	    version: '48.0'
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
	  }
>>>>>>> Enable Safari 9 on Saucelabs
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
          throttled: 1,
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
