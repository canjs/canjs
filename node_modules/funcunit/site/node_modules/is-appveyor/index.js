/*!
 * is-powershell | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/is-powershell
*/
'use strict';

module.exports = 'CI' in process.env && 'APPVEYOR' in process.env;
