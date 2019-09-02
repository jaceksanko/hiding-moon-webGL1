class TexParameteriOptions {
  constructor(
    gl,
    WRAP_S = gl.REPEAT,
    WRAP_T = gl.REPEAT,
    MIN_FILTER = gl.NEAREST_MIPMAP_LINEAR,
    MAG_FILTER = gl.LINEAR
  ) {
    this.gl = gl;
    this.WRAP_S = WRAP_S;
    this.WRAP_T = WRAP_T;
    this.MIN_FILTER = MIN_FILTER;
    this.MAG_FILTER = MAG_FILTER;

    if (new.target === TexParameteriOptions) {
      Object.freeze(this)
    }
  }
}

export default TexParameteriOptions;