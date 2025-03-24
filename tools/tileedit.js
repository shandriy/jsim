(function() {
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");

  var input = document.getElementById("input");
  var output = document.getElementById("output");
  var format = document.getElementById("format");

  function clear() {
    context.fillStyle = "#fff";
    context.strokeStyle = "#aaa";
    context.lineWidth = 0.5;

    context.fillRect(0, 0, 128, 128);

    context.beginPath();

    for (var i = 0; i < 17; i++) {
      context.moveTo(0, i * 8);
      context.lineTo(128, i * 8);
      context.moveTo(i * 8, 0);
      context.lineTo(i * 8, 128);
    }

    context.stroke();
    context.closePath();

    context.strokeStyle = "#000";

    context.beginPath();

    context.moveTo(64, 64 - 4)
    context.lineTo(64, 64 + 4);
    context.moveTo(64 - 4, 64)
    context.lineTo(64 + 4, 64);

    context.stroke();
    context.closePath();
  }
  function collider(encoded) {
    var elem = encoded.substring(1, encoded.length - 1).split(",")

    context.strokeStyle = "#00f";
    context.lineWidth = 2;

    context.beginPath();

    var j = 0;

    for (var i = 0; i < Math.floor(elem.length / 4); i++) {
      context.moveTo(elem[i * 4 + 0] * 8, elem[i * 4 + 1] * 8);
      context.lineTo(elem[i * 4 + 2] * 8, elem[i * 4 + 3] * 8);
      j = i;
    }

    context.stroke();
    context.closePath();

    context.fillStyle = "#f00";
    context.fillRect(elem[j * 4 + 2] * 8 - 2, elem[j * 4 + 3] * 8 - 2, 4, 4);
  }

  function encode(string) {
    var coords = [];
    var counter = 0;

    string.replace(/-?\d\d?/g, function(match) {
      coords.push(counter % 2 === 0 ? parseInt(match) + 8 : -parseInt(match) + 8);

      counter++;
    });

    return "[" + coords.toString() + "]";
  }

  function decode(string) {
    var out = "";
    var coords = string.substring(1, string.length - 1).split(",");

    for (var i = 0; i < Math.floor(coords.length / 4); i++) {
      out +=
        "from " +
        (parseInt(coords[i * 4 + 0]) - 8) +
        " " + (-parseInt(coords[i * 4 + 1]) + 8) +
        " to " + (parseInt(coords[i * 4 + 2]) - 8) +
        " " + (-parseInt(coords[i * 4 + 3]) + 8) + "\n";
    }

    return out;
  }

  input.onkeyup = function() {
    output.value = encode(input.value);
    clear();
    collider(output.value);
  }
  output.onkeyup = function() {
    input.value = decode(output.value);
    clear();
    collider(output.value);
  }

  format.onclick = function() {
    input.value = decode(output.value);
  }

  clear();
  collider(output.value);

})();
