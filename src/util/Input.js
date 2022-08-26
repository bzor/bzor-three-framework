
import * as THREE from 'three';
import { MathUtils } from 'three';
import EventEmitter from './EventEmitter.js';
import { Main } from './../Main.js';

export default class Input extends EventEmitter {

	interactionActive = false;
	logging = false;

	springElasticity = 0.96;
	springStrength = 0.00008;
	maxTouches = 5;

	touches = [];

	mainRotX = 0;
	mainRotY = 0;
	mainRotSpringVX = 0;
	mainRotSpringVY = 0;
	mainRotSpringAX = 0;
	mainRotSpringAY = 0;

	touchWorldZ = 40.0;
	touchWorldCamPos = new THREE.Vector3();

	rotatingIndex = -1;

	numTouchActive = 0;

	constructor() {

		super();

		//main
		this.main = new Main();
		this.bt = this.main.bt;

		//event bindings
		this.onDownBind = this.onDown.bind( this );
		this.onUpBind = this.onUp.bind( this );
		this.onMoveBind = this.onMove.bind( this );
		this.onKeyBind = this.onKey.bind( this );

		//touch setup
		let i, touchData;
		for( i = 0; i < this.maxTouches; i++ ){

			touchData = {};
			touchData.id = null;
			touchData.rotatingIndex = 0;
			touchData.screenX = 0;
			touchData.screenY = 0;
			touchData.xt = 0;
			touchData.yt = 0;
			touchData.vx = 0;
			touchData.vy = 0;
			touchData.worldPos = new THREE.Vector3();
			touchData.worldDir = new THREE.Vector3();
			touchData.worldPosDamped = new THREE.Vector3();
			touchData.force = 0;
			touchData.pressure = 0;
			touchData.active = false;
			touchData.updating = false;
			this.touches.push( touchData );

		}


	}

	init() {

		this.inputElem = this.bt.renderer.domElement;

	}

	onKey( e ) {

		//"S"
		if( e.keyCode == 83 ) {

			this.bt.toggleStats();

		}

	}	

 	update( time, deltaTime ) {

		this.time = time;
		this.deltaTime = deltaTime;

		let i, touch;
		let sumVX = 0;
		let sumVY =  0;
		let numTouchActive = 0;
		for( i = 0; i< this.maxTouches; i++ ) {

			touch = this.touches[ i ];
			this.updateTouch( touch, deltaTime );

			if( touch.updating ) {

				sumVX += touch.vx;
				sumVY += touch.vy;
				numTouchActive++;

			}

		}
		this.numTouchActive = numTouchActive;

		if( numTouchActive > 0 ) {

			sumVX = sumVX / numTouchActive;
			sumVY = sumVY / numTouchActive;

		}

		const mult = 0.1;
		const maxMove = 5.0;

		if( Math.abs( sumVX ) <= 1.0 ){
			sumVX = 0;
		}
		if( Math.abs( sumVY ) <= 1.0 ){
			sumVY = 0;
		}

		const mx = MathUtils.clamp( sumVX, -maxMove, maxMove ) * mult;
		const my = MathUtils.clamp( sumVY, -maxMove, maxMove ) * mult;

		this.mainRotSpringAX = mx - this.mainRotX;
		this.mainRotSpringVX = this.mainRotSpringVX * this.springElasticity + this.mainRotSpringAX * this.springStrength;
		this.mainRotX += this.mainRotSpringVX * deltaTime;

		this.mainRotSpringAY = my - this.mainRotY;
		this.mainRotSpringVY = this.mainRotSpringVY * this.springElasticity + this.mainRotSpringAY * this.springStrength;
		this.mainRotY += this.mainRotSpringVY * deltaTime;

	}

	updateTouch( touch, deltaTime ) {

		if( !touch.updating ) {

			return;

		}

		this.setTouchWorldPos( touch );

		touch.force = MathUtils.lerp( touch.force, ( touch.active ) ? 1.0 : 0.0, deltaTime * 20.0 );

		const dampSpeed = 10.0;
		touch.worldPosDamped.x = MathUtils.damp( touch.worldPosDamped.x, touch.worldPos.x, dampSpeed, deltaTime );
		touch.worldPosDamped.y = MathUtils.damp( touch.worldPosDamped.y, touch.worldPos.y, dampSpeed, deltaTime );
		touch.worldPosDamped.z = MathUtils.damp( touch.worldPosDamped.z, touch.worldPos.z, dampSpeed, deltaTime );

		if( !touch.active && Math.abs( touch.force ) < 0.01 ) {

			this.resetTouch( touch );
			touch.updating = false;

		}

	}

	setTouchWorldPos( touch ) {

		touch.xt = ( touch.screenX / this.bt.screenWidth * 2.0 ) - 1.0;
		touch.yt = ( touch.screenY / this.bt.screenHeight * 2.0 ) - 1.0;

		touch.worldDir.x = touch.xt;
		touch.worldDir.y = -touch.yt;
		touch.worldDir.z = -1;
		touch.worldDir.unproject( this.bt.camera );
		touch.worldDir.sub( this.bt.camera.position );
		const dist = ( this.touchWorldZ - this.bt.camera.position.z ) / touch.worldDir.z;
		touch.worldPos.copy( this.touchWorldCamPos.copy( this.bt.camera.position ).add( touch.worldDir.multiplyScalar( dist ) ) );

	}

