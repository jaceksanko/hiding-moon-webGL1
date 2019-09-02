import setCanvasContext from '../setCanvasContext';
const { createCanvas } = require('canvas');
require('webgl-mock');

test('Sets context type 2d. Return true if constructor.name is CanvasRenderingContext2D ', () => {
  const canvas = createCanvas(200, 200);
  const gl = setCanvasContext(canvas, '2d');
  expect(gl.constructor.name).toEqual(
    "CanvasRenderingContext2D"
  );
});

test('Sets context type webgl. Return true if constructor.name is WebGLRenderingContext', () => {
  const canvas = new HTMLCanvasElement( 500, 500 );
  const gl = setCanvasContext(canvas, 'webgl');
  expect(gl.constructor.name).toEqual(
    "WebGLRenderingContext"
  );
});

