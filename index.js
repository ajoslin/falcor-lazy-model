'use strict'

var toArray = require('to-array')

function noop () {}

var LAZY_METHODS = [
  'get',
  'set',
  'call',
  'invalidate',
  'getCache',
  'getValue',
  'setLocal',
  'getLocal',
  'falcorModel',
  'deref'
]

var customMethods = {
  // These are called with `this` set to the falcorModel instance
  setLocal: function setLocal () {
    var localModel = this.withoutDataSource().unbatch()
    return localModel.set.apply(localModel, arguments)
  },
  getLocal: function getLocal () {
    var localModel = this.withoutDataSource().unbatch()
    return localModel.get.apply(localModel, arguments)
  },
  falcorModel: function falcorModel () {
    return this
  }
}

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
    var called = false

    var method = customMethods[methodName] || falcorModel[methodName]
    var result = method.apply(falcorModel, args)

    if (result && typeof result.subscribe === 'function') {
      result.subscribe(
        function onData (value) {
          called = true
          callback(null, value)
        },
        function onError (error) {
          called = true
          callback(error)
        },
        function onComplete () {
          if (called) return
          callback(null, undefined)
        }
      )
    } else {
      callback(null, result)
    }
  }
}