	setDampedPos( touch ) {

		touch.worldPosDamped.x = touch.worldPos.x;
		touch.worldPosDamped.y = touch.worldPos.y;
		touch.worldPosDamped.z = touch.worldPos.z;

	}

	resetTouch( touch ) {

		touch.xt = 0;
		touch.yt = 0;
		touch.vx = 0;
		touch.vy = 0;
		touch.force = 0;
		touch.pressure = 0;

	}


	startInteraction() {

		if( this.interactionActive ) {

			return;

		}

		this.inputElem.addEventListener( 'pointerdown', this.onDownBind );
		this.inputElem.addEventListener( 'pointerup', this.onUpBind );
		this.inputElem.addEventListener( 'pointercancel', this.onUpBind );
		this.inputElem.addEventListener( 'pointermove', this.onMoveBind );
		this.inputElem.addEventListener( 'touchstart', this.onTouchStart );
		this.inputElem.addEventListener( "keydown", this.onKeyBind );

		this.interactionActive = true;

	}

	pauseInteraction() {

		this.inputElem.removeEventListener( 'pointerdown', this.onDownBind );
		this.inputElem.removeEventListener( 'pointerup', this.onUpBind );
		this.inputElem.removeEventListener( 'pointercancel', this.onUpBind );
		this.inputElem.removeEventListener( 'pointermove', this.onMoveBind );
		this.inputElem.removeEventListener( 'touchstart', this.onTouchStart );

		let touch;
		for( let i = 0; i < this.touches.length; i++ ){

			touch = this.touches[ i ];
			if( touch.id ) {

				this.inputElem.releasePointerCapture( touch.id );

			}
			touch.id = null;
			touch.active = false;

		}

		this.interactionActive = false;

	}

	onTouchStart( e ) {

		e.preventDefault();

	}

	onDown( e ) {

		this.trigger( "pointerDown" );

		if( this.logging ) {

			console.log( `pointer down id: ${ e.pointerId }` );

		}

		this.hasTouched = true;

		let i, touch;
		let touchI = -1;
		for( i = 0; i < this.maxTouches; i++ ) {

			touch = this.touches[ i ];
			if( !touch.updating ) {

				touchI = i;
				break;

			}

		}
		if( touchI == -1 ) {

			return;

		}

		let curTouch = this.touches[ touchI ];
		this.resetTouch( curTouch );
		curTouch.id = e.pointerId;
		this.rotatingIndex = ( this.rotatingIndex + 1 ) % 6;
		curTouch.rotatingIndex = this.rotatingIndex;
		curTouch.screenX = e.clientX;
		curTouch.screenY = e.clientY;
		this.setTouchWorldPos( curTouch );
		this.setDampedPos( curTouch );
		this.updateTouch( curTouch );
		curTouch.active = true;
		curTouch.updating = true;

		//this.detectPressure( curTouch, e );

		e.preventDefault();

		this.inputElem.setPointerCapture( e.pointerId );
		//this.inputElem.onpointermove = this.onMove.bind( this );

	}

	detectPressure( touch, e ) {

		if( e.pointerType == "touch" ) {

			if( e.pressure > 0.0 ) {

				touch.pressure = e.pressure;

			} else {

				touch.pressure = 0;

			}

		}

	}

	onMove( e ) {

		this.trigger( "pointerMove" );

		const id = this.getTouchIndexById( e.pointerId );

		if( this.logging ) {

			console.log( `pointer move id: ${ e.pointerId }` );

		}

		let touch;
		if( id >= 0 ) {

			touch = this.touches[ id ];
			touch.vx = e.clientX - touch.screenX;
			touch.vy = e.clientY - touch.screenY;
			touch.screenX = e.clientX;
			touch.screenY = e.clientY;

			this.detectPressure( touch, e );

		}

		e.preventDefault();

	}

	onUp( e ) {

		this.trigger( "pointerUp" );

		if( this.logging ) {

			console.log( `pointer up id: ${ e.pointerId }` );

		}

		let i, touch;
		for( i = 0; i < this.maxTouches; i++ ) {

			touch = this.touches[ i ];
			if( touch.id == e.pointerId ) {

				touch.id = -1;
				touch.vx = 0.0;
				touch.vy = 0.0;
				touch.screenX = e.clientX;
				touch.screenY = e.clientY;
				touch.active = false;

			}

		}

		e.preventDefault();		
		this.inputElem.releasePointerCapture( e.pointerId );

	}

	getTouchIndexById( targetId ) {

		let i, id;
		for( i = 0; i < this.maxTouches; i++ ) {

			id = this.touches[i].id;

			if( id == targetId ) {

				return i;

			}

		}
		return -1;

	}	

}