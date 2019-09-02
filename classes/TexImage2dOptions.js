class TexImage2dOptions {
  constructor(
    gl,
    TEXTURE_2DorTEXTURE_CUBE_MAP,
    widthTexture = false,
    heightTexture = false,
    type = gl.UNSIGNED_BYTE,
    internalFormat = gl.RGBA,
    format = gl.RGBA,
    level = 0
  ) {
    this.gl = gl;
    this.TEXTURE_2DorTEXTURE_CUBE_MAP = TEXTURE_2DorTEXTURE_CUBE_MAP;
    this.level= level;
    this.internalFormat = internalFormat;
    this.widthTexture = widthTexture;
    this.heightTexture = heightTexture;
    this.border = 0;
    this.format = format;
    this.type = type;

    if (new.target === TexImage2dOptions) {
      Object.freeze(this)
    }
  }
}

export default TexImage2dOptions;


