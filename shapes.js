function contour(srcX, srcXClone) {
  return srcX
    .thresh(0.01)
    .diff(srcXClone.thresh(0.1))
    .thresh()
}

module.exports = {
  contour
} 