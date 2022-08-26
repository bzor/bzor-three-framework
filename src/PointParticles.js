import {gsap} from 'gsap';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { GPUComputationRenderer } from '../node_modules/three/examples/jsm/misc/GPUComputationRenderer.js';
import { BzorThree } from './util/BzorThree.js';
import { Main } from './Main.js';

//shaders
import simPos from './glsl/simulationPosFrag.glsl';
import simVel from './glsl/simulationVelFrag.glsl';
import particlesVert from './glsl/particlesVert.glsl';
import particlesFrag from './glsl/particlesFrag.glsl';

export class PointParticles {

	//
	//particle settings
	//
	computeTexWidth = 512;
	numParticles = this.computeTexWidth * this.computeTexWidth;

	//
	//state
	//
	time;
	deltaTime;

	//
	//settings
	//
	maxVelocity = 2.0;
	speedRange = 1.0;

	boundsZ = [ -10, 40 ];

	gpuCompute;
	positionVar;
	positionUniforms;
	velocityVar;
	velocityUniforms;
	renderMat;
	renderUniforms;

	constructor() {

		//main
		this.main = new Main();

		//three
		this.bt = this.main.bt;
		this.renderer = this.bt.renderer;

		//init
		this.init();

	}

	init() {

		const touchDatas = [];
		let touchData;
		let i;
		for( i = 0; i < this.main.input.maxTouches; i++ ) {

			touchData = {};
			touchData.pos = new THREE.Vector3();
			touchData.force = 0;
			touchDatas.push( touchData );

		}

		this.gpuCompute = new GPUComputationRenderer( this.computeTexWidth, this.computeTexWidth, this.renderer );

		if ( this.renderer.capabilities.isWebGL2 === false ) {

			this.gpuCompute.setDataType( THREE.HalfFloatType );

		}

		//position/velocity buffers
		const posTex = this.gpuCompute.createTexture();
		const velTex = this.gpuCompute.createTexture();

		//create buffers
		this.fillTextures( posTex, velTex );

		//link buffers
		this.positionVar = this.gpuCompute.addVariable( 'texturePosition', simPos, posTex );
		this.velocityVar = this.gpuCompute.addVariable( 'textureVelocity', simVel, velTex );
		this.gpuCompute.setVariableDependencies( this.positionVar, [ this.positionVar, this.velocityVar ] );
		this.gpuCompute.setVariableDependencies( this.velocityVar, [ this.positionVar, this.velocityVar ] );

		//position uniforms
		this.positionUniforms = this.positionVar.material.uniforms;
		this.positionUniforms.uTime = { value: this.uTime };

		//velocity uniforms
		this.velocityUniforms = this.velocityVar.material.uniforms;
		this.velocityUniforms.uTime = { value: 0.0 };
		this.velocityUniforms.bounds = { value: [ -10.0, 10.0, -6.0, 6.0 ] };
		this.velocityUniforms.boundsZ = { value: this.boundsZ };
		this.velocityUniforms.maxVelocity = { value: this.maxVelocity };
		this.velocityUniforms.speedRange = { value: this.speedRange };
		this.velocityUniforms.touchDatas = { value: touchDatas };

		//u mad bro?
		const error = this.gpuCompute.init();
		if ( error !== null ) {

			console.log( "GPU COMPUTE ERROR" );

		}

		//create buffer geometry, init position/uvs
		this.geo = new THREE.BufferGeometry();
		const positions = new Float32Array( this.numParticles * 3 );
		let p = 0;
		for ( i = 0; i < this.numParticles; i ++ ) {

			positions[ p++ ] = 0.0;
			positions[ p++ ] = 0.0;
			positions[ p++ ] = 0.0;

		}
		const uvs = new Float32Array( this.numParticles * 2 );
		p = 0;
		for ( let j = 0; j < this.computeTexWidth; j ++ ) {

			for ( i = 0; i < this.computeTexWidth; i ++ ) {

				uvs[ p++ ] = i / ( this.computeTexWidth - 1 );
				uvs[ p++ ] = j / ( this.computeTexWidth - 1 );

			}

		}
		this.geo.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		this.geo.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

		//render material uniforms
		this.renderUniforms = {};
		this.renderUniforms.texturePosition = { value: null };
		this.renderUniforms.textureVelocity = { value: null };
		this.renderUniforms.uTime = { value: null };
		this.renderUniforms.fogNear = { value: -10.0 };
		this.renderUniforms.fogFar = { value: 40.0 };
		this.renderUniforms.pSize = { value: this.getParticleSize() };
		this.renderUniforms.pixelRatio = { value: this.bt.pixelRatio };
		this.renderUniforms.cameraPos = { value: this.bt.cameraPos };

		//render material
		let blending = ( false ) ? THREE.NormalBlending : THREE.AdditiveBlending;
		this.renderMat = new THREE.ShaderMaterial( {
			uniforms: this.renderUniforms,
			vertexShader: particlesVert,
			fragmentShader: particlesFrag,
			transparent: false,
			blending: blending,
		} );
		this.renderMat.extensions.drawBuffers = true;

		//points mesh
		this.particles = new THREE.Points( this.geo, this.renderMat );
		this.particles.matrixAutoUpdate = true;
		this.bt.scene.add( this.particles );

	}

