var ghdownload = require('../lib/github-download')
  , testutil = require('testutil')
  , fs =require('fs-extra')
  , path = require('path')
  , nock = require('nock')

var TEST_DIR = null

describe('github-download', function() {
  beforeEach(function() {
    if (fs.existsSync(TEST_DIR)) fs.removeSync(TEST_DIR)
    TEST_DIR = testutil.createTestDir('github-download')
  })

  describe('> when input is an object with user and repo', function() {
    it('should download the latest copy of master', function(done) {
      var input = {user: 'jprichardson', repo: 'node-batchflow'}
      TEST(path.join(TEST_DIR, '1'), input, done)
    })
  })

  describe('> when input is an relative Github repo', function() {
    it('should download the latest copy of master', function(done) {
      var input = 'jprichardson/node-batchflow'
      TEST(path.join(TEST_DIR, '2'), input, done)
    })
  })

  describe('> when input is git path Github repo', function() {
    it('should download the latest copy of master', function(done) {
      var input = 'git@github.com:jprichardson/node-batchflow.git'
      TEST(path.join(TEST_DIR, '3'), input, done)
    })
  })

  describe('> when Github API limit has been reached', function() {
    it('should download the zip of the repo', function(done) {
      var input = {user: 'jprichardson', repo: 'node-batchflow'}
      
      var scope = nock('https://api.github.com/')
      .filteringPath(function(path) {
        return '*';
      })
      .get('*')
      .reply(403, {message: "API Rate Limit Exceeded for $IP"})

      TEST(path.join(TEST_DIR, '4'), input, done)
    })
  })
})

function TEST (outputDir, input, done) {
  var files = []
    , dirs = []
    , zip = null

  //console.log('OD: ' + outputDir)
  if (!fs.existsSync(outputDir)) {
    fs.removeSync(outputDir)
    fs.mkdirsSync(outputDir)
  }

  ghdownload(input, outputDir)
  .on('dir', function(dir) {
    //console.log('D: ' + dir)
    dirs.push(dir)
  })
  .on('file', function(file) {
    //console.log('F: ' + file)
    files.push(file)
  })
  .on('zip', function(zipUrl) {
    zip = zipUrl
  })
  .on('error', function(err) {
    throw err
    done(err) //shouldn't happen
  })
  .on('end', function() {
    if (!zip) { //file and dir events dont get emitted on zip
      T (files.length > 10)
      T (dirs.length >= 2)
    }

    var items = []

    //console.log('OD2: ' + outputDir)
    items = items.concat(fs.readdirSync(outputDir))
    items = items.concat(fs.readdirSync(path.join(outputDir, 'lib')))
    items = items.concat(fs.readdirSync(path.join(outputDir, 'test')))
    //console.dir(items)

    T (fs.existsSync(path.join(outputDir, '.gitignore')))
    T (fs.existsSync(path.join(outputDir, '.travis.yml')))
    T (fs.existsSync(path.join(outputDir, 'CHANGELOG.md')))
    T (fs.existsSync(path.join(outputDir, 'LICENSE')))
    T (fs.existsSync(path.join(outputDir, 'README.md')))
    T (fs.existsSync(path.join(outputDir, 'package.json')))
    T (fs.existsSync(path.join(outputDir, 'lib/batchflow.js')))
    T (fs.existsSync(path.join(outputDir, 'test/batchflow.test.js')))
    T (fs.existsSync(path.join(outputDir, 'test/mocha.opts')))

    T (fs.readFileSync(path.join(outputDir,'LICENSE'), 'utf8').indexOf('jprichardson@gmail.com') > 0)
    
    setTimeout(function() {
      done() 
    },20)
  })
}

