"use strict";
import {mainCube, old_x, old_y, PHI, THETA} from './script.js';
import {loadImagesAndShaders} from './pureFunctions/loadImagesAndShaders.js'
import createCanvas from './pureFunctions/webGL/creteCanvas.js'
import {getProgram} from "./pureFunctions/webGL/programs.js";
import sizeSquareImage from "./pureFunctions/sizeSquareImage.js";
import TexImage2dOptions from "./classes/TexImage2dOptions.js";
import TexParameteriOptions from "./classes/TexParameteriOptions.js";
import TexturesPixelStoreiOptions from "./classes/TexturesPixelStoreiOptions.js";
import {prepareTextures} from "./pureFunctions/webGL/textures.js";
import {separateImagesAndShaders} from "./pureFunctions/loadImagesAndShaders.js";



const shader_vertex_source1Url = './pureFunctions/shaders/shader_vertex_source1.glsl';
const shader_fragment_source1Url = './pureFunctions/shaders/shader_fragment_source1.glsl';


const lakeBackAndMoonUrlImages = [
  "textures/lake/back.jpg",
  "textures/moon.jpg"
];
let moonAndLakeTex;
const moonSettings = {
  moonMoveLeftRight: 0.25,
  moonMoveUpDown: 0.5,
  moonSizeChange: 5,
  moonMoveSizeCorrectionLeftRight: 0.0,
  moonMoveSizeCorrectionUpDown: 0.0,
  moonLessR: 1.0,
  moonMoreR: 0.0,
  moonLessG: 1.0,
  moonMoreG: 0.0,
  moonLessB: 1.0,
  moonMoreB: 0.0,
  lakeLessR: 0.53,
  lakeMoreR: 0.20,
  lakeLessG: 1.0,
  lakeMoreG: 0.0,
  lakeLessB: 1.0,
  lakeMoreB: 0.0,
  zoom: 40,
};

function main() {
  loadImagesAndShaders([...lakeBackAndMoonUrlImages, shader_vertex_source1Url, shader_fragment_source1Url])
    .then(imagesAndShaders => {
      const {shaders, images} = separateImagesAndShaders(imagesAndShaders);
      render(images, ...shaders)})
    .then(() => mainCube())
}

