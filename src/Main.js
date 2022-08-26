
import { gsap } from 'gsap';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { BzorThree } from './util/BzorThree.js';
import { FPSMonitor } from "./util/FPSMonitor";
import Input from './util/Input.js';
import { DebugPanel } from './util/DebugPanel.js';
import { Assets } from './util/Assets.js';
import { PointParticles } from './PointParticles.js';

let instance = null;

export class Main {

	//time
	time = 0.0;
	deltaTime = 0;
	frame = 0;
	accumulator = 0.0;
	simPS = 1.0 / 60.0;
	maxDT = 0.05;
	tickBind;

	//
	//state
	//
	stateTick = 0;
	state = { STATE1: 0, STATE2: 1 };
	curState = this.state.STATE1;
	nextState = null;
	inTransition = false;	
	animationActive = false;
	detectFallback = false;
	fallbackActive = false;
	showDebug = false;

	//
	//settings
	//

	debugPanel;

	constructor( showDebug ) {

		if( instance ) {

			return instance;

		}
		instance = this;		

		//debug
		this.showDebug = showDebug;
		this.debugPanel = new DebugPanel();
		if( showDebug ){

			this.debugPanel.start();

		}

		//three
		this.bt = new BzorThree();

		//input
		this.input = new Input();
		this.input.init();

		//assets
		this.assets = new Assets();

		//fps fallback
		if( this.detectFallback ){

			this.fpsMonitor = new FPSMonitor( this.fallback.bind( this ) );

		}

		//start loading process
		this.assets.load( this.beginAnimation.bind( this ) );

		//start ticker
		this.tickBind = this.tick.bind( this );
		//gsap.ticker.lagSmoothing(1000, 16);
		//gsap.ticker.fps( 30 );
		gsap.ticker.add( this.tickBind );

	}

	fallback() {

		if( !this.fallbackActive ){

			console.log( "low FPS detected, falling back" );
			this.fallbackActive = true;
			console.log( this );
			gsap.to( document.getElementById( "contain" ), 0.5, { autoAlpha: 0 } );
			gsap.delayedCall( 0.5, this.deactivate.bind( this ) );

		}

	}

	deactivate() {

		gsap.ticker.remove( this.tickBind );

	}

	beginAnimation() {

		//input
		this.input.startInteraction();

		//inits before animation start
		this.pointParticles = new PointParticles();

		//begin animation
		this.animationActive = true;

		//fade in
		const fade = document.getElementById( "fade" );
		this.assets.finishLoader();
		gsap.to( fade, 1, { autoAlpha: 0, ease: "power1.easeIn", delay: 1.5 } );
		if( this.detectFallback ){

			gsap.delayedCall( 2.0, this.activateFpsMonitor.bind( this ) );

		}

	}

	activateFpsMonitor() {

		this.fpsMonitor.activate();

	}

	tick( time, deltaTime, frame ) {

		//convert to ms
		deltaTime *= 0.001;
		//cap deltaTime
		if( deltaTime > this.maxDT ) {

			deltaTime = this.maxDT;

		}

		//debug
		if( this.showDebug ){

			this.debugPanel.update();

		}		

		//gather input
		this.input.update( time, deltaTime );

		//try to lock framestep to 60fps
		let numSimUpdates = 0;
		if( this.animationActive ){

			if( this.detectFallback ){

				this.fpsMonitor.tick();

			}

			this.accumulator += deltaTime;
			while( this.accumulator >= 1.0 / 61.0 ){

				this.update( this.time, this.simPS );
				this.time += this.simPS;
				this.accumulator -= this.simPS;
				if( this.accumulator < 1.0 / 59.0 - 1.0 / 60.0 ) this.accumulator = 0;
				numSimUpdates++;

			}

		}
		//console.log( numSimUpdates );

		//render frame
		this.bt.render( time );

	}

	update( time, deltaTime ) {

		//state changes


		//update systems
		this.pointParticles.update( time, deltaTime );

	}

}