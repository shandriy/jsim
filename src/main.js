(function() {
  var utils = Utilities;

  var keyboard = new KeyListener();
  keyboard.addListener(window);

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d", { alpha: false });

  function canvasResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", canvasResize);
  window.addEventListener("focus", canvasResize);
  canvasResize();

  document.addEventListener("DOMContentLoaded", function() {
    document.body.appendChild(canvas);
  })

  var unitWidth = 480;
  var unitHeight = 360;

  function unit(unit) {
    if (canvas.width / canvas.height < unitWidth / unitHeight) {
      return (canvas.width / unitWidth) * unit;
    } else {
      return (canvas.height / unitHeight) * unit;
    }
  }

  var colliders = map.map(function(elem) {
    var tile = tiles[elem[0]];

    return [
      tile[0] + elem[1] * 16,
      tile[1] + elem[2] * 16,
      tile[2] + elem[1] * 16,
      tile[3] + elem[2] * 16
    ];
  });

  var player = {
    x: 8,
    y: 8,
    width: 14,
    height: 14
  }

  var movementVec = new Vector2d(0, 0);

  var thread = new Thread(60, function(delta) {
    delta /= 16 + 2 / 3;

    movementVec.set(0, 0);

    if (keyboard.keyDown("KeyW") || keyboard.keyDown("ArrowUp"))
      movementVec.y -= 1;
    if (keyboard.keyDown("KeyS") || keyboard.keyDown("ArrowDown"))
      movementVec.y += 1;
    if (keyboard.keyDown("KeyA") || keyboard.keyDown("ArrowLeft"))
      movementVec.x -= 1;
    if (keyboard.keyDown("KeyD") || keyboard.keyDown("ArrowRight"))
      movementVec.x += 1;

    movementVec.normalize();

    var multiplier = 1;
    if (keyboard.keyDown("ShiftLeft") || keyboard.keyDown("ShiftRight"))
      multiplier *= 3;

    movementVec.scale(multiplier * delta)

    var playerLength = Math.sqrt(player.width * player.width + player.height * player.height);
    var elimRadius = movementVec.magnitude() + playerLength;

    var possibleColliders = colliders.filter(function(elem) {
      return (
        elem[0] === elem[2] ?
          elem[0] > player.x - elimRadius && elem[0] < player.x + elimRadius &&
          (elem[1] > player.y - elimRadius || elem[3] > player.y - elimRadius) &&
          (elem[1] < player.y + elimRadius || elem[3] < player.y + elimRadius)
        :
          elem[1] > player.y - elimRadius && elem[1] < player.y + elimRadius &&
          (elem[0] > player.x - elimRadius || elem[2] > player.x - elimRadius) &&
          (elem[0] < player.x + elimRadius || elem[2] < player.x + elimRadius)
      );
    });

    var i = 0;

    while (i < 20) {
      i++;

      var top = player.y + movementVec.y - player.height / 2;
      var left = player.x + movementVec.x - player.width / 2;
      var right = player.x + movementVec.x + player.width / 2;
      var bottom = player.y + movementVec.y + player.height / 2;

      var colliding = possibleColliders.filter(function(elem) {
        return (
          elem[0] === elem[2] ?
            movementVec.x !== 0 &&
            elem[0] > left && elem[0] < right &&
            (
              (
                (top > Math.min(elem[1], elem[3]) && top < Math.max(elem[1], elem[3])) ||
                (bottom > Math.min(elem[1], elem[3]) && bottom < Math.max(elem[1], elem[3]))
              ) ||
              (
                top <= elem[1] && bottom >= elem[1] &&
                top <= elem[3] && bottom >= elem[3] &&
                left <= elem[0] && right >= elem[0] &&
                left <= elem[2] && right >= elem[2]
              )
            )
          :
            movementVec.y !== 0 &&
            elem[1] > top && elem[1] < bottom &&
            (
              (
                (left > Math.min(elem[0], elem[2]) && left < Math.max(elem[0], elem[2])) ||
                (right > Math.min(elem[0], elem[2]) && right < Math.max(elem[0], elem[2]))
              ) ||
              (
                top <= elem[1] && bottom >= elem[1] &&
                top <= elem[3] && bottom >= elem[3] &&
                left <= elem[0] && right >= elem[0] &&
                left <= elem[2] && right >= elem[2]
              )
            )
        );
      });

      if (colliding.length === 0) break;

      colliding.sort(function(a, b) {
        var distancea = 0
        var distanceb = 0;

        if (a[0] === a[2]) {
          if (player.y < Math.min(a[1], a[3]))
            distancea = Math.abs(Math.min(a[1], a[3]) - player.y);
          if (player.y > Math.max(a[1], a[3]))
            distancea = Math.abs(Math.max(a[1], a[3]) - player.y);

          distancea /= player.height;
        } else {
          if (player.x < Math.min(a[0], a[2]))
            distancea = Math.abs(Math.min(a[0], a[2]) - player.x);
          if (player.x > Math.max(a[0], a[2]))
            distancea = Math.abs(Math.max(a[0], a[2]) - player.x);

          distancea /= player.width;
        }

        if (b[0] === b[2]) {
          if (player.y < Math.min(b[1], b[3]))
            distanceb = Math.abs(Math.min(b[1], b[3]) - player.y);
          if (player.y > Math.max(b[1], b[3]))
            distanceb = Math.abs(Math.max(b[1], b[3]) - player.y);

          distanceb /= player.height;
        } else {
          if (player.x < Math.min(b[0], b[2]))
            distanceb = Math.abs(Math.min(b[0], b[2]) - player.x);
          if (player.x > Math.max(b[0], b[2]))
            distanceb = Math.abs(Math.max(b[0], b[2]) - player.x);

          distanceb /= player.width;
        }

        return distancea - distanceb;
      })

      for (var j = 0; j < colliding.length; j++) {
        var elem = colliding[j];

        if (elem[0] === elem[2]) {
          var farthest = Math.abs(player.x - left) > Math.abs(player.x - right) ? left : right;

          if (elem[0] - farthest === 0) continue;
          movementVec.x += elem[0] - farthest;
        } else {
          var farthest = Math.abs(player.y - top) > Math.abs(player.y - bottom) ? top : bottom;

          if (elem[1] - farthest === 0) continue;
          movementVec.y += elem[1] - farthest;
        }

        break;
      }
    }

    player.x += movementVec.x;
    player.y += movementVec.y;
  })
  thread.start();

  function frame() {
    var translationX = 0;
    var translationY = 0;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (canvas.width / canvas.height < unitWidth / unitHeight) {
      translationY = canvas.height / 2 - unit(unitHeight / 2);
    } else {
      translationX = canvas.width / 2 - unit(unitWidth / 2);
    }
    context.translate(translationX, translationY);

    context.fillStyle = "#fff";
    context.fillRect(unit(0), unit(0), unit(unitWidth), unit(unitHeight));

    context.translate(-unit(player.x) + unit(240), -unit(player.y) + unit(180));

    context.fillStyle = "#f00";

    context.fillRect(
      unit(player.x - player.width / 2),
      unit(player.y - player.height / 2),
      unit(player.width),
      unit(player.height)
    );

    context.lineWidth = unit(2);
    context.strokeStyle = "#00f";

    context.beginPath();

    for (var i = 0; i < colliders.length; i++) {
      context.moveTo(unit(colliders[i][0]), unit(colliders[i][1]));
      context.lineTo(unit(colliders[i][2]), unit(colliders[i][3]));
    }

    context.stroke();
    context.closePath();

    context.translate(unit(player.x) - unit(240), unit(player.y) - unit(180));
    context.translate(-translationX, -translationY);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
