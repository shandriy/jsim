window.KeyListener = (function() {
  var KeyListener = function() {
    var _this = this;

    _this.keysDown = [];

    function addKey(code, callback) {
      if (_this.keysDown.indexOf(code) === -1) {
        _this.keysDown.push(code);

        if (callback !== undefined) {
          callback(code, "keydown");
        }
      }
    }
    function removeKey(code, callback) {
      var index = _this.keysDown.indexOf(code);

      if (index > -1) {
        _this.keysDown.splice(index, 1);

        if (callback !== undefined) {
          callback(code, "keyup");
        }
      }
    }

    _this.addListener = function(target, keys, callback) {
      var _keys = keys;
      var _callback = callback;

      if (typeof keys === "function") {
        _callback = keys;
        _keys = undefined;
      }
      if (typeof _keys === "string") {
        _keys = [ _keys ];
      }

      function keydownListener(event) {
        var code = event.code;

        if (_keys === undefined) {
          addKey(code, _callback);
          return;
        }

        if (_keys.indexOf(code) > -1) {
          addKey(code, _callback);
        }
      }
      function keyupListener(event) {
        var code = event.code;

        if (_keys === undefined) {
          removeKey(code, _callback);
          return;
        }

        if (_keys.indexOf(code) > -1) {
          removeKey(code, _callback);
        }
      }

      target.addEventListener("keydown", keydownListener);
      target.addEventListener("keyup", keyupListener);

      return [keydownListener, keyupListener];
    }
    _this.removeListener = function(target, keydownListener, keyupListener) {
      target.removeEventListener("keydown", keydownListener);
      target.removeEventListener("keyup", keyupListener);
    }
  };

  KeyListener.prototype = {
    keyDown: function(code) {
      return this.keysDown.indexOf(code) > -1;
    },
    keyUp: function() {
      return this.keysDown.indexOf(code) === -1;
    }
  };

  return KeyListener;
})();
