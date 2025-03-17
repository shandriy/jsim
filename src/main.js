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

  var thread = new Thread(60, function() {

  })
  thread.start();
})();
