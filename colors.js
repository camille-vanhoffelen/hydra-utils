(async function() {
  await loadScript('https://cdn.jsdelivr.net/gh/camille-vanhoffelen/hydra-utils@main/sources.js');
})();


const GlslSourcePrototype = Object.getPrototypeOf(osc());

/**
 * Takes an array of RGB color arrays and reshapes them into separate channel arrays.
 * For example: [[r1,g1,b1], [r2,g2,b2]] becomes [[r1,r2], [g1,g2], [b1,b2]]
 * 
 * Preserves any special properties (keys starting with '_') from the input array
 * by copying them to each output channel array.
 * 
 * @param {Array<Array<number>>} arrays - Array of RGB color arrays, each containing 3 numbers
 * @returns {Array<Array<number>>} Array of 3 arrays containing the R, G, and B channels
 * @throws {Error} If input is not a non-empty array of 3-element arrays
 */

function reshapeColorArrays(arrays) {
  if (!Array.isArray(arrays) || arrays.length === 0) {
    throw new Error("Input must be a non-empty array of arrays");
  }

  for (const arr of arrays) {
    if (!Array.isArray(arr) || arr.length !== 3) {
      throw new Error("Each inner array must contain exactly 3 elements");
    }
  }

  const result = [[], [], []];

  for (const arr of arrays) {
    result[0].push(arr[0]);
    result[1].push(arr[1]);
    result[2].push(arr[2]);
  }

  for (const res of result) {
    Object.keys(arrays).forEach(key => {
      if (key.startsWith('_')) {
        res[key] = arrays[key];
      }
    });
  }

  return result;
}

function betterGradient(speed = 0.5) {
  return osc(Math.PI / 2, speed, Math.PI / 2)
    .blend(
      osc(Math.PI / 2, speed, Math.PI / 2)
        .rotate(Math.PI)
    )
}


/**
 * Creates a simple bichrome effect by saturating the source and adding a color.
 * 
 * usage:
 * source.bichrome(...lightColor)
 * 
 */
GlslSourcePrototype.simpleBichrome = function (r, g, b) {
  return this
    .saturate(0)
    .color(r, g, b)
    .contrast(0.1)
    .saturate(10);
};

/**
 * Creates a bichrome effect by adding a color to the source and inverting it.
 * 
 * usage:
 * source.bichrome(...lightColor, ...darkColor)
 * 
 */
GlslSourcePrototype.bichrome = function (r1, g1, b1, r2, g2, b2) {
  let sourceClone = cloneSource(this);
  return this
    .saturate(0)
    .color(r1, g1, b1)
    .add(sourceClone
      .invert()
      .saturate(0)
      .color(r2, g2, b2)
    );
};

/**
 * 
 * Usage: 
 * `let [reds, greens, blues] = splitColors(base)`
 * @param {source} sourceX 
 * @returns 
 */
function splitColors(sourceX) {
  return [
    cloneSource(sourceX).color(1, 0, 0),
    cloneSource(sourceX).color(0, 1, 0),
    cloneSource(sourceX).color(0, 0, 1)
  ]
}

/**
 * Usage:
 * let transforms = [
  [0, 0, 1],
  [0, 0, 1],
  [1, 0, 0],
]

let shifted = shiftColors(src(s0), transforms)
 * 
 * @param {source} sourceX 
 * @param {Array<Array<number>>} transforms 
 * @returns 
 */
function shiftColors(sourceX, transforms) {
  return cloneSource(sourceX).r().color(...transforms[0])
    .add(
    cloneSource(sourceX).g().color(...transforms[1]),
      )
    .add(
    cloneSource(sourceX).b().color(...transforms[2]),
      )
}

/**
 * Converts a hex color to an RGB array.
 * 
 * Usage:
 * let color1 = hexToRgb('#ff0000')
 * osc().color(...color1).out()
 * 
 * @param {string} hex - The hex color string to convert
 * @returns {Array<number>} Array containing the normalized RGB values (0-1)
 */
function hexToRgb(hex) {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values and normalize to 0-1 range
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return [ r, g, b ];
}

module.exports = {
  reshapeColorArrays,
  betterGradient,
  splitColors,
  shiftColors,
} 