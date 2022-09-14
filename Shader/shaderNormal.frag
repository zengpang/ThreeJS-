#ifdef OBJECTSPACE_NORMALMAP
tnormal=texture2D(normalMap,vUv).xyz*2.-1.;
\n\t#ifdef FLIP_SIDED
\n\t\tnormal=-normal;
\n\t#endif
\n\t#ifdef DOUBLE_SIDED
\n\t\tnormal=normal*faceDirection;
\n\t#endif
\n\tnormal=normalize(normalMatrix*normal);
\n#elif defined(TANGENTSPACE_NORMALMAP)
\n\tvec3 mapN=texture2D(normalMap,vUv).xyz*2.-1.;
\n\tmapN.xy*=normalScale;
\n\t#ifdef USE_TANGENT
\n\t\tnormal=normalize(vTBN*mapN);
\n\t#else\n\t\
tnormal=perturbNormal2Arb(-vViewPosition,normal,mapN,faceDirection);
\n\t#endif\n
#elif defined(USE_BUMPMAP)
\n\tnormal=perturbNormalArb(-vViewPosition,normal,dHdxy_fwd(),faceDirection);
#endif
vec3 tangent = normalize( vTangent );
mat3 vTBN = mat3( tangent, bitangent, normal );

float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
vec3 normal = normalize( cross( fdx, fdy ) );
#else
tvec3 normal = normalize( vNormal );
#ifdef DOUBLE_SIDED
tnormal = normal * faceDirection;
#endif
#ifdef USE_TANGENT
vec3 tangent = normalize( vTangent );
vec3 bitangent = normalize( vBitangent );
#ifdef DOUBLE_SIDED
tangent = tangent * faceDirection;
bitangent = bitangent * faceDirection;
#endif
#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
mat3 vTBN = mat3( tangent, bitangent, normal );
#endif
#endif
#endif
vec3 geometryNormal = normal;