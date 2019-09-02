class TexturesPixelStoreiOptions {
  constructor(
    gl,
    UNPACK_FLIP_Y_WEBGL = false,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL = false,
    PACK_ALIGNMENT = 4,
    UNPACK_ALIGNMENT = 4,
    UNPACK_COLORSPACE_CONVERSION_WEBGL = gl.BROWSER_DEFAULT_WEBGL
  ) {
    this.gl = gl;
    this.PACK_ALIGNMENT = PACK_ALIGNMENT;
    this.UNPACK_ALIGNMENT = UNPACK_ALIGNMENT;
    this.UNPACK_FLIP_Y_WEBGL = UNPACK_FLIP_Y_WEBGL;
    this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = UNPACK_PREMULTIPLY_ALPHA_WEBGL;
    this.UNPACK_COLORSPACE_CONVERSION_WEBGL = UNPACK_COLORSPACE_CONVERSION_WEBGL;

    if (new.target === TexturesPixelStoreiOptions) {
      Object.freeze(this)
    }
  }
}

export default TexturesPixelStoreiOptions;