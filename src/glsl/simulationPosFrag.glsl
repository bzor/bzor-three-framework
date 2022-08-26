#define deltaTime ( 1.0 / 60.0 )

uniform float uTime;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 tPos = texture2D( texturePosition, uv );
    vec3 pos = tPos.xyz;
    float t = tPos.w;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;

    pos += vel * deltaTime;

    gl_FragColor = vec4( pos, t );

}