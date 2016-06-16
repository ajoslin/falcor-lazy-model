# falcor-async [![Build Status](https://travis-ci.org/ajoslin/falcor-async.svg?branch=master)](https://travis-ci.org/ajoslin/falcor-async)

> Call falcor methods before a falcor model is created

## Install

```
$ npm install --save falcor-async
```


## Usage

```js
var FalcorAsync = require('falcor-async')

var model = FalcorAsync(function getModel (callback) {
  // wait until auth is done, and then...
  callback(null, new require('falcor').Model({
    //..options
  })
})

model.get(['foo', 'bar'], ['baz', 'bang'], function (error, data) {
  // methods will be queued until the model is actually loaded
})
```

## API

#### `FalcorAsync(function getModel)` -> `asyncModel`

##### getModel

*Required*
Type: `function`

A function which takes a callback. Call the callback with `(error, falcorModel)`.

#### `asyncModel`

Returned from FalcorAsync constructor. Has methods `get`, `set`, `call`, `invalidate`, `getValue`, `onPathChange`.

All of these take the normal arguments, with one exception: they don't return promises, instead they accept an additional `(error, data)` callback at the end.

## License

MIT © [Andrew Joslin](http://ajoslin.com)
