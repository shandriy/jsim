window.Vector2d = (function() {
  var Vector2d = function(x, y) {
    if (typeof x !== "number") {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x || 0;
      this.y = y || 0;
    }
  }

  Vector2d.prototype = {
    magnitude: function(set) {
      var magnitude = Math.sqrt(this.x * this.x + this.y * this.y);

      if (set === undefined)
        return magnitude;

      this.x /= magnitude / set;
      this.y /= magnitude / set;

      if (isNaN(this.x))
        this.x = 0;
      if (isNaN(this.y))
        this.y = 0;

      return set;
    },
    normalize: function() {
      var divisor = Math.sqrt(this.x * this.x + this.y * this.y);

      this.x /= divisor;
      this.y /= divisor;

      if (isNaN(this.x))
        this.x = 0;
      if (isNaN(this.y))
        this.y = 0;
    },
    scale: function(scale) {
      this.x *= scale;
      this.y *= scale;
    },
    set: function(x, y) {
      this.x = x;
      this.y = y;
    }
  }

  return Vector2d;
})();
