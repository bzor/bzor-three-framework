
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

uniform float uTime;
uniform float pSize;
uniform float pixelRatio;
uniform vec3 col1;
uniform vec3 col2;
uniform vec3 col3;
uniform vec3 col4;
uniform float fogNear;
uniform float fogFar;
uniform vec3 cameraPos;

varying vec4 vCol;

void main() {

    vec4 posData = texture2D( texturePosition, uv );
    vec3 pos = posData.xyz;
    float t = posData.w;

    vec3 vel = texture2D( textureVelocity, uv ).xyz;

    vec3 worldPos = ( modelMatrix * vec4( pos, 1.0 ) ).xyz;
    vec4 mvPosition = viewMatrix * vec4( worldPos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    float depth = smoothstep( fogNear, fogFar, worldPos.z );
    vCol = mix( vec4( 0.013, 0.1, 1.0, 0.5 ), vec4( 0.2, 0.04, 0.02, 1.0 ), depth );

    gl_PointSize = mix( pSize, pSize * 2.5, t );
    gl_PointSize *= ( 400.0 / - mvPosition.z );
    gl_PointSize = max( gl_PointSize, 1.0 ) * pixelRatio;

}