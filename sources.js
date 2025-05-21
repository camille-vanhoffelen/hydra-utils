/**
 * srcSize - Renders images at specific pixel dimensions, always centered on screen
 * This is a custom Hydra function that must be added using setFunction()
 */
setFunction({
  name: 'srcSize',
  type: 'src',
  inputs: [
    { type: 'sampler2D', name: 'tex', default: NaN },
    { type: 'float', name: 'width', default: 400 },   // Width in pixels
    { type: 'float', name: 'height', default: 300 }   // Height in pixels
  ],
  glsl: `
    vec2 st = _st;
    
    // Convert pixel dimensions to normalized coordinates (0-1)
    float normWidth = width / resolution.x;
    float normHeight = height / resolution.y;
    
    // Calculate the bounds of where the image should be displayed (centered)
    float halfWidth = normWidth * 0.5;
    float halfHeight = normHeight * 0.5;
    
    float left = 0.5 - halfWidth;
    float right = 0.5 + halfWidth;
    float bottom = 0.5 - halfHeight;
    float top = 0.5 + halfHeight;
    
    // Check if we're inside the image bounds
    if (st.x >= left && st.x <= right && st.y >= bottom && st.y <= top) {
      // Map the coordinates to texture space (0-1)
      vec2 texCoord = vec2(
        (st.x - left) / normWidth,
        (st.y - bottom) / normHeight
      );
      return texture2D(tex, texCoord);
    } else {
      // Outside bounds - return transparent
      return vec4(0.0, 0.0, 0.0, 0.0);
    }
  `
})

/**
 * Display a Hydra source at a specific scale relative to its original size
 */
function srcScale(source, scale = 1.0) {
  if (source && source.tex) {
    return srcSize(source, source.tex.width * scale, source.tex.height * scale);
  }
  return solid(0, 0, 0, 0);
}

/**
 * Display a Hydra source fitting within specified bounds while maintaining aspect ratio
 */
function srcFit(source, maxWidth = width, maxHeight = height) {
  if (source && source.tex) {
    const aspect = source.tex.width / source.tex.height;
    const targetAspect = maxWidth / maxHeight;

    let width, height;
    if (aspect > targetAspect) {
      // Image is wider than target - fit to width
      width = maxWidth;
      height = maxWidth / aspect;
    } else {
      // Image is taller than target - fit to height
      height = maxHeight;
      width = maxHeight * aspect;
    }

    return srcSize(source, width, height);
  }
  return solid(0, 0, 0, 0);
}

module.exports = {
  srcScale,
  srcFit
} 