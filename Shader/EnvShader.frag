varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec2 vUv;
void main()
{
    vNormal=normal;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vPosition =vec4( position,1.0);
}