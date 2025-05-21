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
