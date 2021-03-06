# serialized lru cache

A cache object that deletes the least-recently-used items, with serialization support.

This is a fork of the wonderful [@isaacs](https://github.com/isaacs) [node-lru-cache](https://github.com/isaacs/node-lru-cache) with several improvements
 * [Serialization support](https://github.com/isaacs/node-lru-cache/pull/40)
 * [Bug](https://github.com/isaacs/node-lru-cache/issues/41) [fixes](https://github.com/isaacs/node-lru-cache/issues/33)
 * Bower support

## Install
Get it from [npm](https://www.npmjs.com/)
```sh
npm install serialized-lru-cache
```
```js
var LRUCache = require("lru-cache");
var cache = LRUCache(options);
```

or from [bower](http://bower.io/)
```sh
bower install serialized-lru-cache
```
```html
<script type="text/javascript" src="bower_components/serialized-lru-cache/lib/lru-cache.js"></script>
<script type="text/javascript">
  var cache = window.LRUCache(options);
</script>
```

## Usage:

```javascript
var LRU = require("lru-cache")
  , options = { max: 500
              , length: function (n, key) { return n.length * 2 + key.length }
              , dispose: function (key, n) { n.close() }
              , maxAge: 1000 * 60 * 60 }
  , cache = LRU(options)
  , otherCache = LRU(50) // sets just the max size

cache.set("key", "value")
cache.get("key") // "value"

cache.reset()    // empty the cache
```

If you put more stuff in it, then items will fall out.

If you try to put an oversized thing in it, then it'll fall out right
away.

You can save the current cache and load its entries in another cache instantiated with other options 

```javascript
var LRU = require("lru-cache")
  , fs = require("fs")
  , cache = LRU( {max: 500, maxAge: 60000})
  , otherCache = LRU(50) // sets just the max size

cache.set("key", "value")
fs.writeFileSync("dump.json", JSON.stringify(cache));
otherCache.load(require("dump.json"));
```

## Options

* `max` The maximum size of the cache, checked by applying the length
  function to all values in the cache.  Not setting this is kind of
  silly, since that's the whole purpose of this lib, but it defaults
  to `Infinity`.
* `maxAge` Maximum age in ms.  Items are not pro-actively pruned out
  as they age, but if you try to get an item that is too old, it'll
  drop it and return undefined instead of giving it to you.
* `length` Function that is used to calculate the length of stored
  items.  If you're storing strings or buffers, then you probably want
  to do something like `function(v, k){return v.length}`.  The default is
  `function(n){return 1}`, which is fine if you want to store `n`
  like-sized things.
* `dispose` Function that is called on items when they are dropped
  from the cache.  This can be handy if you want to close file
  descriptors or do other cleanup tasks when items are no longer
  accessible.  Called with `key, value`.  It's called *before*
  actually removing the item from the internal cache, so if you want
  to immediately put it back in, you'll have to do that in a
  `nextTick` or `setTimeout` callback or it won't do anything.
* `stale` By default, if you set a `maxAge`, it'll only actually pull
  stale items out of the cache when you `get(key)`.  (That is, it's
  not pre-emptively doing a `setTimeout` or anything.)  If you set
  `stale:true`, it'll return the stale value before deleting it.  If
  you don't set this, then it'll return `undefined` when you try to
  get a stale entry, as if it had already been deleted.

## API

* `set(key, value)`
* `get(key) => value`

    Both of these will update the "recently used"-ness of the key.
    They do what you think.

* `peek(key)`

    Returns the key value (or `undefined` if not found) without
    updating the "recently used"-ness of the key.

    (If you find yourself using this a lot, you *might* be using the
    wrong sort of data structure, but there are some use cases where
    it's handy.)

* `del(key)`

    Deletes a key out of the cache.

* `reset()`

    Clear the cache entirely, throwing away all values.

* `has(key)`

    Check if a key is in the cache, without updating the recent-ness
    or deleting it for being stale.

* `forEach(function(value,key,cache), [thisp])`

    Just like `Array.prototype.forEach`.  Iterates over all the keys
    in the cache, in order of recent-ness.  (Ie, more recently used
    items are iterated over first.)

* `keys()`

    Return an array of the keys in the cache.

* `values()`

    Return an array of the values in the cache.

* `toJSON()`

    Return an array of the cache entries ready for serialization.

* `load(cacheEntriesArray)`

    Loads another cache entries array, obtained with `sourceCache.toJSON()`, into the cache. The destination cache
    is reset before loading the new entries

