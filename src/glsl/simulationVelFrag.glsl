#define PI 3.1415926535897932384626433832795
#define deltaTime ( 1.0 / 60.0 )

uniform float uTime;
uniform vec4 bounds;
uniform vec2 boundsZ;
uniform float maxVelocity;
uniform float speedRange;

struct touchData {

    vec3 pos;
    float force;
    float speed;

};

uniform touchData touchDatas[ 5 ];

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 posData = texture2D( texturePosition, uv );
    vec3 pos = posData.xyz;
    float t = posData.w;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;

    vec3 acc = vec3( 0 );
    //constrain to screen bounds
    if( pos.x < bounds[ 0 ] ) {

        acc.x = 1.0;
        
    }
    if( pos.x > bounds[ 1 ] ) {

        acc.x = -1.0;
        
    }
    if( pos.y < bounds[ 2 ] ) {

        acc.y = 1.0;
        
    }
    if( pos.y > bounds[ 3 ] ) {

        acc.y = -1.0;
        
    }
    if( pos.z < boundsZ[ 0 ] ) {

        acc.z = 1.0;
        
    }
    if( pos.z > boundsZ[ 1 ] ) {

        acc.z = -1.0;
        
    }

    float windForce = 0.2;
    float windMaxDist = 25.0;
    float theta = uTime * 0.08;

    vec3 windPos = vec3( -20.0, 0.0, -20.0 );
    vec2 windDir = vec2( cos( theta ), sin( theta ) );
    float windDist = length( pos.xyz - windPos.xyz );
    if( windDist < windMaxDist ) {

        acc.xy += windDir * ( windMaxDist - windDist ) * windForce;

    }

    windPos = vec3( 20.0, 0.0, 20.0 );
    windDir = vec2( cos( theta + PI ), sin( theta + PI ) );
    windDist = length( pos.xyz - windPos.xyz );
    if( windDist < windMaxDist ) {

        acc.xy += windDir * ( windMaxDist - windDist ) * windForce;

    }

    windPos = vec3( 0.0, 0.0, 0.0 );
    windDir = vec2( cos( theta + PI ), sin( theta + PI ) );
    windDist = length( pos.xyz - windPos.xyz );
    windMaxDist = 40.0;
    if( windDist < windMaxDist ) {

        acc.xy += normalize( pos.xy ) * ( windMaxDist - windDist ) * windForce * 0.01;

    }

    vel += acc * deltaTime;
    float speed = length( vel );
    if( speed < 0.2 ){

        vel = normalize( vel ) * 0.2;

    }
    float max = mix( maxVelocity, maxVelocity * 3.0, t );
    if( speed > max ){

        vel = normalize( vel ) * max;

    }

    float touchDist = 10.0;
    vec2 push = vec2( 0.0 );
    for( int i = 0; i < 5; i++ ){

        float dist = distance( touchDatas[ i ].pos.xy, pos.xy );
        push += normalize( pos.xy - touchDatas[ i ].pos.xy ) * smoothstep( touchDist, touchDist * 0.25, dist ) * touchDatas[ i ].force;

    }
    vel += vec3( push, 0.0 ) * -10.0;

    gl_FragColor = vec4( vel, t );

}