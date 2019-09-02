precision mediump float;
uniform samplerCube sampler;
varying vec3 vUV;

void main(void) {
    vec4 c = textureCube(sampler, vUV);
    gl_FragColor = vec4(c.rgb, 1.0);
}