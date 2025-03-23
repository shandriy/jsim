window.Thread = (function() {
  var Thread = function(fps, callback) {
    var startTime, running, cycles;

    function timeout() {
      if (!running) {
        return;
      }

      var now = Date.now();
      var timeDifference = now - startTime;
      var correctCycles = Math.round(timeDifference * fps / 1000);

      for (; cycles < correctCycles; cycles++) {
        callback(1000 / fps);
      }

      setTimeout(timeout, (1000 * ((correctCycles + 1) / fps)) - timeDifference - 1);
    }

    this.start = function() {
      startTime = Date.now();
      running = true;
      cycles = 0;

      timeout();
    }
    this.end = function() {
      running = false;
    }
  }

  return Thread;
})();
