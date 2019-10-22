/*
 * @namespace Util
 *
 * Various utility functions, used by Leaflet internally.
 */

// @function extend(dest: Object, src?: Object): Object
// Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
export function extend(dest) {
  var i, j, len, src

  for (j = 1, len = arguments.length; j < len; j++) {
    src = arguments[j]
    for (i in src) {
      dest[i] = src[i]
    }
  }
  return dest
}

// @function create(proto: Object, properties?: Object): Object
// Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
export var create =
  Object.create ||
  (function() {
    function F() {}

    return function(proto) {
      F.prototype = proto
      return new F()
    }
  })()

// @function bind(fn: Function, …): Function
// Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
// Has a `L.bind()` shortcut.
export function bind(fn, obj) {
  var slice = Array.prototype.slice

  if (fn.bind) {
    return fn.bind.apply(fn, slice.call(arguments, 1))
  }

  var args = slice.call(arguments, 2)

  return function() {
    return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments)
  }
}

// @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
// Returns the number `num` modulo `range` in such a way so it lies within
// `range[0]` and `range[1]`. The returned value will be always smaller than
// `range[1]` unless `includeMax` is set to `true`.
export function wrapNum(x, range, includeMax) {
  var max = range[1],
    min = range[0],
    d = max - min
  return x === max && includeMax ? x : ((((x - min) % d) + d) % d) + min
}

// @function formatNum(num: Number, digits?: Number): Number
// Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
export function formatNum(num, digits) {
  var pow = Math.pow(10, digits === undefined ? 6 : digits)
  return Math.round(num * pow) / pow
}

// @function trim(str: String): String
// Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
export function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '')
}

var templateRe = /\{ *([\w_-]+) *\}/g

// @function template(str: String, data: Object): String
// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
// `('Hello foo, bar')`. You can also specify functions instead of strings for
// data values — they will be evaluated passing `data` as an argument.
export function template(str, data) {
  return str.replace(templateRe, function(str, key) {
    var value = data[key]

    if (value === undefined) {
      throw new Error('No value provided for variable ' + str)
    } else if (typeof value === 'function') {
      value = value(data)
    }
    return value
  })
}

// @function isArray(obj): Boolean
// Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
export var isArray =
  Array.isArray ||
  function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
  }
