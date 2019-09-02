const experimentalWebgl = function forWebglContextSetsExperimentalWebgl(contextType, canvas, canvasOptions) {
  if (contextType === 'webgl') {
    return canvas.getContext('experimental-webgl', canvasOptions)
  }
};

export default experimentalWebgl;