uniform mat4 modelMatrix;
uniform vec3 mainColor;
uniform vec3 lightPosition;
uniform sampler2D mainTex;
varying vec4 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
uniform float fresnelPow;
uniform vec3 fresnelColor;
uniform float fresnelPower;
void main()
{
    vec3 worldPosition=(modelMatrix*vec4(vPosition)).xyz;
    vec3 worldNormal=normalize(vec3(modelMatrix*vec4(vNormal,0.)));
    vec3 lightVector=normalize(lightPosition-worldPosition);
    vec3 vdir=normalize(cameraPosition-worldPosition);
    float halfLambert=dot(worldNormal,lightVector)*.5+.5;
    vec4 finaldiffuse=vec4(halfLambert,halfLambert,halfLambert,1.)*vec4(mainColor,1.);
   
    gl_FragColor=min(finaldiffuse,1.0);
}