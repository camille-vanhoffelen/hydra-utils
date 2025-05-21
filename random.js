function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomArray(l, min, max) {
  return Array.from({
    length: l
  }, () => randomInt(min, max));
}

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

function mapArray(arr, fn) {
  const result = arr.map(fn);

  Object.keys(arr).forEach(key => {
    if (key.startsWith('_')) {
      result[key] = arr[key];
    }
  });

  return result;
}

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

module.exports = {
  randomInt,
  randomArray,
  randomize,
  mapArray,
  persistentRandom,
  randomColor
} 