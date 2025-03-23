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
    var elimRadius = movementVec.magnitude() + playerLength;

    var possibleColliders = colliders.filter(function(elem) {
      var cx = player.x;
      var cy = player.y;
      var r = elimRadius;

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

    var i = 0;

    while (true) {
      i++;

      var corner1x = player.x + movementVec.x + player.width / 2;
      var corner1y = player.y + movementVec.y - player.height / 2;
      var corner2x = player.x + movementVec.x - player.width / 2;
      var corner2y = player.y + movementVec.y - player.height / 2;
      var corner3x = player.x + movementVec.x - player.width / 2;
      var corner3y = player.y + movementVec.y + player.height / 2;
      var corner4x = player.x + movementVec.x + player.width / 2;
      var corner4y = player.y + movementVec.y + player.height / 2;

      var colliding = possibleColliders.filter(function(elem) {
        return (
          utils.segmentsIntersect(corner1x, corner1y, corner2x, corner2y, elem[0], elem[1], elem[2], elem[3]) ||
          utils.segmentsIntersect(corner2x, corner2y, corner3x, corner3y, elem[0], elem[1], elem[2], elem[3]) ||
          utils.segmentsIntersect(corner3x, corner3y, corner4x, corner4y, elem[0], elem[1], elem[2], elem[3]) ||
          utils.segmentsIntersect(corner4x, corner4y, corner1x, corner1y, elem[0], elem[1], elem[2], elem[3])
        );
      });

      if (colliding.length === 0) break;

      for (var j = 0; j < colliding.length; j++) {
        var elem = colliding[j];

        var perpMag = Math.sqrt((elem[1] - elem[3]) * (elem[1] - elem[3]) + (elem[0] - elem[2]) * (elem[0] - elem[2]));
        var perpScale = playerLength / perpMag;

        var perp = [
          (elem[1] - elem[3]) * perpScale,
          (elem[2] - elem[0]) * perpScale,
          (elem[3] - elem[1]) * perpScale,
          (elem[0] - elem[2]) * perpScale
        ];

        var largestDistance = 0;
        var leftOf = utils.leftOfLine(player.x, player.y, elem[0], elem[1], elem[2], elem[3]);

        var corner1toLine = utils.pointToLine(corner1x, corner1y, elem[0], elem[1], elem[2], elem[3]);
        var corner2toLine = utils.pointToLine(corner2x, corner2y, elem[0], elem[1], elem[2], elem[3]);
        var corner3toLine = utils.pointToLine(corner3x, corner3y, elem[0], elem[1], elem[2], elem[3]);
        var corner4toLine = utils.pointToLine(corner4x, corner4y, elem[0], elem[1], elem[2], elem[3]);

        corner1toLine = utils.segmentsIntersect(elem[0], elem[1], elem[2], elem[3], perp[0] + corner1x, perp[1] + corner1y, perp[2] + corner1x, perp[3] + corner1y) ? corner1toLine : 0;
        corner2toLine = utils.segmentsIntersect(elem[0], elem[1], elem[2], elem[3], perp[0] + corner2x, perp[1] + corner2y, perp[2] + corner2x, perp[3] + corner2y) ? corner2toLine : 0;
        corner3toLine = utils.segmentsIntersect(elem[0], elem[1], elem[2], elem[3], perp[0] + corner3x, perp[1] + corner3y, perp[2] + corner3x, perp[3] + corner3y) ? corner3toLine : 0;
        corner4toLine = utils.segmentsIntersect(elem[0], elem[1], elem[2], elem[3], perp[0] + corner4x, perp[1] + corner4y, perp[2] + corner4x, perp[3] + corner4y) ? corner4toLine : 0;

        corner1toLine = utils.leftOfLine(corner1x, corner1y, elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner1toLine : 0;
        corner2toLine = utils.leftOfLine(corner2x, corner2y, elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner1toLine : 0;
        corner3toLine = utils.leftOfLine(corner3x, corner3y, elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner1toLine : 0;
        corner4toLine = utils.leftOfLine(corner4x, corner4y, elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner1toLine : 0;

        var corner1toEdge1Int = utils.segmentsIntersect(corner1x, corner1y, corner2x, corner2y, perp[0] + elem[0], perp[1] + elem[1], perp[2] + elem[0], perp[3] + elem[1]);
        var corner1toEdge2Int = utils.segmentsIntersect(corner1x, corner1y, corner2x, corner2y, perp[0] + elem[2], perp[1] + elem[3], perp[2] + elem[2], perp[3] + elem[3]);
        var corner2toEdge1Int = utils.segmentsIntersect(corner2x, corner2y, corner3x, corner3y, perp[0] + elem[0], perp[1] + elem[1], perp[2] + elem[0], perp[3] + elem[1]);
        var corner2toEdge2Int = utils.segmentsIntersect(corner2x, corner2y, corner3x, corner3y, perp[0] + elem[2], perp[1] + elem[3], perp[2] + elem[2], perp[3] + elem[3]);
        var corner3toEdge1Int = utils.segmentsIntersect(corner3x, corner3y, corner4x, corner4y, perp[0] + elem[0], perp[1] + elem[1], perp[2] + elem[0], perp[3] + elem[1]);
        var corner3toEdge2Int = utils.segmentsIntersect(corner3x, corner3y, corner4x, corner4y, perp[0] + elem[2], perp[1] + elem[3], perp[2] + elem[2], perp[3] + elem[3]);
        var corner4toEdge1Int = utils.segmentsIntersect(corner4x, corner4y, corner1x, corner1y, perp[0] + elem[0], perp[1] + elem[1], perp[2] + elem[0], perp[3] + elem[1]);
        var corner4toEdge2Int = utils.segmentsIntersect(corner4x, corner4y, corner1x, corner1y, perp[0] + elem[2], perp[1] + elem[3], perp[2] + elem[2], perp[3] + elem[3]);

        var corner1toEdge1 = corner1toEdge1Int ? utils.pointToLine(corner1toEdge1Int[0], corner1toEdge1Int[1], elem[0], elem[1], elem[2], elem[3]) : 0;
        var corner1toEdge2 = corner1toEdge2Int ? utils.pointToLine(corner1toEdge2Int[0], corner1toEdge2Int[1], elem[0], elem[1], elem[2], elem[3]) : 0;
        var corner2toEdge1 = corner2toEdge1Int ? utils.pointToLine(corner2toEdge1Int[0], corner2toEdge1Int[1], elem[0], elem[1], elem[2], elem[3]) : 0;
        var corner2toEdge2 = corner2toEdge2Int ? utils.pointToLine(corner2toEdge2Int[0], corner2toEdge2Int[1], elem[0], elem[1], elem[2], elem[3]) : 0;
        var corner3toEdge1 = corner3toEdge1Int ? utils.pointToLine(corner3toEdge1Int[0], corner3toEdge1Int[1], elem[0], elem[1], elem[2], elem[3]) : 0;
        var corner3toEdge2 = corner3toEdge2Int ? utils.pointToLine(corner3toEdge2Int[0], corner3toEdge2Int[1], elem[0], elem[1], elem[2], elem[3]) : 0;
        var corner4toEdge1 = corner4toEdge1Int ? utils.pointToLine(corner4toEdge1Int[0], corner4toEdge1Int[1], elem[0], elem[1], elem[2], elem[3]) : 0;
        var corner4toEdge2 = corner4toEdge2Int ? utils.pointToLine(corner4toEdge2Int[0], corner4toEdge2Int[1], elem[0], elem[1], elem[2], elem[3]) : 0;

        corner1toEdge1 = corner1toEdge1Int ? utils.leftOfLine(corner1toEdge1Int[0], corner1toEdge1Int[1], elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner1toEdge1 : 0 : 0;
        corner1toEdge2 = corner1toEdge2Int ? utils.leftOfLine(corner1toEdge2Int[0], corner1toEdge2Int[1], elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner1toEdge2 : 0 : 0;
        corner2toEdge1 = corner2toEdge1Int ? utils.leftOfLine(corner2toEdge1Int[0], corner2toEdge1Int[1], elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner2toEdge1 : 0 : 0;
        corner2toEdge2 = corner2toEdge2Int ? utils.leftOfLine(corner2toEdge2Int[0], corner2toEdge2Int[1], elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner2toEdge2 : 0 : 0;
        corner3toEdge1 = corner3toEdge1Int ? utils.leftOfLine(corner3toEdge1Int[0], corner3toEdge1Int[1], elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner3toEdge1 : 0 : 0;
        corner3toEdge2 = corner3toEdge2Int ? utils.leftOfLine(corner3toEdge2Int[0], corner3toEdge2Int[1], elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner3toEdge2 : 0 : 0;
        corner4toEdge1 = corner4toEdge1Int ? utils.leftOfLine(corner4toEdge1Int[0], corner4toEdge1Int[1], elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner4toEdge1 : 0 : 0;
        corner4toEdge2 = corner4toEdge2Int ? utils.leftOfLine(corner4toEdge2Int[0], corner4toEdge2Int[1], elem[0], elem[1], elem[2], elem[3]) !== leftOf ? corner4toEdge2 : 0 : 0;

        largestDistance = Math.max(largestDistance, corner1toLine);
        largestDistance = Math.max(largestDistance, corner2toLine);
        largestDistance = Math.max(largestDistance, corner3toLine);
        largestDistance = Math.max(largestDistance, corner4toLine);
        largestDistance = Math.max(largestDistance, corner1toEdge1);
        largestDistance = Math.max(largestDistance, corner1toEdge2);
        largestDistance = Math.max(largestDistance, corner2toEdge1);
        largestDistance = Math.max(largestDistance, corner2toEdge2);
        largestDistance = Math.max(largestDistance, corner3toEdge1);
        largestDistance = Math.max(largestDistance, corner3toEdge2);
        largestDistance = Math.max(largestDistance, corner4toEdge1);
        largestDistance = Math.max(largestDistance, corner4toEdge2);

        if (largestDistance === 0) continue;

        movementVec.x += (perp[0] / playerLength) * largestDistance;
        movementVec.y += (perp[1] / playerLength) * largestDistance;

        break;
      }

      if (i >= 50) {
        //console.log("unresolved collision");
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
