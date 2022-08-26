
varying vec4 vCol;

void main() {

    float dist = length( gl_PointCoord - vec2( 0.5, 0.5 ) );

    if( dist > 0.5 ){

        discard;

    }

    gl_FragColor = LinearTosRGB( vCol );

}