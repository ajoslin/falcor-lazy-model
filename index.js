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

  getModel(function onModel (model) {
    falcorModel = model

    listeners.forEach(function (data) {
      runMethod(data[0], data[1])
    })
    listeners.length = 0
  })

  return LAZY_METHODS.reduce(reduceMethod, {})

  function reduceMethod (acc, methodName) {
    acc[methodName] = function method () {
      var args = toArray(arguments)

      if (!falcorModel) {
        listeners.push([methodName, args])
      } else {
        runMethod(methodName, args)
      }
    }

    return acc
  }

  function runMethod (methodName, args) {
    var callback = callbackFromArgs(args)

    var fn = customMethods[methodName] || falcorModel[methodName]
    var result = fn.apply(falcorModel, args)

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

function callbackFromArgs (args) {
  return typeof args[args.length - 1] === 'function'
    ? args.pop()
    : noop
}
