import * as THREE from 'three';
import { MathUtils } from 'three';

//shaders
import bgVert from './../glsl/bgVert.glsl';
import bgFrag from './../glsl/bgFrag.glsl';

export class BzorThreeBG {

	bt;

	bgGeo;
	bgSolidMat;
	bgGradientMat;
	bgNoiseMat;
	bgMesh;

	constructor() {
	}

	init( scene ) {

		this.bgGeo = new THREE.PlaneBufferGeometry( 2, 2 );
		const bottomCol = new THREE.Color( 0x000000 );
		const topCol = new THREE.Color( 0xFFFFFF );

		const bgColors = [ topCol.r, topCol.g, topCol.b, topCol.r, topCol.g, topCol.b, bottomCol.r, bottomCol.g, bottomCol.b, bottomCol.r, bottomCol.g, bottomCol.b ];
		this.bgGeo.setAttribute( 'color', new THREE.Float32BufferAttribute( bgColors, 3 ) );

		this.bgNoiseUniforms = {

			uTime: { value: 0.0 },
			col1: { value: [ 0.2, 0.0, 0.0 ] },
			col2: { value: [ 0.0, 0.1, 0.0 ] },
			col3: { value: [ 0.0, 0.0, 0.3 ] },

		};

		this.bgNoiseMat = new THREE.ShaderMaterial( {
			uniforms: this.bgNoiseUniforms,
			vertexShader: bgVert,
			fragmentShader: bgFrag,
			transparent: false,
			depthWrite: false,
			depthTest: false,
		} );

		this.bgGradientMat = new THREE.MeshBasicMaterial( {
			fog: false,
			depthTest: false,
			depthWrite: false,
			vertexColors: true,
		} );

		this.bgSolidMat = new THREE.MeshBasicMaterial( {
			fog: false,
			depthTest: false,
			depthWrite: false,
			vertexColors: false,
		} );

		this.bgMesh = new THREE.Mesh( this.bgGeo, this.bgNoiseMat );
		scene.add( this.bgMesh );

	}

	updateScale( x, y ) {

		const sc = ( x > y ) ? x : y;
		this.bgMesh.scale.set( sc, sc );

	}

	setSolidColor( col ) {

		this.bgSolidMat.color = col;
		this.bgMesh.material = this.bgSolidMat;

	}

	setGradientColor( bottomCol, topCol ) {

		const bgColors = [ topCol.r, topCol.g, topCol.b, topCol.r, topCol.g, topCol.b, bottomCol.r, bottomCol.g, bottomCol.b, bottomCol.r, bottomCol.g, bottomCol.b ];
		this.bgGeo.setAttribute( 'color', new THREE.Float32BufferAttribute( bgColors, 3 ) );
		this.bgMesh.material = this.bgGradientMat;

	}

	setNoiseColor( col1, col2, col3, col4 ) {

		this.bgNoiseUniforms.col1.value = col1.toArray();
		this.bgNoiseUniforms.col2.value = col2.toArray();
		this.bgNoiseUniforms.col3.value = col3.toArray();
		this.bgNoiseMat.needsUpdate = true;

	}

	update( time ) {

		this.bgNoiseUniforms.uTime.value = time;

	}

}