'use strict'

var test = require('tape')
var FalcorAsync = require('./')
var Event = require('geval/event')
var nextTick = require('next-tick')

test(function (t) {
  var callCount = 0

  var LoadEvent = Event()
  const model = FalcorAsync(function (callback) {
    LoadEvent.listen(function () {
      callback({
        get: function () {
          callCount++
        }
      })
    })
  })

  model.get('foo')
  t.equal(callCount, 0)

  LoadEvent.broadcast()
  nextTick(function () {
    t.equal(callCount, 1)
    model.get('bar')

    nextTick(function () {
      t.equal(callCount, 2)

      t.end()
    })
  })
})

test('promises', function (t) {
  t.plan(4)

  var model = FalcorAsync(function (callback) {
    callback({
      get: function () {
        return Promise.reject('nope')
      },
      set: function () {
        return Promise.resolve('yep')
      }
    })
  })

  model.get(function (error, data) {
    t.equal(error, 'nope')
    t.notOk(data)
  })

  model.set(function (error, data) {
    t.notOk(error)
    t.equal(data, 'yep')
  })
})
