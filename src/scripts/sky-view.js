var w = ctx.canvas.width;
var h = ctx.canvas.height;
var sats = globalThis.data;

var cx = w / 2;
var cy = h / 2;
var margin = 40;
var radius = Math.min(w, h) / 2 - margin;

// Colors by gnssId
var COLORS = {
  0: "#4285F4", // GPS
  1: "#78909C", // SBAS
  2: "#9B59B6", // Galileo
  3: "#F39C12", // BeiDou
  5: "#E91E63", // QZSS
  6: "#34A853", // GLONASS
};

// Background
ctx.fillStyle = "#0e1621";
ctx.fillRect(0, 0, w, h);

// Grid circles (0°, 30°, 60° elevation)
ctx.strokeStyle = "#2a3a4a";
ctx.lineWidth = 1;
for (var e = 0; e <= 60; e += 30) {
  var r = radius * (90 - e) / 90;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

// Elevation labels
ctx.fillStyle = "#556677";
ctx.font = "11px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "bottom";
ctx.fillText("30\u00B0", cx, cy - radius * 60 / 90 - 2);
ctx.fillText("60\u00B0", cx, cy - radius * 30 / 90 - 2);

// Cross hairs
ctx.strokeStyle = "#1e2e3e";
ctx.beginPath();
ctx.moveTo(cx - radius, cy);
ctx.lineTo(cx + radius, cy);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(cx, cy - radius);
ctx.lineTo(cx, cy + radius);
ctx.stroke();

// Cardinal labels
ctx.fillStyle = "#8899aa";
ctx.font = "13px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "bottom";
ctx.fillText("N", cx, cy - radius - 4);
ctx.textBaseline = "top";
ctx.fillText("S", cx, cy + radius + 4);
ctx.textAlign = "left";
ctx.textBaseline = "middle";
ctx.fillText("E", cx + radius + 6, cy);
ctx.textAlign = "right";
ctx.fillText("W", cx - radius - 6, cy);

// Satellites
if (sats && sats.length > 0) {
  for (var i = 0; i < sats.length; i++) {
    var sat = sats[i];
    if (sat.elev < 0 || sat.elev > 90) continue;

    var r = radius * (90 - sat.elev) / 90;
    var angle = (sat.azim - 90) * Math.PI / 180;
    var sx = cx + r * Math.cos(angle);
    var sy = cy + r * Math.sin(angle);

    var color = COLORS[sat.gnssId] || "#888888";
    var dotR = Math.max(3, Math.min(8, sat.cno / 50 * 6));

    ctx.beginPath();
    ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
    if (sat.svUsed) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // PRN label
    ctx.fillStyle = color;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(String(sat.svid), sx + dotR + 2, sy - 2);
  }
}

// Legend
var legendX = 8;
var legendY = h - 8;
var legendItems = [
  [0, "GPS"], [6, "GLO"], [2, "GAL"], [3, "BDS"]
];
ctx.font = "10px sans-serif";
ctx.textAlign = "left";
ctx.textBaseline = "bottom";
for (var j = 0; j < legendItems.length; j++) {
  var id = legendItems[j][0];
  var label = legendItems[j][1];
  ctx.fillStyle = COLORS[id];
  ctx.fillRect(legendX, legendY - 8, 8, 8);
  ctx.fillText(label, legendX + 11, legendY);
  legendX += 45;
}
