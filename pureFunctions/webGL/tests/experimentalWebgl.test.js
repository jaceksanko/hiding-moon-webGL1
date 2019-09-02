import experimentalWebgl from '../experimentalWebgl';
require('webgl-mock');

test('if sets contextType = "webgl" condition  must be true', () => {

  const canvas = new HTMLCanvasElement( 500, 500 );
  expect(experimentalWebgl('webgl', canvas)).toEqual(canvas.getContext('experimental-webgl'));
});