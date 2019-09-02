attribute vec3 position;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;
attribute vec2 uv;
varying vec2 vUV;

void main(void) {
    vUV = uv;
    gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1);
}
