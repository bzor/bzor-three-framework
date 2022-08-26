import {gsap} from 'gsap';

export class FPSMonitor {

	lastFrameTime = 0;
	frameTimes = [];
	bufferLength = 120;
	bufferI = 0;
	fps;
	active = false;
	detect = false;

	lowFpsCallback;

	constructor( callback ) {

		for( let i = 0; i < this.bufferLength; i++ ){

			this.frameTimes.push( 0 );

		}

		this.lowFpsCallback = callback;

	}

	activate() {

		this.active = true;

	}

	tick() {

		if( !this.active ){

			return;

		}

		const now = performance.now();
		//cap frame time for large pauses
		const frameTime = Math.min( now - this.lastFrameTime, 50.0 );

		this.frameTimes[ this.bufferI ] = frameTime;
		this.bufferI++;
		if( this.bufferI == this.bufferLength ){

			this.bufferI = 0;
			this.detect = true;

		}
		this.lastFrameTime = now;

		if( this.detect ){

			let avg = 0;
			for( let i = 0; i < this.bufferLength; i++ ){

				avg += this.frameTimes[ i ];

			}
			avg /= this.bufferLength;

			if( avg > 45.0) {

				this.lowFpsCallback();

			}

		}

	}

}