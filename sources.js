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

/**
 * Creates a deep clone of a HydraSource/GlslSource object.
 * The cloned source is independent and can be modified without affecting the original.
 * Useful to avoid "too much recursion errors" with self-modulation and feedback.
 * 
 * @param {GlslSource} source - The HydraSource object to clone (e.g., from osc(), shape(), etc.)
 * @returns {GlslSource} A new independent copy of the source with all transforms preserved
 * @throws {Error} If the source is not a valid GlslSource object
 */
function cloneSource(source) {
    // Check if the source is a valid GlslSource
    if (!source || source.type !== 'GlslSource' || !source.transforms) {
      throw new Error('Invalid source: must be a HydraSource/GlslSource object');
    }
    
    // Create a new GlslSource instance
    const cloned = new source.constructor({
      name: source.transforms[0].name,
      transform: source.transforms[0].transform,
      userArgs: source.transforms[0].userArgs,
      defaultOutput: source.defaultOutput,
      defaultUniforms: source.defaultUniforms,
      synth: source.synth
    });
    
    // Clear the transforms array (it will have the first transform from constructor)
    cloned.transforms = [];
    
    // Deep copy all transforms
    source.transforms.forEach((transform) => {
      // Clone the transform object
      const clonedTransform = {
        name: transform.name,
        transform: transform.transform, // transform definitions are shared, no need to deep copy
        userArgs: cloneUserArgs(transform.userArgs),
        synth: transform.synth
      };
      
      cloned.transforms.push(clonedTransform);
    });
    
    return cloned;
  }
  
  /**
   * Helper function to clone user arguments for transforms.
   * Handles different argument types appropriately:
   * - Functions are kept as references (meant to be shared)
   * - Arrays are shallow copied
   * - GlslSource objects are recursively cloned
   * - Primitives are copied by value
   * 
   * @param {Array} args - Array of user arguments from a transform
   * @returns {Array} Cloned array of arguments
   * @private
   */
  function cloneUserArgs(args) {
    if (!args) return args;
    
    return args.map(arg => {
      // If it's a function, return it as-is (functions are meant to be shared)
      if (typeof arg === 'function') {
        return arg;
      }
      // If it's an array, create a shallow copy
      if (Array.isArray(arg)) {
        return [...arg];
      }
      // For primitives and other objects, return as-is
      return arg;
    });
  }

module.exports = {
  srcScale,
  srcFit,
  cloneSource,
} 