function render(images, shader_vertex_source1, shader_fragment_source1) {
  const canvasOptions = {
    preserveDrawingBuffer: true,
    alpha: false,
    premultipliedAlpha: false  // Ask for non-premultiplied alpha
  };

  const [canvasBackLakeWithMoon, gl] = createCanvas(
    "moon_canvas",
    "webgl",
    canvasOptions,
    `canvas.width`,
    `canvas.height`
  );

   draw();

  window.addEventListener("resize", function() {
		mainCube(true, THETA, PHI, old_x, old_y, true);
	});

	function slider(name, selector, min, max, value, step, index) {
		const sliderDiv = document.querySelector(selector);
		sliderDiv.innerHTML = `
      <div class="widget-outer">
        <div class="widget-label">${name}</div>
        <div class="widget-value"></div>
        <input class="widget-slider" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
      </div>
    `;
		const valueElem = sliderDiv.querySelector(".widget-value");
		const sliderElem = sliderDiv.querySelector(".widget-slider");

		function updateValue(value) {
			valueElem.textContent = value;
		}
		updateValue(value);

		function handleChange1(event) {

			let oldValue = moonSettings[index];
			let value = event.target.valueAsNumber;

			updateValue(value);
			if (index === "moonMoveLeftRight") {
				moonSettings[index] = value;

			} else if (index === "moonSizeChange") {
				moonSettings.moonMoveSizeCorrectionLeftRight += (value-oldValue)/10;
				moonSettings.moonMoveSizeCorrectionUpDown += (value-oldValue)/10;
				moonSettings[index] = value;

			} else if (index === "moonMoveUpDown") {
				moonSettings[index] = value;
			} else {
				moonSettings[index] = value;
			}

      draw();
			mainCube(true, THETA, PHI, old_x, old_y); //drawing the cube with new moon change and delete texture at the end - memory used not rise
		}

		function handleChange2() {
			mainCube(false,  THETA, PHI, old_x, old_y); // at the end of used input range drawing drawing the cube with new moon change and NOT delete the texture
			// it is necessary to good work move cube events
		}

		sliderElem.addEventListener('input', handleChange1);
		sliderElem.addEventListener('change', handleChange2);
	}

	slider("Moon size","#moon-size-change", 0, 20, moonSettings.moonSizeChange, 0.1, "moonSizeChange");
	slider("Moon up-down","#moon-move-up-down", -0.05, 0.9, moonSettings.moonMoveUpDown, 0.001, "moonMoveUpDown");
	slider("Moon left-right","#moon-move-left-right", -0.3, 1, moonSettings.moonMoveLeftRight, 0.001, "moonMoveLeftRight");

	let moonRGBmin = 0.0;
	let moonRGBmax = 1.0;

	slider("moonLessR","#moonLessR", moonRGBmin, moonRGBmax, moonSettings.moonLessR, 0.01, "moonLessR");
	slider("moonMoreR","#moonMoreR", moonRGBmin, moonRGBmax, moonSettings.moonMoreR, 0.01, "moonMoreR");
	slider("moonLessG","#moonLessG", moonRGBmin, moonRGBmax, moonSettings.moonLessG, 0.01, "moonLessG");
	slider("moonMoreG","#moonMoreG", moonRGBmin, moonRGBmax, moonSettings.moonMoreG, 0.01, "moonMoreG");
	slider("moonLessB","#moonLessB", moonRGBmin, moonRGBmax, moonSettings.moonLessB, 0.01, "moonLessB");
	slider("moonMoreB","#moonMoreB", moonRGBmin, moonRGBmax, moonSettings.moonMoreB, 0.01, "moonMoreB");

	slider("lakeLessR","#lakeLessR", moonRGBmin, moonRGBmax, moonSettings.lakeLessR, 0.01, "lakeLessR");
	slider("lakeMoreR","#lakeMoreR", moonRGBmin, moonRGBmax, moonSettings.lakeMoreR, 0.01, "lakeMoreR");
	slider("lakeLessG","#lakeLessG", moonRGBmin, moonRGBmax, moonSettings.lakeLessG, 0.01, "lakeLessG");
	slider("lakeMoreG","#lakeMoreG", moonRGBmin, moonRGBmax, moonSettings.lakeMoreG, 0.01, "lakeMoreG");
	slider("lakeLessB","#lakeLessB", moonRGBmin, moonRGBmax, moonSettings.lakeLessB, 0.01, "lakeLessB");
	slider("lakeMoreB","#lakeMoreB", moonRGBmin, moonRGBmax, moonSettings.lakeMoreB, 0.01, "lakeMoreB");

	slider("Zoom","#zoom", 4, 50, moonSettings.zoom, 0.01, "zoom");


	function draw() {

    const SHADER_PROGRAM1 = getProgram(gl, shader_vertex_source1, shader_fragment_source1);

    const glUniforms = [
      "Pmatrix", "Vmatrix", "Mmatrix", "u_image0", "u_image1", "image1Load", "moonSize",
      "moonMove", "moonMoveSizeCorrection", "moonLessR", "moonMoreR", "moonLessG", "moonMoreG",
      "moonLessB", "moonMoreB", "lakeLessR", "lakeMoreR", "lakeLessG", "lakeMoreG", "lakeLessB",
      "lakeMoreB"
    ];

    const [
      _Pmatrix, _Vmatrix, _Mmatrix, _u_image0, _u_image1, _image1Load, _moonSize,
      _moonMove, _moonMoveSizeCorrection, _moonLessR, _moonMoreR, _moonLessG, _moonMoreG,
      _moonLessB, _moonMoreB, _lakeLessR, _lakeMoreR, _lakeLessG, _lakeMoreG, _lakeLessB,
      _lakeMoreB
    ] = glUniforms.map((uniform) => gl.getUniformLocation(SHADER_PROGRAM1, uniform));

    const glAttrib = [
      "uv",
      "position",
    ];

    const [ _uv, _position1 ] = glAttrib.map((uniform) => {
      const uniformVar = gl.getAttribLocation(SHADER_PROGRAM1, uniform);
      gl.enableVertexAttribArray(uniformVar);
      return uniformVar
    });

		gl.useProgram(SHADER_PROGRAM1);



		const cube_vertex1 = [
			...sizeSquareImage(1, 1, 1, 0, 0),
		];

		const cube_faces1 = [
			0,1,2,
			0,2,3,
		];

		const PROJMATRIX1 = LIBS.get_projection(40, canvasBackLakeWithMoon.width/canvasBackLakeWithMoon.height, 1, 100),
					MOVEMATRIX1 = LIBS.get_I4(),
					VIEWMATRIX1 = LIBS.get_I4();

		LIBS.translateZ(VIEWMATRIX1, -0.373);
		LIBS.set_I4(MOVEMATRIX1);

		/*========================= TEXTURE1 ========================= */

    const texImage2dOptions = new TexImage2dOptions(
      gl,
      gl.TEXTURE_2D
    );
    const texParameteriOptions = new TexParameteriOptions(
      gl,
      gl.CLAMP_TO_EDGE,
      gl.CLAMP_TO_EDGE,
      gl.LINEAR,
      gl.LINEAR
      );
    const texturesPixelStoreiOptions = new TexturesPixelStoreiOptions(
      gl,
      true,
      true
    );

    const textures = prepareTextures(
      images,
      texImage2dOptions,
      texParameteriOptions,
      texturesPixelStoreiOptions
    );

		const CUBE_VERTEX1 = gl.createBuffer();
		const CUBE_FACES1 = gl.createBuffer();

		/*========================= DRAWING ========================= */
		gl.viewport(0.0, 0.0, canvasBackLakeWithMoon.width, canvasBackLakeWithMoon.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clearDepth(1.0);
		gl.disable( gl.BLEND );

		//moon settings put to shader
		gl.uniform1f(_moonSize, moonSettings.moonSizeChange);
		gl.uniform2f(_moonMove, moonSettings.moonMoveLeftRight, moonSettings.moonMoveUpDown);

		gl.uniform2f(_moonMoveSizeCorrection, moonSettings.moonMoveSizeCorrectionLeftRight, moonSettings.moonMoveSizeCorrectionUpDown);

		gl.uniform1f(_moonLessR, moonSettings.moonLessR);
		gl.uniform1f(_moonMoreR, moonSettings.moonMoreR);
		gl.uniform1f(_moonLessG, moonSettings.moonLessG);
		gl.uniform1f(_moonMoreG, moonSettings.moonMoreG);
		gl.uniform1f(_moonLessB, moonSettings.moonLessB);
		gl.uniform1f(_moonMoreB, moonSettings.moonMoreB);

		gl.uniform1f(_lakeLessR, moonSettings.lakeLessR);
		gl.uniform1f(_lakeMoreR, moonSettings.lakeMoreR);
		gl.uniform1f(_lakeLessG, moonSettings.lakeLessG);
		gl.uniform1f(_lakeMoreG, moonSettings.lakeMoreG);
		gl.uniform1f(_lakeLessB, moonSettings.lakeLessB);
		gl.uniform1f(_lakeMoreB, moonSettings.lakeMoreB);

		// moon without black background
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR);
		gl.blendEquation(gl.FUNC_ADD);

		gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX1);
		gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX1);
		gl.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX1);


		gl.bindBuffer(gl.ARRAY_BUFFER, CUBE_VERTEX1);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube_vertex1), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CUBE_FACES1);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_faces1), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, CUBE_VERTEX1);
		gl.vertexAttribPointer(_position1, 3, gl.FLOAT, false, 4 * (3+2), 0);
		gl.vertexAttribPointer(_uv, 2, gl.FLOAT, false,4*(3+2),3*4);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CUBE_FACES1);

		gl.uniform1i(_u_image0, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textures[0]);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		gl.uniform1i(_u_image1, 1);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, textures[1]);

		gl.uniform1i(_image1Load, 1);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		gl.flush();
		moonAndLakeTex = canvasBackLakeWithMoon;

		// clean memory - important!!
		gl.deleteTexture(textures[0]);
		gl.deleteTexture(textures[1]);
		gl.deleteBuffer(CUBE_VERTEX1);
		gl.deleteBuffer(CUBE_FACES1);
	}
}

main();

export { moonAndLakeTex, moonSettings };
