import {getTexture, pixelStorei, setParameteri} from "../textures";
import TexImage2dOptions from "../../../classes/TexImage2dOptions";
import TexParameteriOptions from "../../../classes/TexParameteriOptions";
import TexturesPixelStoreiOptions from "../../../classes/TexturesPixelStoreiOptions";

const puppeteer = require('puppeteer');

const serializableTexImage2dOptions = TexImage2dOptions.toString();
const serializableTexParameteriOptions = TexParameteriOptions.toString();
const serializableTexturesPixelStoreiOptions = TexturesPixelStoreiOptions.toString();

const serializableGetTexture = getTexture.toString();
const serializablePixelStorei = pixelStorei.toString();
const serializableSetParameteri = setParameteri.toString();


test('Sets classes: TexImage2dOptions, TexParameteriOptions, TexturesPixelStoreiOptions and ' +
  'functions from textures.js: getTexture, pixelStorei, setParameteri' +
  ' returned texture should be TEXTURE_2D and had pixelStorei and setParameteri ', async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const webgl = await page.evaluate((
    serializableTexImage2dOptions,
    serializableTexParameteriOptions,
    serializableTexturesPixelStoreiOptions,
    serializableGetTexture,
    serializablePixelStorei,
    serializableSetParameteri
    ) => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      const funcDeserialize = (funcSerialize) => new Function(`return (${funcSerialize}).apply(null, arguments)`);
      //"funcDeserialize" not working for class, that why is uses "eval"
      eval(`window.TexImage2dOptionsDeserialize = ${serializableTexImage2dOptions}`);
      eval(`window.TexParameteriOptionsDeserialize = ${serializableTexParameteriOptions}`);
      eval(`window.TexturesPixelStoreiOptionsDeserialize = ${serializableTexturesPixelStoreiOptions}`);

      const getTexture = funcDeserialize(serializableGetTexture);
      const pixelStorei = funcDeserialize(serializablePixelStorei);
      const setParameteri = funcDeserialize(serializableSetParameteri);

      const texImage2dOptions = new TexImage2dOptionsDeserialize(
        gl,
        gl.TEXTURE_2D
      );
      const texParameteriOptions = new TexParameteriOptionsDeserialize(
        gl,
        gl.CLAMP_TO_EDGE,
        gl.CLAMP_TO_EDGE,
        gl.LINEAR,
        gl.LINEAR
      );
      const texturesPixelStoreiOptions = new TexturesPixelStoreiOptionsDeserialize(
        gl,
        true,
        true
      );
      const optionsWithTexture = getTexture(Object.assign({},
        texImage2dOptions,
        texParameteriOptions,
        texturesPixelStoreiOptions));
      const optionsWithTextureAndPixelStorei = pixelStorei(optionsWithTexture);
      setParameteri(optionsWithTextureAndPixelStorei);

    return {
      texImage2dOptions: texImage2dOptions,
      texParameteriOptions: texParameteriOptions,
      texturesPixelStoreiOptions: texturesPixelStoreiOptions,
      isTexture: gl.isTexture(optionsWithTexture.texture),
      TEXTURE_BINDING_2D: gl.getParameter(gl.TEXTURE_BINDING_2D),
      TEXTURE_BINDING_CUBE_MAP: gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP),
      PACK_ALIGNMENT: gl.getParameter(gl.PACK_ALIGNMENT),
      UNPACK_ALIGNMENT: gl.getParameter(gl.UNPACK_ALIGNMENT),
      UNPACK_FLIP_Y_WEBGL: gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL),
      UNPACK_PREMULTIPLY_ALPHA_WEBGL: gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL),
      UNPACK_COLORSPACE_CONVERSION_WEBGL: gl.getParameter(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL),
      TEXTURE_MAG_FILTER: gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER),
      TEXTURE_MIN_FILTER: gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER),
      TEXTURE_WRAP_S: gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S),
      TEXTURE_WRAP_T: gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T),
    };
  }, serializableTexImage2dOptions,
    serializableTexParameteriOptions,
    serializableTexturesPixelStoreiOptions,
    serializableGetTexture,
    serializablePixelStorei,
    serializableSetParameteri
  );

  console.log('WebGL Support:', webgl);

  await browser.close();

  const texImage2dOptionsTest = {
    gl: {},
    TEXTURE_2DorTEXTURE_CUBE_MAP: 3553,
    level: 0,
    internalFormat: 6408,
    widthTexture: false,
    heightTexture: false,
    border: 0,
    format: 6408,
    type: 5121
  };
  const texParameteriOptionsTest = {
    gl: {},
    WRAP_S: 33071,
    WRAP_T: 33071,
    MIN_FILTER: 9729,
    MAG_FILTER: 9729
  };

  const texturesPixelStoreiOptionsTest = {
    gl: {},
    PACK_ALIGNMENT: 4,
    UNPACK_ALIGNMENT: 4,
    UNPACK_FLIP_Y_WEBGL: true,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: true,
    UNPACK_COLORSPACE_CONVERSION_WEBGL: 37444
  };

  expect(webgl.texImage2dOptions).toMatchObject(texImage2dOptionsTest);
  expect(webgl.texParameteriOptions).toMatchObject(texParameteriOptionsTest);
  expect(webgl.texturesPixelStoreiOptions).toMatchObject(texturesPixelStoreiOptionsTest);
  console.log('instances of classes: TexImage2dOptions, TexParameteriOptions, TexturesPixelStoreiOptions passed ');
  expect(webgl.isTexture).toStrictEqual(true);
  expect(webgl.TEXTURE_BINDING_2D).not.toBeNull();
  expect(webgl.TEXTURE_BINDING_CUBE_MAP).toBeNull();
  console.log('getTexture function passed ');
  expect(webgl.PACK_ALIGNMENT).toStrictEqual(4);
  expect(webgl.UNPACK_ALIGNMENT).toStrictEqual(4);
  expect(webgl.UNPACK_FLIP_Y_WEBGL).toStrictEqual(true);
  expect(webgl.UNPACK_PREMULTIPLY_ALPHA_WEBGL).toStrictEqual(true);
  expect(webgl.UNPACK_COLORSPACE_CONVERSION_WEBGL).toStrictEqual(37444);
  console.log('pixelStorei function passed ');
  expect(webgl.TEXTURE_MAG_FILTER).toStrictEqual(9729);
  expect(webgl.TEXTURE_MIN_FILTER).toStrictEqual(9729);
  expect(webgl.TEXTURE_WRAP_S).toStrictEqual(33071);
  expect(webgl.TEXTURE_WRAP_T).toStrictEqual(33071);
  console.log('SetParameteri function passed ');
});

