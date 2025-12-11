function circularScroll(source, speed, radius) {
    let x = [-radius, radius].ease('sin').fast(Math.abs(speed)).offset(Math.sign(speed) * 0.5)
    let y = [-radius, radius].ease('sin').fast(Math.abs(speed))
    return source.scroll(x, y)
    
  }