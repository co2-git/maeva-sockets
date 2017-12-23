'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var printHours = function printHours(date) {
  var hours = date.getHours();
  if (hours < 10) {
    return '0' + hours;
  }
  return hours.toString();
};

var printMinutes = function printMinutes(date) {
  var minutes = date.getMinutes();
  if (minutes < 10) {
    return '0' + minutes;
  }
  return minutes.toString();
};

var printSeconds = function printSeconds(date) {
  var seconds = date.getSeconds();
  if (seconds < 10) {
    return '0' + seconds;
  }
  return seconds.toString();
};

var log = exports.log = function log(message, from, debug) {
  var tab = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var now = new Date();
  var _from = void 0;
  if (from === 'server') {
    _from = 'SERVER';
  } else if (from === '?') {
    _from = 'CLIENT -new-';
  } else {
    _from = 'CLIENT #' + from;
  }
  console.log(_from, printHours(now) + ':' + printMinutes(now) + ':' + printSeconds(now), message, JSON.stringify(debug, null, tab));
};