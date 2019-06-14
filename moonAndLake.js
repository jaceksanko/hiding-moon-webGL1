"use strict";
import { mainCube, THETA, PHI, old_x, old_y } from './script.js';
let moonAndLakeTex;
let moonSettings;

function loadImage(url, callback) {
	const image = new Image();
	image.src = url;
	image.onload = callback;
	return image;
}

function loadImages(urls, callback) {
	const images = [];
	let imagesToLoad = urls.length;
	const onImageLoad = function() {
		--imagesToLoad;
		if (imagesToLoad == 0) {
			callback(images);
			mainCube(); // when images to texture mooonLake is loaded then draw skybox
		}
	};

	for (let ii = 0; ii < imagesToLoad; ++ii) {
		const image = loadImage(urls[ii], onImageLoad);
		images.push(image);
	}
}

function main() {
	loadImages([
		"textures/lake/back.jpg",
		"textures/moon.jpg"
	], render);
}

function render(images) {

	const canvasTexture = document.getElementById("cool_canvas");
	const gl = canvasTexture.getContext("webgl", {
		preserveDrawingBuffer: true,
		alpha: false,
		premultipliedAlpha: false  // Ask for non-premultiplied alpha
	});
	// this code is not necessary when in index.html  "cool_canvas" have width="2048" height="2048"
	/*let width = gl.canvas.width;
	let height = gl.canvas.height;
	canvasTexture.width = width;
	canvasTexture.height = height;*/

		/*========================= SHADERS1 ========================= */
	const shader_vertex_source1 = `
		attribute vec3 position;
		uniform mat4 Pmatrix;
		uniform mat4 Vmatrix;
		uniform mat4 Mmatrix;
		attribute vec2 uv;
		varying vec2 vUV;
	
		void main(void) {
			vUV = uv;
			gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1);
		}`;

	const shader_fragment_source1 = `
		precision mediump float;
		uniform sampler2D u_image0;
		uniform sampler2D u_image1;
		uniform bool image1Load;
		uniform float moonSize;
		uniform vec2 moonMove;
		uniform vec2 moonMoveSizeCorrection;
		
		uniform float moonLessR;
		uniform float moonMoreR;
		uniform float moonLessG;
		uniform float moonMoreG;
		uniform float moonLessB;
		uniform float moonMoreB;
		uniform float lakeLessR;
		uniform float lakeMoreR;
		uniform float lakeLessG;
		uniform float lakeMoreG;
		uniform float lakeLessB;
		uniform float lakeMoreB;
				
		varying vec2 vUV;
	
		void main(void) {
			vec4 color0 = texture2D(u_image0, vUV);
				
			gl_FragColor = color0;
			if (image1Load) {
			vec4 color1 = texture2D(u_image1, (vUV - moonMove) * moonSize - moonMoveSizeCorrection );
				if (color0.r < lakeLessR &&
						color0.r > lakeMoreR &&
						color0.g < lakeLessG &&
						color0.g > lakeMoreG &&
				 		color0.b < lakeLessB &&
				 		color0.b > lakeMoreB &&

				 		color1.r < moonLessR &&
						color1.r > moonMoreR &&
						color1.g < moonLessG &&
						color1.g > moonMoreG &&
				 		color1.b < moonLessB &&
				 		color1.b > moonMoreB)
				discard;
				gl_FragColor = color1;
			}
		}`;

	const get_shader1 = function (source, type, typeString) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert("ERROR IN " + typeString + "SHADER : " + gl.getShaderInfoLog(shader));
			return false;
		}
		return shader;
	};

	const shader_vertex1= get_shader1(shader_vertex_source1, gl.VERTEX_SHADER, "VERTEX");
	const shader_fragment1 = get_shader1(shader_fragment_source1, gl.FRAGMENT_SHADER, "FRAGMENT");

	/*========================Moon settings ======================*/
	moonSettings = {
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
		const SHADER_PROGRAM1 = gl.createProgram();
		gl.attachShader(SHADER_PROGRAM1, shader_vertex1);
		gl.attachShader(SHADER_PROGRAM1, shader_fragment1);

		gl.linkProgram(SHADER_PROGRAM1);

		const _Pmatrix1 = gl.getUniformLocation(SHADER_PROGRAM1, "Pmatrix");
		const _Vmatrix1 = gl.getUniformLocation(SHADER_PROGRAM1, "Vmatrix");
		const _Mmatrix1 = gl.getUniformLocation(SHADER_PROGRAM1, "Mmatrix");

		const _uv = gl.getAttribLocation(SHADER_PROGRAM1, "uv");
		const _u_image0 = gl.getUniformLocation(SHADER_PROGRAM1, "u_image0");
		const _u_image1 = gl.getUniformLocation(SHADER_PROGRAM1, "u_image1");
		const _position1 = gl.getAttribLocation(SHADER_PROGRAM1, "position");

		const _image1Load = gl.getUniformLocation(SHADER_PROGRAM1, "image1Load");
		const _moonSize = gl.getUniformLocation(SHADER_PROGRAM1, "moonSize");
		const _moonMove = gl.getUniformLocation(SHADER_PROGRAM1, "moonMove");

		const _moonMoveSizeCorrection = gl.getUniformLocation(SHADER_PROGRAM1, "moonMoveSizeCorrection");

		const _moonLessR = gl.getUniformLocation(SHADER_PROGRAM1, "moonLessR");
		const _moonMoreR = gl.getUniformLocation(SHADER_PROGRAM1, "moonMoreR");
		const _moonLessG = gl.getUniformLocation(SHADER_PROGRAM1, "moonLessG");
		const _moonMoreG = gl.getUniformLocation(SHADER_PROGRAM1, "moonMoreG");
		const _moonLessB = gl.getUniformLocation(SHADER_PROGRAM1, "moonLessB");
		const _moonMoreB = gl.getUniformLocation(SHADER_PROGRAM1, "moonMoreB");

		const _lakeLessR = gl.getUniformLocation(SHADER_PROGRAM1, "lakeLessR");
		const _lakeMoreR = gl.getUniformLocation(SHADER_PROGRAM1, "lakeMoreR");
		const _lakeLessG = gl.getUniformLocation(SHADER_PROGRAM1, "lakeLessG");
		const _lakeMoreG = gl.getUniformLocation(SHADER_PROGRAM1, "lakeMoreG");
		const _lakeLessB = gl.getUniformLocation(SHADER_PROGRAM1, "lakeLessB");
		const _lakeMoreB = gl.getUniformLocation(SHADER_PROGRAM1, "lakeMoreB");

		gl.enableVertexAttribArray(_uv);
		gl.enableVertexAttribArray(_position1);

		gl.useProgram(SHADER_PROGRAM1);

		function sizeSquareImage(x, y, z, moveX, moveY) {
			return [
				-x+moveX,-y+moveY,-z,    0,0,
				x+moveX,-y+moveY,-z,     1,0,
				x+moveX, y+moveY,-z,     1,1,
				-x+moveX, y+moveY,-z,    0,1
			]
		}

		const cube_vertex1 = [
			...sizeSquareImage(1, 1, 1, 0, 0),
		];

		const cube_faces1 = [
			0,1,2,
			0,2,3,
		];

		const PROJMATRIX1 = LIBS.get_projection(40, canvasTexture.width/canvasTexture.height, 1, 100),
					MOVEMATRIX1 = LIBS.get_I4(),
					VIEWMATRIX1 = LIBS.get_I4();

		LIBS.translateZ(VIEWMATRIX1, -0.373);
		LIBS.set_I4(MOVEMATRIX1);

		/*========================= TEXTURE1 ========================= */
		let textures = [];

		for (let ii = 0; ii < images.length; ++ii) {
			const texture = gl.createTexture();

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

			// Set the parameters so we can render any size image.
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

			// Upload the image into the texture.
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

			textures.push(texture);
		}

		const CUBE_VERTEX1 = gl.createBuffer();
		const CUBE_FACES1 = gl.createBuffer();

		/*========================= DRAWING ========================= */
		gl.viewport(0.0, 0.0, canvasTexture.width, canvasTexture.height);
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

		gl.uniformMatrix4fv(_Pmatrix1, false, PROJMATRIX1);
		gl.uniformMatrix4fv(_Vmatrix1, false, VIEWMATRIX1);
		gl.uniformMatrix4fv(_Mmatrix1, false, MOVEMATRIX1);


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
		moonAndLakeTex = canvasTexture;

		// clean memory - important!!
		gl.deleteTexture(textures[0]);
		gl.deleteTexture(textures[1]);
		gl.deleteBuffer(CUBE_VERTEX1);
		gl.deleteBuffer(CUBE_FACES1);
	}
}

main();

export { moonAndLakeTex, moonSettings };
