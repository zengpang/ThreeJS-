#extension GL_OES_standard_derivatives:enable
precision highp float;
precision highp int;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

uniform vec3 cameraPosition;
uniform float time;
uniform vec3 color;
uniform vec3 lightPosition;

uniform vec3 _mainColor;
uniform sampler2D _mainTex;
uniform sampler2D _normalTex;
uniform vec2 tilling;

uniform sampler2D _aoTex;
uniform float _aoAdjust;

uniform samplerCube _cubeMapTex;
uniform float _cubeMapinit;
uniform vec4 _cubeMapTex_HDR;

uniform sampler2D _roughnessMap;
uniform float _roughness;
uniform float _roughnessContrast;
uniform float _roughnessInit;
uniform float _roughnessMin;
uniform float _roughnessMax;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vUv2;
varying vec3 vTangent;
vec3 saturate(vec3 In)
{
    return clamp(In,0.,1.);
}
vec3 ACETompping(vec3 x)
{
    float a=2.51;
    float b=.03;
    float c=2.43;
    float d=.59;
    float e=.14;
    return saturate((x*(a*x+b))/(x*(c*x+d)+e));
}
vec4 lerp(vec4 a,vec4 b,vec4 w)
{
    return a+w*(b-a);
    
}

mat3 cotangent_frame(vec3 N,vec3 p,vec2 uv)
{
    // get edge vectors of the pixel triangle
    vec3 dp1=dFdx(p);
    vec3 dp2=dFdy(p);
    vec2 duv1=dFdx(uv);
    vec2 duv2=dFdy(uv);
    
    // solve the linear system
    vec3 dp2perp=cross(dp2,N);
    vec3 dp1perp=cross(N,dp1);
    vec3 T=dp2perp*duv1.x+dp1perp*duv2.x;
    vec3 B=dp2perp*duv1.y+dp1perp*duv2.y;
    
    // construct a scale-invariant frame
    float invmax=inversesqrt(max(dot(T,T),dot(B,B)));
    return mat3(T*invmax,B*invmax,N);
}

vec3 ComputeNormal(vec3 nornal,vec3 viewDir,vec2 uv,sampler2D normalMap)
{
    // assume N, the interpolated vertex normal and
    // V, the view vector (vertex to eye)
    vec3 map=texture2D(normalMap,uv).xyz;
    
    map=map*255./127.-128./127.;
    
    mat3 TBN=cotangent_frame(nornal,-viewDir,uv);
    return normalize(TBN*map);
    return(texture2D(normalMap,vUv).rgb-.5)*2.;
}
void main(){
    vec3 worldPosition=(modelMatrix*vec4(vPosition,1.)).xyz;
    
    //向量声明
    
    vec3 vDir=normalize(cameraPosition-worldPosition);
    vec3 nDir=ComputeNormal(vNormal,vDir,vUv*tilling,_normalTex);
    
    //向量操作
    
    vec3 rvDir=reflect(-vDir,nDir);
    float NdotV=dot(nDir,vDir);
    
    //贴图操作
    vec4 aoTex=texture2D(_aoTex,vUv);
    vec4 a1=vec4(1,1,1,1);
    vec4 adjusts=vec4(_aoAdjust,_aoAdjust,_aoAdjust,_aoAdjust);
    aoTex=lerp(a1,aoTex,adjusts);
    
    vec4 mainTex=texture2D(_mainTex,vUv);
    vec4 roughnessTex=texture2D(_roughnessMap,vUv);
    
    vec3 worldNormal=normalize(vec3(modelMatrix*vec4(vNormal,0.)));
    vec3 lightVector=normalize(lightPosition-worldPosition);
    float brightness=dot(worldNormal,lightVector);
    gl_FragColor=vec4(color*brightness,1.);
    
}