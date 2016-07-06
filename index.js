'use strict'

var toArray = require('to-array')

var LAZY_METHODS = [
  'get',
  'set',
  'call',
  'invalidate',
  'getValue',
  'setLocal',
  'falcorModel'
]

var customMethods = {
  // These are called with `this` set to the falcorModel instance
  setLocal: function setLocal () {
    var localModel = this.withoutDataSource()
    return localModel.set.apply(localModel, arguments)
  },
  falcorModel: function falcorModel () {
    return this
  }
}

function noop () {}

module.exports = FalcorAsync

function FalcorAsync (getModel) {
  var falcorModel
  var listeners = []

  getModel(onInstantiate)

  return LAZY_METHODS.reduce(function reduceMethods (acc, methodName) {
    acc[methodName] = wrapMethod(methodName)
    return acc
  }, {})

  function onInstantiate (model) {
    falcorModel = model

    listeners.forEach(function callQueuedMethods (data) {
      runMethod(data[0], data[1])
    })
    listeners = []
  }

  function wrapMethod (methodName) {
    return function wrapped () {
      var args = toArray(arguments)

      if (!falcorModel) {
        listeners.push([methodName, args])
      } else {
        runMethod(methodName, args)
      }
    }
  }

  function runMethod (methodName, args) {
    var callback = typeof args[args.length - 1] === 'function'
      ? args.pop()
      : noop

    var method = customMethods[methodName] || falcorModel[methodName]
    var result = method.apply(falcorModel, args)

    if (result && typeof result.then === 'function') {
      result
        .then(function then (value) {
          callback(null, value)
        })
        .catch(callback)
    } else {
      callback(null, result)
    }
  }
}
