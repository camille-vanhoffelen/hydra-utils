
/* 
* MIXER
*/

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
  return () => + (time * 1000 % period_in_ms > duration_in_ms)
}

function pulse_bpm(speed = 1, duration_in_ms = 100.0) {
  return () => {
    period_in_ms = 60 * 1000 / (bpm * speed)
    return + (time * 1000 % period_in_ms > duration_in_ms)
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


/*
* RANDOM
*/

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomArray(l, min, max) {
	return Array.from({
		length: l
	}, () => randomInt(min, max));
}

// TODO refactor using randomArray = (l=12)=> Array.from({length: l}, Math.random); + .fit() + cast to int?
function randomize(array, sampleSize = 100, preventConsecutiveRepeats = true) {
  const result = [];
  let lastSampledElement = null;

  for (let i = 0; i < sampleSize; i++) {
    let randomIndex;
    let selectedElement;

    do {
      randomIndex = Math.floor(Math.random() * array.length);
      selectedElement = array[randomIndex];
    } while (preventConsecutiveRepeats && selectedElement == lastSampledElement);

    result.push(selectedElement);
    lastSampledElement = selectedElement;
  }

  return result;
}

/**
 * Array.map but preserves the custom Hydra properties
 * (e.g _speed, _ease, ...)
 * 
 * @param {*} arr 
 * @param {*} fn 
 * @returns arr
 */
function mapArray(arr, fn) {
  const result = arr.map(fn);

  Object.keys(arr).forEach(key => {
    if (key.startsWith('_')) {
      result[key] = arr[key];
    }
  });

  return result;
}

/**
 * Generates random float c [0, 1] for given seed
 * Does not change each time the code is run
 * 
 * @param {*} seed - int or fn or array
 * @returns int if int, fn if fn, array if array
 */
function persistentRandom(seed) {
  if (typeof seed === 'function') {
    return () => persistentRandom(seed())
  }

  if (Array.isArray(seed)) {
    return mapArray(seed, s => persistentRandom(s));
  }

  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates random Array[3] of floats c [0, 1] for given seed
 * Does not change each time the code is run

 * @param {*} seed - int or fn or array
 * @returns array of ints if int, array of fns if fn, array of arrays if array
 */
function randomColor(seed) {
  if (typeof seed === 'function') {
    return [
      persistentRandom(seed),
      persistentRandom(() => seed() + 666),
      persistentRandom(() => seed() + 1337),
    ]
  }

  if (Array.isArray(seed)) {
    return [
      persistentRandom(seed),
      persistentRandom(mapArray(seed, s => s + 666)),
      persistentRandom(mapArray(seed, s => s + 1337)),
    ]
  }

  return [
    persistentRandom(seed),
    persistentRandom(seed + 666),
    persistentRandom(seed + 1337),
  ]
}

/* 
* COLORS
*/

/**
 * Transforms n arrays of size 3 into 3 arrays of size n.
 * 
 * @param {Array<Array>} arrays - An array containing n arrays, each with exactly 3 elements.
 * @returns {Array<Array>} - An array containing 3 arrays, each with n elements.
 * @throws {Error} - If input is not a non-empty array of arrays or if any inner array doesn't have exactly 3 elements.
 */
function transformColorArrays(arrays) {
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

function better_gradient(speed = 0.5) {
  return osc(Math.PI / 2, speed, Math.PI / 2)
    .blend(
      osc(Math.PI / 2, speed, Math.PI / 2)
        .rotate(Math.PI)
    )
}

function monoStripes(sourceX, colorX) {
  return osc(20, 0.04)
    .color(...colorX)
    // dull
    // .saturate(3)
    // squish
    // .contrast(0.8)
    // bins
    .posterize(20)
    .modulate(sourceX, 0.5)
}

function duoStripes(sourceX, sourceXClone, lightColor, darkColor) {
  /**
  * Need two of the same sources to circumvent recursion issues
  */
  var oscFreq = 5;
  var oscSync = 0.4;
  return osc(oscFreq, oscSync)
    .color(...lightColor)
    .modulate(sourceX, 0.5)
    .add(
      osc(oscFreq, oscSync)
        .invert()
        .color(...darkColor)
        .modulate(sourceXClone, 0.5)
    )
}

function monochrome(sourceX, colorX) {
  return sourceX
    .saturate(0)
    .color(...colorX)
}

/**
* Need two of the same sources to circumvent recursion issues
* Use luma on the sources to only apply duochrome to opaque
*/
function duochrome(sourceX, sourceXClone, lightColor, darkColor) {
  return sourceX
    .saturate(0)
    // this doesn't work with arrays, see transformColorArrays
    .color(...lightColor)
    .add(sourceXClone
      .invert()
      .saturate(0)
      .color(...darkColor)
    )
}


/**
* Use luma on the source to only apply duochrome to opaque
*/
function simpleDuochrome(sourceX, colorX) {
  return sourceX
    .saturate(0)
    .color(...colorX)
    .contrast(0.1)
    .saturate(10)
}

/*
* SHAPES
*/

function contour(srcX, srcXClone) {
  return srcX
  .thresh(0.01)
  .diff(srcXClone.thresh(0.1))
  .thresh()
}

/*
* SOURCES
*/


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
 * 
 * @param {Object} source - A Hydra source object (e.g., s0, s1, s2, s3)
 * @param {number|function} scale - Scale factor (1.0 = original size, 0.5 = half size, 2.0 = double size)
 * @returns {Object} Hydra transform chain that can be further modified or output
 * 
 * @example
 * s0.initImage("photo.jpg")
 * srcScale(s0, 0.5).out()  // Display at half size
 * 
 * @example
 * s0.initImage("photo.jpg")
 * srcScale(s0, () => 0.5 + Math.sin(time * 0.5) * 0.3).out()  // Animated scale
 */
function srcScale(source, scale = 1.0) {
  if (source && source.tex) {
    return srcSize(source, source.tex.width * scale, source.tex.height * scale);
  }
  return solid(0, 0, 0, 0);
}

/**
 * Display a Hydra source fitting within specified bounds while maintaining aspect ratio
 * 
 * @param {Object} source - A Hydra source object (e.g., s0, s1, s2, s3)
 * @param {number} [maxWidth=window.innerWidth] - Maximum width in pixels (defaults to window width)
 * @param {number} [maxHeight=window.innerHeight] - Maximum height in pixels (defaults to window height)
 * @returns {Object} Hydra transform chain that can be further modified or output
 * 
 * @example
 * s0.initImage("photo.jpg")
 * srcFit(s0).out()  // Fit to full window (default)
 * 
 * @example
 * s0.initImage("photo.jpg")
 * srcFit(s0, 800, 600).out()  // Fit within 800x600 box
 */
function srcFit(source, maxWidth = window.innerWidth, maxHeight = window.innerHeight) {
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
