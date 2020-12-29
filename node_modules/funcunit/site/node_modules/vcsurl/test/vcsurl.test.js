var vcsurl = require('../lib/vcsurl')
  , testutil = require('testutil');

suite('vcsurl')

test('normalize github', function() {
  EQ (vcsurl('git@github.com:jprichardson/string.js.git'), 'https://github.com/jprichardson/string.js')
  EQ (vcsurl('git://github.com/jprichardson/string.js.git'), 'https://github.com/jprichardson/string.js')
  EQ (vcsurl('https://github.com/jprichardson/string.js.git'), 'https://github.com/jprichardson/string.js')
})

test('normalize bitbucket', function() {
  EQ (vcsurl('ssh://hg@bitbucket.org/mercurialeclipse/main'), 'https://bitbucket.org/mercurialeclipse/main')
  EQ (vcsurl('https://bitbucket.org/mercurialeclipse/main'), 'https://bitbucket.org/mercurialeclipse/main')
  EQ (vcsurl('git@bitbucket.org:mirror/rails.git'), 'https://bitbucket.org/mirror/rails')
  EQ (vcsurl('https://bitbucket.org/mirror/rails.git'), 'https://bitbucket.org/mirror/rails')
})