import {pipe} from "../../libraries/functionalProgramming.js";
import errorMessage from "../../errorHandling/errorMessage.js";

const isPowerOf2 = (value) => {
  return (value & (value - 1)) === 0;
};

export const getTexture = (options) => {
  const texture = options.gl.createTexture();
  options.gl.bindTexture(options.TEXTURE_2DorTEXTURE_CUBE_MAP, texture);
  return Object.assign({}, options, { texture: texture });
};

export const pixelStorei = (
  options
) => {
  options.gl.pixelStorei(options.gl.PACK_ALIGNMENT, options.PACK_ALIGNMENT);
  options.gl.pixelStorei(options.gl.UNPACK_ALIGNMENT, options.UNPACK_ALIGNMENT);
  options.gl.pixelStorei(options.gl.UNPACK_FLIP_Y_WEBGL, options.UNPACK_FLIP_Y_WEBGL);
  options.gl.pixelStorei(options.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
  options.gl.pixelStorei(options.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, options.UNPACK_COLORSPACE_CONVERSION_WEBGL);
  return options
};

const mipmap = (options, images) => {
  const conditionMipMap = images.every((image) => isPowerOf2(image.width) && isPowerOf2(image.height));
  if (conditionMipMap) {
    options.gl.generateMipmap(options.TEXTURE_2DorTEXTURE_CUBE_MAP);
  } else {
    return errorMessage(conditionMipMap, "Image width and/or height is not a power of 2")
  }
};


export const setParameteri = (
    options
  ) => {
  options.gl.texParameteri(options.TEXTURE_2DorTEXTURE_CUBE_MAP, options.gl.TEXTURE_WRAP_S, options.WRAP_S);
  options.gl.texParameteri(options.TEXTURE_2DorTEXTURE_CUBE_MAP, options.gl.TEXTURE_WRAP_T, options.WRAP_T);
  options.gl.texParameteri(options.TEXTURE_2DorTEXTURE_CUBE_MAP, options.gl.TEXTURE_MAG_FILTER, options.MAG_FILTER);
  options.gl.texParameteri(options.TEXTURE_2DorTEXTURE_CUBE_MAP, options.gl.TEXTURE_MIN_FILTER, options.MIN_FILTER);
  return options
};

const uploadImageIntoTextureTEXTURE_2DorTEXTURE_CUBE_MAP = (options) => {
  return (options.TEXTURE_2DorTEXTURE_CUBE_MAP === options.gl.TEXTURE_2D) ?
  options.TEXTURE_2DorTEXTURE_CUBE_MAP :
  options.gl.TEXTURE_CUBE_MAP_POSITIVE_X + options.index
};


export  const uploadImageIntoTexture = (options) => {
  const TEXTURE_2DorTEXTURE_CUBE_MAP = uploadImageIntoTextureTEXTURE_2DorTEXTURE_CUBE_MAP(options);
  (options.widthTexture) ?
    options.gl.texImage2D(
      TEXTURE_2DorTEXTURE_CUBE_MAP,
      options.level,
      options.internalFormat,
      options.widthTexture,
      options.heightTexture,
      options.border,
      options.format,
      options.type,
      options.image) :
    options.gl.texImage2D(
      TEXTURE_2DorTEXTURE_CUBE_MAP,
      options.level,
      options.internalFormat,
      options.format,
      options.type,
      options.image);


 return options.texture
  };



export  const prepareTextures = (
  images,
  texImage2dOptions,
  texParameteriOptions,
  texturesPixelStoreiOptions
) => images.map((image, index) => pipe(
        getTexture,
        pixelStorei,
        setParameteri,
        uploadImageIntoTexture
      )(Object.assign({image: image, index: index},
        texImage2dOptions,
        texParameteriOptions,
        texturesPixelStoreiOptions)
      )
    );

export  const prepareCubeTextures = (
  images,
  texImage2dOptions,
  texParameteriOptions,
  texturesPixelStoreiOptions
) => {
  const options = Object.assign({},
    texImage2dOptions,
    texParameteriOptions,
    texturesPixelStoreiOptions);
  const texture = pipe(
    getTexture,
    pixelStorei,
    setParameteri)(options);

  images.map((image, index) =>
    uploadImageIntoTexture(Object.assign({image: image, index: index, texture: texture},
      options)
  ));
  mipmap(texture, images);

  return texture.texture
};


