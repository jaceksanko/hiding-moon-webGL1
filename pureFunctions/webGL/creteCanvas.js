import setCanvasContext from "./setCanvasContext.js";

const canvasWidthSets = function canvasWidthDependsGlOptions(gl, canvasWidth) {
  if (canvasWidth === 'canvas.width') {
    return gl.canvas.width;
  }
  if (canvasWidth === 'canvas.clientWidth') {
    return gl.canvas.clientWidth
  }
};

const canvasHeightSets = function canvasHeightDependsGlOptions(gl, canvasHeight) {
  if (canvasHeight === 'canvas.height') {
    return gl.canvas.height;
  }
  if (canvasHeight === 'canvas.clientHeight') {
    return gl.canvas.clientHeight
  }
};

const createCanvas = function takeCanvasAndReturnGlWidthHeihgt(
  canvasSelector,
  contextType,
  canvasOptions,
  canvasWidth,
  canvasHeight
) {
  const canvas = document.getElementById(canvasSelector);
  const gl = setCanvasContext(canvas, contextType, canvasOptions);

  const width = canvasWidthSets(gl, canvasWidth);
  const height = canvasHeightSets(gl, canvasHeight);

  canvas.width = width;
  canvas.height = height;

  return [canvas, gl]
};

export default createCanvas;