	fillTextures( texturePosition, textureVelocity ) {

		//init buffers
		const posArray = texturePosition.image.data;
		const velArray = textureVelocity.image.data;

		const vec = new THREE.Vector3();
		let id = 0;
		for ( let i = 0; i < posArray.length; i += 4 ) {

			const t = id / ( posArray.length / 4.0 );
			id++;

			//inital positions
			vec.x = MathUtils.randFloatSpread( this.bt.worldScreenSize.x );
			vec.y = MathUtils.randFloatSpread( this.bt.worldScreenSize.y );
			vec.z = MathUtils.randFloat( this.boundsZ[ 0 ], this.boundsZ[ 1 ] );
			posArray[ i + 0 ] = vec.x;
			posArray[ i + 1 ] = vec.y;
			posArray[ i + 2 ] = vec.z;
			posArray[ i + 3 ] = t;

			//inital velocities
			vec.randomDirection().multiplyScalar( this.maxVelocity );	
			velArray[ i + 0 ] = vec.x;
			velArray[ i + 1 ] = vec.y;
			velArray[ i + 2 ] = vec.z;
			velArray[ i + 3 ] = t;

		}

	}

	update( time, deltaTime ) {

		//time
		this.deltaTime = deltaTime;
		this.time = time;

		//compute buffers and swap textures
		this.gpuCompute.compute();
		this.renderUniforms[ "texturePosition" ].value = this.gpuCompute.getCurrentRenderTarget( this.positionVar ).texture;
		this.renderUniforms[ "textureVelocity" ].value = this.gpuCompute.getCurrentRenderTarget( this.velocityVar ).texture;

		//update position uniforms
		this.positionUniforms.uTime.value = this.time;

		//update velocity uniforms
		const hScreenW = 0.7 * this.bt.worldScreenSize.x / 2.0;
		const hScreenH = 0.7 * this.bt.worldScreenSize.y / 2.0;
		this.velocityUniforms.uTime.value = this.time;
		this.velocityUniforms.bounds.value = [ -hScreenW, hScreenW, -hScreenH, hScreenH ];

		//update render uniforms
		this.renderUniforms.uTime.value = this.time;
		this.renderUniforms.pSize.value = this.getParticleSize();
		this.renderUniforms.pixelRatio.value = this.bt.pixelRatio;

		//touch
		let tp, inputTouch;
		for( let i = 0; i < this.main.input.maxTouches; i++ ) {

			tp = this.velocityUniforms.touchDatas.value[ i ];

			inputTouch = this.main.input.touches[ i ];

			tp.pos.x = inputTouch.worldPos.x;
			tp.pos.y = inputTouch.worldPos.y;
			tp.pos.z = inputTouch.worldPos.z;
			tp.force = inputTouch.force;

			console.log( i + '  force:' + inputTouch.force + '  x:' + inputTouch.worldPos.x );

		}

	}

	getParticleSize() {

		return Math.min( this.bt.screenWidth, this.bt.screenHeight ) / 3000.0;

	}


}