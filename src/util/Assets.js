
import {gsap} from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { BzorThree } from './BzorThree.js';
import sources from "./../sources.js";

export class Assets {

	//loader
	loader;
	loaderBar;
	loaderProgress = 0;
	loaderDisplayT = 0;

	constructor() {

		//loader
		this.loader = document.getElementById( "loader" );
		this.loaderBar = document.getElementById( "loader-bar" );

	}

	load( onLoadFinished ) {

		//call this on asset load
		this.onLoadFinished = onLoadFinished;

		console.log( sources );

		//temp delay
		gsap.delayedCall( 0.2, onLoadFinished );

	}

	finishLoader() {

		gsap.to( this.loaderBar, 1.0, { width: "100%", ease: "power4.inOut", delay: 0.5 } );
		gsap.to( [ this.loaderBar, this.loader ], 0.5, { autoAlpha: 0, ease: "power1.easeIn", delay: 1.3 } );

	}

}