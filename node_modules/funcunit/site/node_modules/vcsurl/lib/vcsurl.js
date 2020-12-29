

module.exports = function vcsurl (url) {
  if (url.indexOf('github.com') >= 0) 
    return parseUrl(url, 'github.com')
  else if (url.indexOf('bitbucket.org') >= 0) 
    return parseUrl(url, 'bitbucket.org') 
} 

function parseUrl(url, site) {
  var pos = url.indexOf(site) + site.length + 1; //+1 => chop either ':' or '/'
  var repo = url.substring(pos);

  repo = repo.replace('.git', '')

  var data = repo.split('/')

  return 'https://' + site.toString() + '/' + data[0] + '/' + data[1];
}