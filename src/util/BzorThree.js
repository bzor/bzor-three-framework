
import * as THREE from 'three';
import { Main } from './../Main.js';
import { BzorThreeBG } from './BzorThreeBG.js';
import { MathUtils } from 'three';
import { ColorManagement } from 'three';
import {gsap} from 'gsap';

export class BzorThree {

	//
	//screen
	//
	screenWidth;
	screenHeight;
	aspect;
	worldScreenSize = { x: 0, y: 0 };
	pixelRatio;

	//
	//camera
	//
	cameraZ = 75.0;
	cameraFarPlane = 200.0;
	fov = 60;
	fogNear;
	fogFar;
	fogDist = 15.0;
	currentFov;
	cameraPos = new THREE.Vector3();

	firstFrame = true;

	//background
	bg;


	constructor() {

		//main
		this.main = new Main();

		//bg
		this.bg = new BzorThreeBG();

		//inits
		this.createRenderer();
		this.initDOM();
		this.initScene();
		this.sizeCanvas();

		//camera
		this.currentFov = this.fov;

	}

	createRenderer() {

		console.log( "renderer init" );

		//minimum pixelRatio of 1, max of 2 (looks fine on iPhone with 3)
		const pixelRatio = Math.max( 1.0, Math.min( 2.0, window.devicePixelRatio ) );
		this.pixelRatio = pixelRatio;
		this.main.debugPanel.track( this, "pixelRatio" );
		console.log( `bzorThree: pixelRatio: ${pixelRatio}` );

		//disable antialiasing if retina
		const aa = (pixelRatio > 1)  ? false : true;

		this.renderer = new THREE.WebGLRenderer( {
			antialias: aa,
			//powerPreference: "high-performance"
		} );
		this.renderer.shadowMap.enabled = false;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.domElement.id = "three-canvas";
		this.renderer.domElement.setAttribute( "style", "touch-action: none;" );

	}

	initDOM() {

		this.contain = document.createElement( "div" );
		this.contain.className = "contain";
		this.contain.id = "contain";
		this.contain.appendChild( this.renderer.domElement );
		document.body.prepend( this.contain );

	}

	initScene() {

		//camera
		this.camera = new THREE.PerspectiveCamera( 50, 1, 1, this.cameraFarPlane );
		this.cameraPos.z = this.cameraZ;
		this.camera.position.set( this.cameraPos.x, this.cameraPos.y, this.cameraPos.z );
		this.camera.lookAt( 0, 0, 0 );

		//scene
		this.scene = new THREE.Scene();
		this.fogNear = this.cameraZ - this.fogDist / 2.0;
		this.fogFar = this.cameraZ + this.fogDist / 2.0;
		this.scene.fog = new THREE.Fog( 0xFF00FF, this.fogNear, this.fogFar );

		//init noise BG
		this.bg.init( this.scene );

	}

	sizeCanvas() {


		const pixelRatio = Math.max( 1.0, Math.min( 2.0, window.devicePixelRatio ) );
		this.pixelRatio = pixelRatio;

		const elem = this.renderer.domElement;
		this.screenWidth = elem.clientWidth;
		this.screenHeight = elem.clientHeight;

		this.aspect = this.screenWidth / this.screenHeight;

		//resize drawingbuffer (aspect to smaller width or height)
		const pixelRatioMult = pixelRatio;
		const needResize = elem.width != this.screenWidth * pixelRatioMult || elem.height != this.screenHeight * pixelRatioMult;
		if ( needResize ){

			this.camera.aspect = this.screenWidth / this.screenHeight;

			if ( this.camera.aspect < 1.0 ) {
				const cameraHeight = Math.tan( MathUtils.degToRad( this.fov / 2.0 ) );
				const newHeight = cameraHeight / this.camera.aspect;
				this.camera.fov = MathUtils.radToDeg( Math.atan( newHeight ) ) * 2.0;
			} else {
				this.camera.fov = this.fov;
			}

			this.camera.updateProjectionMatrix();
			const width = this.screenWidth * pixelRatio;
			const height = this.screenHeight * pixelRatio;
			this.renderer.setSize( width, height, false );

			this.setWorldScreenSize();

			this.bg.updateScale( this.worldScreenSize.x * 0.5, this.worldScreenSize.y * 0.5 );

			console.log( "THREE resize" );

		}

		this.currentFov = this.camera.fov;

	}

	render( time ) {

		this.worldHeight = Math.tan( MathUtils.degToRad( this.currentFov / 2.0 ) ) * this.camera.position.z;
		this.worldWidth = this.worldHeight * this.camera.aspect;

		this.bg.update( time );

		this.sizeCanvas();

		this.renderer.render( this.scene, this.camera );

		this.firstFrame = false;

	}

	setWorldScreenSize() {

		this.worldScreenSize.y = 2.0 * Math.tan( ( ( this.camera.fov * Math.PI ) / 180 ) / 2 ) * this.cameraZ;
		this.worldScreenSize.x = this.worldScreenSize.y * this.camera.aspect;

	}

	startCapture( w, h ) {

		this.isCapturing = true;
		this.captureSize.w = w;
		this.captureSize.h = h;

	}

}