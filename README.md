# webpack-config-rentpath
Shared webpack config across RentPath apps.

## Installation
```bash
$ npm i --save webpack-config-rentpath
```

## Usage
The most minimal usage would be to create a `webpack.config.js` file in the root of your app with the following content:
```javascript
module.exports = require('webpack-config-rentpath').config
```

If your app requires any webpack aliases ([`resolve.alias`](https://webpack.github.io/docs/resolving.html#aliasing)), create a separate file `webpack-alias.config.js` that exports the alias hash. The file will automatically be found and loaded by the base config. For example:

```javascript
module.exports = {
  "gallery": "gallery.js/dist",
  "login": "login/dist",
  "tealium": "tealium/dist/tagging.js"
};
```

If your app requires Babel presets other than `es2015`, make sure to declare them in `.babelrc` in the root of your app. For example:

```json
{ "presets": ["es2015", "react"] }
```

If you require any other customizations, you will need to edit `webpack.config.js` such that it mutates the standard config before exporting it as described below.

### Extended configuration

The config that this package exports is a base config reflecting RentPath's opinions. If your app has special needs, it can mutate the base config. For example:

```javascript
var config = require('webpack-config-rentpath').config

// Add a loader
config.module.loaders.push({ test: /everestjs\/index.js$/, loader: "script-loader" })

// Add a plugin
var webpack = require('webpack')
config.plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/))

module.exports = config
```

If you need to make environment-specific config changes, you can take advantage of the `appEnv` variable that `webpack-config-rentpath` exports in addition to `config`. The value of `appEnv` is a string obtained from the environment variable `APPLICATION_ENVIRONMENT` and defaults to `"production"` if missing. For example:

```javascript
var webpackConfigRentpath = require('webpack-config-rentpath')
var config = webpackConfigRentpath.config
var appEnv = webpackConfigRentpath.appEnv

if(appEnv == 'development') {
  // do some dev stuff
}

if(appEnv != 'development') {
  // do some non-dev stuff
}

if(appEnv == 'production') {
  // do some production stuff
}

module.exports = config
```

## Scripts
* `npm run compile` - Compiles the module to disk (~/lib).
* `npm run compile:watch` - Same as `npm run compile` but watches files for changes.
* `npm run lint` - Lints all files.
* `npm run lint:fix` - Lints all files and attempts to fix any issues.
* `npm run test` - Runs unit tests.
* `npm run test:watch` - Same as `npm test` but watches files for changes.
* `npm run test:cov` - Generates a test coverage report.


## Commitizen
 `webpack-config-rentpath` uses [Commitizen](https://commitizen.github.io/cz-cli/) to format commit messages.
 * Install it globally `$ npm install -g commitizen`
Once you are ready to commit, follow the familiar github workflow, with a slight change.
```
$ git add <files>
$ git cz
```
`git cz` will bring up the Commitizen commit prompt, follow the instructions, and `$ git push` as usual.

This commit message format is used for `semantic-release`.

