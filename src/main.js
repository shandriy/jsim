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
    [0, 0, 50, 50],
    [50, 50, 100, 50],
    [100, 50, 100, 100]
  ]

  var player = {
    x: 0,
    y: 40,
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

    var playerLength = Math.sqrt(player.width * player.width + player.height * player.height);

    var validCol = colliders.filter(function(elem) {
      var cx = player.x;
      var cy = player.y
      var r = movementVec.magnitude() + playerLength;

      var top = elem[1] < elem[3] ? elem[1] : elem[3];
      var left = elem[0] < elem[2] ? elem[0] : elem[2];
      var right = elem[0] < elem[2] ? elem[2] : elem[1];
      var bottom = elem[1] < elem[3] ? elem[3] : elem[1];

      var closestX = (cx < left ? left : (cx > right ? right : cx));
      var closestY = (cy < top ? top : (cy > bottom ? bottom : cy));
      var dx = closestX - cx;
      var dy = closestY - cy;

      return ( dx * dx + dy * dy ) <= r * r;
    });

    var playerOriginx = player.x;
    var playerOriginy = player.y;

    player.x += movementVec.x;
    player.y += movementVec.y;

    var corner1x = player.x + player.width / 2;
    var corner1y = player.y + player.height / 2;
    var corner2x = player.x - player.width / 2;
    var corner2y = player.y + player.height / 2;
    var corner3x = player.x - player.width / 2;
    var corner3y = player.y - player.height / 2;
    var corner4x = player.x + player.width / 2;
    var corner4y = player.y - player.height / 2;

    var collided = [];

    for (var i = 0; i < validCol.length; i++) {
      if (
        utils.segmentsIntersect(corner1x, corner1y, corner2x, corner2y, validCol[i][0], validCol[i][1], validCol[i][2], validCol[i][3]) ||
        utils.segmentsIntersect(corner2x, corner2y, corner3x, corner3y, validCol[i][0], validCol[i][1], validCol[i][2], validCol[i][3]) ||
        utils.segmentsIntersect(corner3x, corner3y, corner4x, corner4y, validCol[i][0], validCol[i][1], validCol[i][2], validCol[i][3]) ||
        utils.segmentsIntersect(corner4x, corner4y, corner1x, corner1y, validCol[i][0], validCol[i][1], validCol[i][2], validCol[i][3])
      ) {
        collided.push(validCol[i]);
      }
    }

    collided.sort(function(a, b) {
      var side1a = utils.segmentsIntersect(corner1x, corner1y, corner2x, corner2y, a[0], a[1], a[2], a[3]);
      var side2a = utils.segmentsIntersect(corner2x, corner2y, corner3x, corner3y, a[0], a[1], a[2], a[3]);
      var side3a = utils.segmentsIntersect(corner3x, corner3y, corner4x, corner4y, a[0], a[1], a[2], a[3]);
      var side4a = utils.segmentsIntersect(corner4x, corner4y, corner1x, corner1y, a[0], a[1], a[2], a[3]);
      var side1b = utils.segmentsIntersect(corner1x, corner1y, corner2x, corner2y, b[0], b[1], b[2], b[3]);
      var side2b = utils.segmentsIntersect(corner2x, corner2y, corner3x, corner3y, b[0], b[1], b[2], b[3]);
      var side3b = utils.segmentsIntersect(corner3x, corner3y, corner4x, corner4y, b[0], b[1], b[2], b[3]);
      var side4b = utils.segmentsIntersect(corner4x, corner4y, corner1x, corner1y, b[0], b[1], b[2], b[3]);

      var shortesta = Infinity;
      var shortestb = Infinity;

      side1a && (shortesta = Math.min(Math.sqrt((playerOriginx - side1a[0]) ** 2 + (playerOriginy - side1a[1]) ** 2), shortesta));
      side2a && (shortesta = Math.min(Math.sqrt((playerOriginx - side2a[0]) ** 2 + (playerOriginy - side2a[1]) ** 2), shortesta));
      side3a && (shortesta = Math.min(Math.sqrt((playerOriginx - side3a[0]) ** 2 + (playerOriginy - side3a[1]) ** 2), shortesta));
      side4a && (shortesta = Math.min(Math.sqrt((playerOriginx - side4a[0]) ** 2 + (playerOriginy - side4a[1]) ** 2), shortesta));
      side1b && (shortestb = Math.min(Math.sqrt((playerOriginx - side1b[0]) ** 2 + (playerOriginy - side1b[1]) ** 2), shortestb));
      side2b && (shortestb = Math.min(Math.sqrt((playerOriginx - side2b[0]) ** 2 + (playerOriginy - side2b[1]) ** 2), shortestb));
      side3b && (shortestb = Math.min(Math.sqrt((playerOriginx - side3b[0]) ** 2 + (playerOriginy - side3b[1]) ** 2), shortestb));
      side4b && (shortestb = Math.min(Math.sqrt((playerOriginx - side4b[0]) ** 2 + (playerOriginy - side4b[1]) ** 2), shortestb));

      return shortesta - shortestb;
    });

    if (collided.length === 0) return;

    for (var j = 0; j < collided.length; j++) {
      var leftOf = utils.leftOfLine(playerOriginx, playerOriginy, collided[j][0], collided[j][1], collided[j][2], collided[j][3]);

      var slope = (collided[j][1] - collided[j][3]) / (collided[j][0] - collided[j][2]);
      slope = 1 / slope;

      var x = isFinite(slope) ? 1 : 0;
      var y = isFinite(slope) ? slope : slope < 0 ? -1 : 1;

      var vec = new Vector2d(x, y);
      vec.normalize();

      var farthest = 0;

      var vecX = vec.x * playerLength;
      var vecY = vec.y * playerLength;

      var corner1Int = utils.segmentsIntersect(corner1x - vecX, corner1y + vecY, corner1x + vecX, corner1y - vecY, collided[j][0], collided[j][1], collided[j][2], collided[j][3]);
      var corner2Int = utils.segmentsIntersect(corner2x - vecX, corner2y + vecY, corner2x + vecX, corner2y - vecY, collided[j][0], collided[j][1], collided[j][2], collided[j][3]);
      var corner3Int = utils.segmentsIntersect(corner3x - vecX, corner3y + vecY, corner3x + vecX, corner3y - vecY, collided[j][0], collided[j][1], collided[j][2], collided[j][3]);
      var corner4Int = utils.segmentsIntersect(corner4x - vecX, corner4y + vecY, corner4x + vecX, corner4y - vecY, collided[j][0], collided[j][1], collided[j][2], collided[j][3]);

      var corner1 = corner1Int ? utils.pointToLine(corner1x, corner1y, collided[j][0], collided[j][1], collided[j][2], collided[j][3]) : 0;
      var corner2 = corner2Int ? utils.pointToLine(corner2x, corner2y, collided[j][0], collided[j][1], collided[j][2], collided[j][3]) : 0;
      var corner3 = corner3Int ? utils.pointToLine(corner3x, corner3y, collided[j][0], collided[j][1], collided[j][2], collided[j][3]) : 0;
      var corner4 = corner4Int ? utils.pointToLine(corner4x, corner4y, collided[j][0], collided[j][1], collided[j][2], collided[j][3]) : 0;

      if (corner1 > farthest && leftOf !== utils.leftOfLine(corner1x, corner1y, collided[j][0], collided[j][1], collided[j][2], collided[j][3])) farthest = corner1;
      if (corner2 > farthest && leftOf !== utils.leftOfLine(corner2x, corner2y, collided[j][0], collided[j][1], collided[j][2], collided[j][3])) farthest = corner2;
      if (corner3 > farthest && leftOf !== utils.leftOfLine(corner3x, corner3y, collided[j][0], collided[j][1], collided[j][2], collided[j][3])) farthest = corner3;
      if (corner4 > farthest && leftOf !== utils.leftOfLine(corner4x, corner4y, collided[j][0], collided[j][1], collided[j][2], collided[j][3])) farthest = corner4;

      vec.scale(farthest);
      vec.y *= -1;

      if (leftOf)
        vec.scale(-1);

      if (vec.x === 0 && vec.y === 0) continue;

      player.x += vec.x;
      player.y += vec.y;
    }
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
