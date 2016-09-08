@page guides/contributing/code Code
@parent guides/contributing

@description This page details how contribute a code change to CanJS.

@body

## Overview

- lots of different repos, but they are mostly similar.

## Getting the code and verify its working

Make sure you have NodeJS greater or equal to version 5 installed.

1. Fork the repo you are working from.
2. Clone the individual repo:

   ```
   > git clone git@github.com:<your username>/can-compute.git
   ```

3. Install dependencies:

   ```
   > npm install
   ```

4. Run tests

   ```
   > npm test
   ```

## Structure

Every CanJS repository is slightly different, but they work the same way.

 - Identify main module
 - Identify tests


##  Make your changes

1. Create a new feature branch - `git checkout -b html5-fix`
2. Make some changes.
3. Update tests to accommodate your changes.
4. Run tests `npm test` and make sure they pass in all browsers.
5. Update documentation if necessary.
6. Push your changes to your remote branch - `git push origin html5-fix`
7. Submit a pull request! Navigate to Pull Requests and click the 'New Pull Request' button. Fill in some
   details about your potential patch including a meaningful title. When finished, press "Send pull request". The core team will be notified about your submission and let you know of any problems or targeted release date.


## Publishing a new version

1. Check integration.
2. `npm run release:pre` (this will be patch after 3.0.0).
