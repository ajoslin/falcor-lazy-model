'use strict'

var Lazy = require('lazy-async')
var dezalgo = require('dezalgo')
var toArray = require('to-array')
var partial = require('ap').partial

var LAZY_METHODS = [
  'get',
  'set',
  'call',
  'invalidate',
  'getValue',
  'setLocal',
  'falcorModel'
]

module.exports = FalcorAsync

function FalcorAsync (getModel) {
  return Lazy(LAZY_METHODS, function lazy (callback) {
    getModel(function (error, falcorModel) {
      if (error) return callback(error)

      callback(null, wrapModel(falcorModel, LAZY_METHODS))
    })
  })
}

function wrapModel (falcorModel, methods) {
  return methods.reduce(function (acc, methodName) {
    if (!acc[methodName]) {
      acc[methodName] = wrapMethod(falcorModel[methodName])
    }
    return acc
  }, {
    falcorModel: wrapMethod(function () {
      return falcorModel
    }),
    setLocal: wrapMethod(setLocal)
  })

  function wrapMethod (method) {
    return function wrapped () {
      var args = toArray(arguments)
      var callback = asyncCallback(args)

      var result = method.apply(falcorModel, args)
      if (result && typeof result.then === 'function') {
        result.then(partial(callback, null)).catch(callback)
      } else {
        callback(null, result)
      }
    }
  }

  function setLocal () {
    var localModel = falcorModel.withoutDataSource()
    return localModel.set.apply(localModel, arguments)
  }
}

function asyncCallback (args) {
  return typeof args[args.length - 1] === 'function'
    ? dezalgo(args.pop())
    : noop
}

function noop () {}
