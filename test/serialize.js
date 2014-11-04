var test = require('tap').test
var LRU = require('../')

test('toJSON', function (t) {
  var cache = new LRU()

  cache.set("a", "A")
  cache.set("b", "B")
  t.deepEqual(cache.toJSON(), [
    { k: "b", v: "B", n: 0 },
    { k: "a", v: "A", n: 0 }
  ])

  cache.set("a", "A");
  t.deepEqual(cache.toJSON(), [
    { k: "a", v: "A", n: 0 },
    { k: "b", v: "B", n: 0 }
  ])

  cache.get("b");
  t.deepEqual(cache.toJSON(), [
    { k: "b", v: "B", n: 0 },
    { k: "a", v: "A", n: 0 }
  ])

  cache.del("a");
  t.deepEqual(cache.toJSON(), [
    { k: "b", v: "B",  n: 0 }
  ])

  t.end()
})


test("not serialize old items", function(t) {
  var cache = new LRU({
    max: 5,
    maxAge: 50
  })

  //expires at 50
  cache.set("a", "A")

  setTimeout(function () {
    //expires at 75
    cache.set("b", "B")
    var s = cache.toJSON()
    t.equal(s[0].k, "b")
    t.equal(s[1].k, "a")
  }, 25)

  setTimeout(function () {
    //expires at 110
    cache.set("c", "C")
    var s = cache.toJSON()
    t.equal(s[0].k, "c")
    t.equal(s[1].k, "b")
  }, 60)

  setTimeout(function () {
    var s = cache.toJSON()
    t.equal(s[0].k, "c")
  }, 90)

  setTimeout(function () {
    var s = cache.toJSON()
    t.deepEqual(s, [])
    t.end()
  }, 155)
})

