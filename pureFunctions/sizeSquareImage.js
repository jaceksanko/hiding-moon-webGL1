function sizeSquareImage(x, y, z, moveX, moveY) {
  return [
    -x+moveX,-y+moveY,-z,    0,0,
    x+moveX,-y+moveY,-z,     1,0,
    x+moveX, y+moveY,-z,     1,1,
    -x+moveX, y+moveY,-z,    0,1
  ]
}
export default sizeSquareImage