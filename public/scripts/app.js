'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* eslint-disable no-console */
function liftoff() {
  var seconds = 3;

  var countdown = function countdown(resolve) {
    if (seconds === 0) {
      return resolve();
    }
    console.log(seconds--);
    return setTimeout(function () {
      countdown(resolve);
    }, 1000);
  };

  function doTheCountdown() {
    return new Promise(function (resolve) {
      countdown(resolve);
    });
  }

  doTheCountdown().then(function () {
    var _console;

    (_console = console).log.apply(_console, _toConsumableArray('We have LIFTOFF!'));
  });
}

liftoff();
//# sourceMappingURL=app.js.map
