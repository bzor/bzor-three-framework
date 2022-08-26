import { gsap } from 'gsap';
import { WEBGL } from './util/WebGL.js';
import { BzorThree } from './util/BzorThree.js';
import { Main } from './Main.js';

import "./style.css";

//
//check query params/hash
//
const showDebug = window.location.hash == "#debug";

//
//config gsap
//
gsap.defaults( { overwrite: "auto" } );
//register plugins
//gsap.registerPlugin( DrawSVGPlugin );

//
//main
//
let main;
//

//
//check webGL
//
if( WEBGL.isWebGLAvailable() ) {

  console.log( "webGL available" );
  init();

} else {

  console.log( "webGL not available" );

}

//
//entry point
//
function init() {

  main = new Main( showDebug );

}