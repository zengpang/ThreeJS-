varying vec3 vViewPosition;
            varying vec3 vNormal;

            uniform int maxMipLevel;
            uniform samplerCube envMap;
            uniform float envMapIntensity;
            uniform float flipEnvMap;
            
            uniform float roughness;
            
            
            float pow2( const in float x ) {
                return x*x;
            }
            float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {
                return ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );
            }
            float getSpecularMIPLevel( const in float blinnShininessExponent, const in int maxMIPLevel ) {
                float maxMIPLevelScalar = float( maxMIPLevel );
                float desiredMIPLevel = maxMIPLevelScalar + 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );
                return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );
            }
            vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
                return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
            }
            vec3 getLightProbeIndirectRadiance( const in vec3 viewDir, const in vec3 normal, const in float blinnShininessExponent, const in int maxMIPLevel ) {
                vec3 reflectVec = reflect( -viewDir, normal );
                reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
                float specularMIPLevel = getSpecularMIPLevel( blinnShininessExponent, maxMIPLevel );
                
                vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
                vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );
                envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
                
                return envMapColor.rgb * envMapIntensity * .75;
            }
            vec3 getLightProbeIndirectIrradiance( const in vec3 normal, const in int maxMIPLevel ) {
                vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
                vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
                vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );
                
                return PI * envMapColor.rgb * envMapIntensity;
            }
            
            
            void main() {
                vec3 irradiance = getLightProbeIndirectIrradiance(normalize(vNormal), maxMipLevel );
                vec3 radiance = getLightProbeIndirectRadiance( normalize( vViewPosition ), normalize(vNormal), GGXRoughnessToBlinnExponent( roughness ), maxMipLevel );

                gl_FragColor = vec4( radiance, 1.0 );
            }
            