window.Utilities = {
  segmentsIntersect: function(ax, ay, bx, by, cx, cy, dx, dy) {
    var x, y;
    var slopeab = (ay - by) / (ax - bx);
    var slopecd = (cy - dy) / (cx - dx);

    if (slopeab === slopecd)
      return false;
    if (!isFinite(slopeab) && !isFinite(slopecd))
      return false;

    if (!isFinite(slopeab)) {
      x = ax;
      y = slopecd * (x - cx) + cy;
    } else if (!isFinite(slopecd)) {
      x = cx;
      y = slopeab * (x - ax) + ay;
    } else {
      x = (-slopecd * cx + cy + slopeab * ax - ay) / (slopeab - slopecd);
      y = slopeab * (x - ax) + ay;
    }

    var minabx = ax < bx ? ax : bx;
    var maxabx = ax < bx ? bx : ax;
    var minaby = ay < by ? ay : by;
    var maxaby = ay < by ? by : ay;
    var mincdx = cx < dx ? cx : dx;
    var maxcdx = cx < dx ? dx : cx;
    var mincdy = cy < dy ? cy : dy;
    var maxcdy = cy < dy ? dy : cy;

    if (x < minabx || x > maxabx) return false;
    if (y < minaby || y > maxaby) return false;
    if (x < mincdx || x > maxcdx) return false;
    if (y < mincdy || y > maxcdy) return false;

    if (x === ax && y == ay) return false;
    if (x === bx && y == by) return false;
    if (x === cx && y == cy) return false;
    if (x === dx && y == dy) return false;

    return [x, y];
  },
  pointToLine: function(x, y, ax, ay, bx, by) {
    var bay = by - ay;
    var bax = bx - ax;

    return Math.abs(bay * x - bax * y + bx * ay - by * ax) / Math.sqrt(bay * bay + bax * bax);
  },
  leftOfLine: function(x, y, ax, ay, bx, by) {
    if (ay === by) return y < ay;
    return (bx - ax) * (y - ay) - (by - ay) * (x - ax) > 0;
  },
  pointOnLine: function(x, y, ax, ay, bx, by) {
    var slopeAB = (ay - by) / (ax - bx)

    if (!isFinite(slopeAB)) {
      return x === ax;
    }

    return slopeAB * (x - ax) + ay === y;
  }
}
