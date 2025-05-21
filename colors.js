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
    .posterize(20)
    .modulate(sourceX, 0.5)
}

function duoStripes(sourceX, sourceXClone, lightColor, darkColor) {
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

function duochrome(sourceX, sourceXClone, lightColor, darkColor) {
  return sourceX
    .saturate(0)
    .color(...lightColor)
    .add(sourceXClone
      .invert()
      .saturate(0)
      .color(...darkColor)
    )
}

function simpleDuochrome(sourceX, colorX) {
  return sourceX
    .saturate(0)
    .color(...colorX)
    .contrast(0.1)
    .saturate(10)
}

module.exports = {
  transformColorArrays,
  better_gradient,
  monoStripes,
  duoStripes,
  monochrome,
  duochrome,
  simpleDuochrome
} 