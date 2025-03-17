(function() {
  var keyboard = new Keyboard.KeyListener();
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

  var player = {
    x: 0,
    y: 0,
    width: 20,
    height: 20
  }

  var thread = new Thread(60, function() {
    var xShift = 0;
    var yShift = 0;

    if (keyboard.keyDown("KeyW") || keyboard.keyDown("ArrowUp"))
      yShift -= 1;
    if (keyboard.keyDown("KeyS") || keyboard.keyDown("ArrowDown"))
      yShift += 1;
    if (keyboard.keyDown("KeyA") || keyboard.keyDown("ArrowLeft"))
      xShift -= 1;
    if (keyboard.keyDown("KeyD") || keyboard.keyDown("ArrowRight"))
      xShift += 1;

    var divisor = Math.sqrt(xShift * xShift + yShift * yShift);
    xShift /= divisor;
    yShift /= divisor;

    var multiplier = 1;
    if (keyboard.keyDown("ShiftLeft") || keyboard.keyDown("ShiftRight"))
      multiplier = 3;
    xShift *= multiplier;
    yShift *= multiplier;

    if (isNaN(xShift)) xShift = 0;
    if (isNaN(yShift)) yShift = 0;

    player.x += xShift;
    player.y += yShift;
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

    context.translate(-translationX, -translationY);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
