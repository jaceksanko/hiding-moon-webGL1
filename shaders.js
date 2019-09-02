export const shader_vertex_source1 = `
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

export const shader_fragment_source1 = `
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

export const shader_vertex_source = "\n\
	attribute vec3 position;\n\
	uniform mat4 Pmatrix;\n\
	uniform mat4 Vmatrix;\n\
	uniform mat4 Mmatrix;\n\
	varying vec3 vUV;\n\
	void main(void) {\n\
	gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1);\n\
	vUV = position;\n\
	}";

export const shader_fragment_source = "\n\
	precision mediump float;\n\
	uniform samplerCube sampler;\n\
	varying vec3 vUV;\n\
	void main(void) {\n\
	vec4 c = textureCube(sampler, vUV);\n\
	gl_FragColor = vec4(c.rgb, 1.0);\n\
	}";