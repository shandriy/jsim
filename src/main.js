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

  var colliders = [
    [0, 0, 480, 360],
    [240, 180, 480, 180]
  ]

  var player = {
    x: 0,
    y: 0,
    width: 20,
    height: 20
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

    context.fillStyle = "#f00";

    var corner1x = player.x + player.width / 2;
    var corner1y = player.y + player.height / 2;
    var corner2x = player.x - player.width / 2;
    var corner2y = player.y + player.height / 2;
    var corner3x = player.x - player.width / 2;
    var corner3y = player.y - player.height / 2;
    var corner4x = player.x + player.width / 2;
    var corner4y = player.y - player.height / 2;

    for (var i = 0; i < colliders.length; i++) {
      colliders[i][0], colliders[i][1];
      colliders[i][2], colliders[i][3];

      if (
        utils.segmentsIntersect(corner1x, corner1y, corner2x, corner2y, colliders[i][0], colliders[i][1], colliders[i][2], colliders[i][3]) ||
        utils.segmentsIntersect(corner2x, corner2y, corner3x, corner3y, colliders[i][0], colliders[i][1], colliders[i][2], colliders[i][3]) ||
        utils.segmentsIntersect(corner3x, corner3y, corner4x, corner4y, colliders[i][0], colliders[i][1], colliders[i][2], colliders[i][3]) ||
        utils.segmentsIntersect(corner4x, corner4y, corner1x, corner1y, colliders[i][0], colliders[i][1], colliders[i][2], colliders[i][3])
      ) {
        context.fillStyle = "#ff0";
        break;
      }
    }

    context.fillRect(
      unit(player.x - player.width / 2),
      unit(player.y - player.height / 2),
      unit(player.width),
      unit(player.height)
    );

    context.lineWidth = unit(2);
    context.strokeStyle = "#000";

    context.beginPath();

    for (var i = 0; i < colliders.length; i++) {
      context.moveTo(unit(colliders[i][0]), unit(colliders[i][1]));
      context.lineTo(unit(colliders[i][2]), unit(colliders[i][3]));
    }

    context.stroke();
    context.closePath();

    context.translate(-translationX, -translationY);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
