# falcor-lazy-model [![Build Status](https://travis-ci.org/ajoslin/falcor-lazy-model.svg?branch=master)](https://travis-ci.org/ajoslin/falcor-lazy-model)

> Call falcor methods before a falcor model is created

## Install

```
$ npm install --save falcor-lazy-model
```


## Usage

```js
var LazyModel = require('falcor-lazy-model')
var FalcorModel = require('falcor').Model

var model = LazyModel(function getModel (callback) {
  // wait until auth is done, and then...
  callback(new FalcorModel({
    //..options
  })
})

model.get(['foo', 'bar'], ['baz', 'bang'], function (error, data) {
  // methods will be queued until the model is actually loaded
})
```

## API

#### `LazyModel(function getModel)` -> `asyncModel`

##### getModel

*Required*
Type: `function`

A function which takes a callback. Call the callback with `(error, falcorModel)`.

#### `asyncModel`

Returned from LazyModel constructor. Has methods `get`, `set`, `call`, `invalidate`, `getValue`.

All of these take the normal arguments, with one exception: they don't return promises, instead they accept an additional `(error, data)` callback at the end.

## License

MIT © [Andrew Joslin](http://ajoslin.com)
