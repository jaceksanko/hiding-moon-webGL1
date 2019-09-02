import errorMessage from "../../errorHandling/errorMessage.js";

const createShader = (gl, type, source) =>
  {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader
  };


const checkCreatedShaderSuccess = (gl, shader) => {
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  return { success, shader };
};

function ifCreatedShaderFalse(gl, shader) {
  errorMessage(false, gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return false;
}

function shaderOrFalse(gl, type, source) {
  const { success, shader } = checkCreatedShaderSuccess(
    gl,
    createShader(gl, type, source)
  );
  return !success ? ifCreatedShaderFalse(gl, shader) : shader;
}

const attachShader = (gl, vertexAndFragmentShaders, program) => {
  vertexAndFragmentShaders.map(shader => gl.attachShader(program, shader));
  return program;
};

const checkCreatedProgramSuccess = (gl, program) => {
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  return { success, program };
};

function ifCreatedProgramFalse(gl, program) {
  errorMessage(false, gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return false;
}

const createProgram = (gl, vertexAndFragmentShaders) => {
  const { success, program } = checkCreatedProgramSuccess(
    gl,
    attachShader(gl, vertexAndFragmentShaders, gl.createProgram())
  );
  return !success ? ifCreatedProgramFalse(gl, program) : program;
};

export const getProgram = (gl, vertexShaderSource, fragmentShaderSource) => {
  const shaders = [
    [gl.VERTEX_SHADER, vertexShaderSource],
    [gl.FRAGMENT_SHADER, fragmentShaderSource]
  ].map(typeAndSourceShader => {
    const [type, source] = [...typeAndSourceShader];
    return shaderOrFalse(gl, type, source);
  });
  return createProgram(gl, shaders);
};
