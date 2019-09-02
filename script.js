"use strict";
import { moonAndLakeTex, moonSettings } from './moonAndLake.js';
import {loadImagesAndShaders} from './pureFunctions/loadImagesAndShaders.js'
import createCanvas from './pureFunctions/webGL/creteCanvas.js'
import {getProgram} from "./pureFunctions/webGL/programs.js";
import TexImage2dOptions from "./classes/TexImage2dOptions.js";
import TexParameteriOptions from "./classes/TexParameteriOptions.js";
import TexturesPixelStoreiOptions from "./classes/TexturesPixelStoreiOptions.js";
import {prepareCubeTextures} from "./pureFunctions/webGL/textures.js";
import {cube_faces, cube_vertex} from "./pureFunctions/webGL/geometry.js";
import {separateImagesAndShaders} from "./pureFunctions/loadImagesAndShaders.js";

const shader_vertex_sourceUrl = './pureFunctions/shaders/shader_vertex_source.glsl';
const shader_fragment_sourceUrl = './pureFunctions/shaders/shader_fragment_source.glsl';

const lakeUrlImages = [
  "textures/lake/right.jpg", //GL_TEXTURE_CUBE_MAP_POSITIVE_X	Right
  "textures/lake/left.jpg", //GL_TEXTURE_CUBE_MAP_NEGATIVE_X	Left
  "textures/lake/top.jpg", //GL_TEXTURE_CUBE_MAP_POSITIVE_Y	Top
  "textures/lake/bottom.jpg", //GL_TEXTURE_CUBE_MAP_NEGATIVE_Y	Bottom
  "textures/lake/front.jpg", //GL_TEXTURE_CUBE_MAP_POSITIVE_Z	Back
];



export function mainCube(moonChange, NewTHETA, NewPHI, x, y, resizeCanva) {
  loadImagesAndShaders([...lakeUrlImages, shader_vertex_sourceUrl, shader_fragment_sourceUrl]).
  then((imagesAndShaders) => {
    const {shaders, images} = separateImagesAndShaders(imagesAndShaders);
    renderCube(images, moonChange, NewTHETA, NewPHI, x, y, resizeCanva, ...shaders)})
}

let THETA,
		PHI,
		old_x,
		old_y;


function renderCube(images, moonChange, NewTHETA, NewPHI, x, y, resizeCanva, shader_vertex_source, shader_fragment_source) {
  const canvasOptions = {
    preserveDrawingBuffer: true
  };
  const [CANVAS, GL] = createCanvas(
    "canvas",
    "webgl",
    canvasOptions,
    `canvas.clientWidth`,
    `canvas.clientHeight`);

	/*========================= CAPTURE MOUSE EVENTS ========================= */
	let drag = false;

		old_x = x;
		old_y = y;
	const mouseDown = function(e) {
		drag = true;
		old_x = e.pageX;
		old_y = e.pageY;
		e.preventDefault();
		return false;
	};

	const mouseUP = function(e) {
		drag = false;
	};

	const mouseMove = function(e) {
		if (!drag) return false;

		function move(pageX, pageY) {
			let dX = pageX - old_x;
			let dY = pageY - old_y;
			THETA -= dX * 2 * Math.PI / CANVAS.width;
			PHI -= dY * 2 * Math.PI / CANVAS.height;
			old_x = pageX;
			old_y = pageY;
		}
		move(e.pageX, e.pageY);
		if (cube_texture !== undefined || resizeCanva === true) { animate();}
		e.preventDefault();
	};

	CANVAS.addEventListener("mousedown", mouseDown, false);
	CANVAS.addEventListener("mouseup", mouseUP, false);
	CANVAS.addEventListener("mouseout", mouseUP, false);
	CANVAS.addEventListener("mousemove", mouseMove, false);

	const SHADER_PROGRAM = getProgram(GL, shader_vertex_source, shader_fragment_source);

	THETA = NewTHETA || 0;
	PHI= NewPHI || 0;

	let _Pmatrix,
			_Vmatrix,
			_Mmatrix,
			_sampler,
			_position;

		_Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
		_Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
		_Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

		_sampler = GL.getUniformLocation(SHADER_PROGRAM, "sampler");
		_position = GL.getAttribLocation(SHADER_PROGRAM, "position");

		GL.enableVertexAttribArray(_position);

		GL.useProgram(SHADER_PROGRAM);

	/*========================= THE CUBE ========================= */

	const CUBE_VERTEX = GL.createBuffer();
	GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
	GL.bufferData(GL.ARRAY_BUFFER, cube_vertex, GL.STATIC_DRAW);

	const CUBE_FACES = GL.createBuffer();
	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
	GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, cube_faces, GL.STATIC_DRAW);

	const PROJMATRIX = LIBS.get_projection(moonSettings.zoom, CANVAS.width/CANVAS.height, 1, 100),
		MOVEMATRIX = LIBS.get_I4(),
		VIEWMATRIX = LIBS.get_I4();

	LIBS.translateZ(VIEWMATRIX, -1);

	/*========================= TEXTURE ========================= */

	    const texImage2dOptions = new TexImage2dOptions(
      GL,
      GL.TEXTURE_CUBE_MAP
    );
    const texParameteriOptions = new TexParameteriOptions(
      GL,
      GL.CLAMP_TO_EDGE,
      GL.CLAMP_TO_EDGE,
      GL.LINEAR_MIPMAP_LINEAR,
      GL.LINEAR
    );
    const texturesPixelStoreiOptions = new TexturesPixelStoreiOptions(
      GL,
      false,
      false
    );

	let cube_texture;
	if (moonChange === true) {
		GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X+5, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, moonAndLakeTex);
	} else {
	  const allIamges = [...images, moonAndLakeTex ];
		cube_texture =  prepareCubeTextures(
      allIamges,
      texImage2dOptions,
      texParameteriOptions,
      texturesPixelStoreiOptions);
	}

		/*========================= DRAWING ========================= */
	function  animate() {
		GL.useProgram(SHADER_PROGRAM); //necessary to set uniformMatrix4fv to current program when we change input range and move cube
		GL.enable(GL.DEPTH_TEST);
		GL.depthFunc(GL.LEQUAL);
		GL.clearColor(0.0, 0.0, 0.0, 0.0);
		GL.clearDepth(1.0);

		LIBS.set_I4(MOVEMATRIX);
		LIBS.rotateY(MOVEMATRIX, THETA);
		LIBS.rotateX(MOVEMATRIX, PHI);

		GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

		GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
		GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
		GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

		GL.activeTexture(GL.TEXTURE0);
		GL.uniform1i(_sampler, 0);

		GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
		GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4*3, 0);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
		GL.drawElements(GL.TRIANGLES, 36, GL.UNSIGNED_SHORT, 0);
		GL.flush();
		if (moonChange === true) {
			GL.deleteTexture(cube_texture); 	// clean memory
		}
	}

	animate();

}

export {THETA, PHI, old_x, old_y}