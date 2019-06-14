"use strict";
import { moonAndLakeTex, moonSettings } from './moonAndLake.js';

function loadImage(url, callback) {
	const image = new Image();
	image.src = url;
	image.onload = callback;
	return image;
}
const images = [];
function loadImages(urls, callback, moonChange, NewTHETA, NewPHI, x,y, resizeCanva) {
		let imagesToLoad = urls.length;
	const onImageLoad = function() {
		--imagesToLoad;
		if (imagesToLoad == 0) {
			callback(images, moonChange,NewTHETA, NewPHI, x, y, resizeCanva);
		}
	};

	for (let ii = 0; ii < imagesToLoad; ++ii) {
		const image = loadImage(urls[ii], onImageLoad);
		images.push(image);
	}
}

export function mainCube(moonChange, NewTHETA, NewPHI, x, y, resizeCanva) {
	if (images.length == 0) {
		loadImages([
			"textures/lake/right.jpg", //GL_TEXTURE_CUBE_MAP_POSITIVE_X	Right
			"textures/lake/left.jpg", //GL_TEXTURE_CUBE_MAP_NEGATIVE_X	Left
			"textures/lake/top.jpg", //GL_TEXTURE_CUBE_MAP_POSITIVE_Y	Top
			"textures/lake/bottom.jpg", //GL_TEXTURE_CUBE_MAP_NEGATIVE_Y	Bottom
			"textures/lake/front.jpg", //GL_TEXTURE_CUBE_MAP_POSITIVE_Z	Back
		], renderCube, moonChange);
	} else {
		renderCube(images, moonChange, NewTHETA, NewPHI, x, y, resizeCanva);
	}
}

let THETA,
		PHI,
		old_x,
		old_y;


function renderCube(images, moonChange, NewTHETA, NewPHI, x, y, resizeCanva) {
	const CANVAS = document.getElementById("canvas");

	/*========================= GET WEBGL CONTEXT ========================= */
	let GL;
	try {
		GL = CANVAS.getContext("webgl");
	} catch (e) {
		alert("You are not webgl compatible :(");
		return false;
	}

	let width = GL.canvas.clientWidth;
	let height = GL.canvas.clientHeight;
	CANVAS.width = width;
	CANVAS.height = height;

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

	/*========================= SHADERS ========================= */
	const shader_vertex_source = "\n\
	attribute vec3 position;\n\
	uniform mat4 Pmatrix;\n\
	uniform mat4 Vmatrix;\n\
	uniform mat4 Mmatrix;\n\
	varying vec3 vUV;\n\
	void main(void) {\n\
	gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1);\n\
	vUV = position;\n\
	}";

	const shader_fragment_source = "\n\
	precision mediump float;\n\
	uniform samplerCube sampler;\n\
	varying vec3 vUV;\n\
	void main(void) {\n\
	vec4 c = textureCube(sampler, vUV);\n\
	gl_FragColor = vec4(c.rgb, 1.0);\n\
	}";

	const get_shader = function (source, type, typeString) {
		const shader = GL.createShader(type);
		GL.shaderSource(shader, source);
		GL.compileShader(shader);
		if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
			alert("ERROR IN" + typeString + " SHADER : " + GL.getShaderInfoLog(shader));
			return false;
		}
		return shader;
	};

	const shader_vertex = get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
	const shader_fragment = get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

	THETA = NewTHETA || 0;
	PHI= NewPHI || 0;

	let _Pmatrix,
			_Vmatrix,
			_Mmatrix,
			_sampler,
			_position;

		const SHADER_PROGRAM = GL.createProgram();

		GL.attachShader(SHADER_PROGRAM, shader_vertex);
		GL.attachShader(SHADER_PROGRAM, shader_fragment);

		GL.linkProgram(SHADER_PROGRAM);
		GL.deleteShader(shader_vertex);
		GL.deleteShader(shader_fragment);

		_Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
		_Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
		_Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

		_sampler = GL.getUniformLocation(SHADER_PROGRAM, "sampler");
		_position = GL.getAttribLocation(SHADER_PROGRAM, "position");

		GL.enableVertexAttribArray(_position);

		GL.useProgram(SHADER_PROGRAM);

	/*========================= THE CUBE ========================= */
	const cube_vertex = [
		//front
		-1,-1,-1,
		1,-1,-1,
		1, 1,-1,
		-1, 1,-1,
		//back
		-1,-1, 1,
		1,-1, 1,
		1, 1, 1,
		-1, 1, 1,
		//left
		-1,-1,-1,
		-1, 1,-1,
		-1, 1, 1,
		-1,-1, 1,
		//right
		1,-1,-1,
		1, 1,-1,
		1, 1, 1,
		1,-1, 1,
		//bottom
		-1,-1,-1,
		-1,-1, 1,
		1,-1, 1,
		1,-1,-1,
		//top
		-1, 1,-1,
		-1, 1, 1,
		1, 1, 1,
		1, 1,-1
	];

	const cube_faces = [
		0,1,2,
		0,2,3,

		4,5,6,
		4,6,7,

		8,9,10,
		8,10,11,

		12,13,14,
		12,14,15,

		16,17,18,
		16,18,19,

		20,21,22,
		20,22,23
	];

	const CUBE_VERTEX = GL.createBuffer();
	GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
	GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cube_vertex), GL.STATIC_DRAW);

	const CUBE_FACES = GL.createBuffer();
	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
	GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_faces), GL.STATIC_DRAW);

	const PROJMATRIX = LIBS.get_projection(moonSettings.zoom, CANVAS.width/CANVAS.height, 1, 100),
		MOVEMATRIX = LIBS.get_I4(),
		VIEWMATRIX = LIBS.get_I4();

	LIBS.translateZ(VIEWMATRIX, -1);

	/*========================= TEXTURE ========================= */
	function isPowerOf2(value) {
		return (value & (value - 1)) == 0;
	}

	function textureLoader(images) {
		const texture = GL.createTexture();
		GL.bindTexture(GL.TEXTURE_CUBE_MAP, texture);
		GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
		GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, false);

		for (let i =0; i < images.length+1; i++) {
			if (i === 5) {
				GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X+5, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, moonAndLakeTex);
				(isPowerOf2(images[0].width) && isPowerOf2(images[0].height))?
					GL.generateMipmap(GL.TEXTURE_CUBE_MAP) :
					console.log("Image width and/or height is not a power of 2");
			} else {
				GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, images[i]);
			}
			if (i < 5) {
				(isPowerOf2(images[i].width) && isPowerOf2(images[i].height))?
					GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR) :
					GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
			}
		}

		return texture
	}
	let cube_texture;
	if (moonChange === true) {
		GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X+5, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, moonAndLakeTex);
	} else {
		cube_texture =  textureLoader(images);
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