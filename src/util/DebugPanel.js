
import { gsap } from 'gsap';
import { Main } from './../Main.js';

export class DebugPanel {

	version = 0.02;

	hasInit = false;

	width = 130;
	height = 202;

	ctxWidth;
	ctxHeight;

	frames = 0;
	prevTime;
	fps = "--";

	drawY = 0;
	refFontSize = 24;
	refLineBorder = 40;

	trackedProps = [];

	constructor() {

		this.main = new Main();
		this.input = this.main.input;

		if( this.main.showDebug ){

			gsap.delayedCall( 0.5, this.init.bind( this ) );

		}

	}

	init() {

		//bg
		this.bg = document.createElement( "div" );
		this.bg.style.cssText = "position:absolute;top:0;right:0;margin:0;width:100%;height:100%;background-color:black;opacity:0.6";

		//container
		this.elem = document.createElement( "div" );
		this.elem.style.cssText = "position:fixed;top:0;right:0;margin:0;cursor:pointer;z-index:1000;";
		this.elem.style.width = this.width + "px";
		this.elem.style.height = this.height + "px";

		//canvas
		this.canvas = document.createElement( "canvas" );
		this.ctxWidth = this.width * 2;
		this.canvas.width = this.ctxWidth;
		this.ctxHeight = this.height * 2;
		this.canvas.height = this.ctxHeight;
		this.canvas.style.width = this.width + "px";
		this.canvas.style.height = this.height + "px";
		this.ctx = this.canvas.getContext( "2d", { alpha: true } );
		this.ctx.font = `${ this.fontSize }px Mono0855`;
		this.ctx.textBaseline = "top";
		this.ctx.textAlign = "right";
		this.ctx.fillStyle = "white";

		//dom
		this.elem.appendChild( this.bg );
		this.elem.appendChild( this.canvas );
		document.body.appendChild( this.elem );

		//startup
		this.prevTime = this.beginTime;
		this.hasInit = true;

		this.fontSize = this.refFontSize;
		this.lineBorder = this.refLineBorder;


	}

	start() {

		this.beginTime = ( performance || Date ).now();

	}

	update() {

		if( !this.hasInit ){

			return;

		}

		this.fontSize = this.refFontSize / this.main.bt.pixelRatio;
		this.lineBorder = this.refLineBorder / this.main.bt.pixelRatio;
		this.ctx.font = `${ this.fontSize }px Mono0855`;

		this.drawY = 24 / this.main.bt.pixelRatio;
		this.ctx.clearRect( 0, 0, this.ctxWidth, this.ctxHeight );
		this.updateVersion();
		this.updateFPS();
		this.updateMem();
		this.updateTrackedProps();

	}

	updateVersion() {

		this.ctx.fillText( `v${ this.version }`, this.width * 2 - 10, this.drawY );
		this.drawY += this.lineBorder;

	}

	updateFPS() {

		this.frames++;
		const time = ( performance || Date ).now();

		if ( time >= this.prevTime + 1000 ) {

			this.fps = Math.round( ( this.frames * 1000 ) / ( time - this.prevTime ) ).toString();

			this.prevTime = time;
			this.frames = 0;

		}

		this.ctx.fillText( `${ this.fps }FPS`, this.width * 2 - 10, this.drawY );
		this.drawY += this.lineBorder;

	}

	updateMem() {

		/*
		var memory = Math.round( performance.memory.usedJSHeapSize / 1048576 );
		this.ctx.fillText( `${ memory }MB`, this.width * 2 - 10, this.drawY );
		this.drawY += this.textLineBorder;
		*/

	}

	track( obj, prop ) {

		const data = { obj: obj, prop: prop };
		this.trackedProps.push( data );

	}

	updateTrackedProps() {

		let i, data;
		for( i = 0; i < this.trackedProps.length; i++ ){

			data = this.trackedProps[ i ];
			this.ctx.fillText( `${ data.prop.toUpperCase() }: ${ data.obj[ data.prop ] }`, this.width * 2 - 10, this.drawY );
			this.drawY += this.lineBorder;

		}

	}

}