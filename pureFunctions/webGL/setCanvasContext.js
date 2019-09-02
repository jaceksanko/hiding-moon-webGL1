import experimentalWebgl from './experimentalWebgl.js';
import errorMessage from '../../errorHandling/errorMessage.js';

const setCanvasContext = function setAnyCanvasContext(canvas, contextType, canvasOptions) {
  let gl = canvas.getContext(contextType, canvasOptions) || experimentalWebgl(contextType, canvas, canvasOptions);
  errorMessage(
    gl === null,
    'Unable to initialize WebGL. Your browser or machine may not support it.'
  );
  return gl
};

export default setCanvasContext;