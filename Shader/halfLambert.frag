#ifdef GL_ES
precision mediump float;
#endif
varying vec2 vUv;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3      iResolution;           // viewport resolution (in pixels)
uniform float     iTime;                 // shader playback time (in seconds)
uniform float     iTimeDelta;            // render time (in seconds)
uniform int       iFrame;                // shader playback frame
uniform float     iChannelTime[4];       // channel playback time (in seconds)
uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
uniform vec4      iDate;                 // (year, month, day, time in seconds)
uniform float     iSampleRate;           // sound sample rate (i.e., 44100)
float lerp(float a, float b, float w)
{
  return a + w*(b-a);
}
void Remap(vec4 In, vec2 InMinMax, vec2 OutMinMax, out vec4 Out)
{
    Out = OutMinMax.x + (In - InMinMax.x) * (OutMinMax.y - OutMinMax.x) / (InMinMax.y - InMinMax.x);
}
void stature(vec4 In,out vec4 Out)
{
    Out=clamp(In,0.0,1.0);
}
void main()
{
     vec2 st = gl_FragCoord.xy / u_resolution;
     gl_FragColor = vec4(st, sin(u_time / 10.0), 1.0);
}