function fadeIn(duration, max = 1.0) {
  start = time;
  function fader() {
    return Math.min(((time - start) / duration), 1.0) * max;
  }
  return fader
}

function fadeOut(duration, min = 0.0) {
  end = time + duration;
  function fader() {
    return Math.max(((end - time) / duration), 0.0) * (1 - min) + min;
  }
  return fader
}

function pulse(period_in_ms = 1000, duration_in_ms = 100.0) {
  return () => + (time * 1000 % period_in_ms < duration_in_ms)
}

function pulse_bpm(speed = 1, duration_in_ms = 100.0) {
  return () => {
    period_in_ms = 60 * 1000 / (bpm * speed)
    return + (time * 1000 % period_in_ms < duration_in_ms)
  }
}

function text(content, font = "40px Arial", offsetX = 45, offsetY = 85, color = "red") {
  myCanvas = document.createElement('canvas')
  ctx = myCanvas.getContext('2d')
  ctx.font = font
  ctx.fillStyle = color
  ctx.fillText(content, offsetX, offsetY)
  s0.init({ src: myCanvas, dynamic: false })
  return s0
}

module.exports = {
  fadeIn,
  fadeOut,
  pulse,
  pulse_bpm,
  text
} 