import './style.css'
import * as THREE from 'three';
import * as dat from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VertexTangentsHelper } from 'three/examples/jsm/helpers/VertexTangentsHelper';
import { computeMikkTSpaceTangents } from 'three/examples/jsm/utils/BufferGeometryUtils';
import * as MikkTSpace from 'three/examples/jsm/libs/mikktspace.module.js';
import vertexShader from '../shaders/water/vertexShader.glsl';
import fragmentShader from '../shaders/water/fragmentShader.glsl';
// import lightVertexShader from '../shaders/light/vertexShader.glsl';
// import lightFragmentShader from '../shaders/light/fragmentShader.glsl';
/**
 * Base Setup
 */

// Debug
const debugObject = {
	lightPosition: new THREE.Vector3(0, 4, 0),
	ambientLight: {
		value: 0.1
	},
	waterColor: {
		value: 0x42c0ff
	},
	lightColor: {
		value: 0xffffff
	}
}
const gui = new dat.GUI();
gui.add(debugObject.lightPosition, 'x').min(-10).max(10).step(0.001).name('lightX');
gui.add(debugObject.lightPosition, 'y').min(-10).max(10).step(0.001).name('lightY');
gui.add(debugObject.lightPosition, 'z').min(-10).max(10).step(0.001).name('lightZ');
gui.add(debugObject.ambientLight, 'value').min(0).max(1).step(0.001).name('ambientLight');
gui.addColor(debugObject.waterColor, 'value').name('waterColor')
gui.addColor(debugObject.lightColor, 'value').name('lightColor')
gui.onChange(() => {
	material.uniforms.uAmbientLight = debugObject.ambientLight;
	material.uniforms.uWaterColor.value = new THREE.Color(debugObject.waterColor.value);
	material.uniforms.uLightColor.value = new THREE.Color(debugObject.lightColor.value);
})

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Camera
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}


// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 8, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Textures
*/
const textureLoader = new THREE.TextureLoader();
const normalTexture = textureLoader.load('./normals/water.jpg')
normalTexture.wrapS = THREE.RepeatWrapping;
normalTexture.wrapT = THREE.RepeatWrapping;
// normalTexture.magFilter = THREE.NearestFilter;

const cube = new THREE.Mesh(
	new THREE.BoxGeometry(0.2,0.2,0.2),
	new THREE.MeshBasicMaterial()
)
scene.add(cube);




window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))




/**
 * Water Rendering
 */


// Geometry
const plane = new THREE.PlaneGeometry(10, 10, 256, 256);
const material = new THREE.ShaderMaterial({
	vertexShader: vertexShader,
	fragmentShader: fragmentShader,
	transparent: true,
	side: THREE.DoubleSide,
	uniforms: {
		uNormalTexture: {
			value: normalTexture
		},
		uTime: {
			value: 0.1
		},
		uViewPos: {
			value: camera.position
		},
		uLightPosition: {
			value: debugObject.lightPosition,
		},
		uAmbientLight: {
			value: debugObject.ambientLight.value
		},
		uWaterColor: {
			value: new THREE.Color(debugObject.waterColor.value)
		},
		uLightColor: {
			value: new THREE.Color(debugObject.lightColor.value)
		}
	}
});

const mesh = new THREE.Mesh(plane, material);
mesh.geometry.rotateX(-Math.PI / 2.0);
scene.add(mesh);
mesh.geometry.computeTangents();
const helper = new VertexTangentsHelper( mesh, 1, 0x00ffff );

// scene.add(helper);
// console.log(mesh.geometry.attributes)

/**
 * Animate
 */
const clock = new THREE.Clock()

camera.lookAt(mesh.position);
renderer.setClearColor(new THREE.Color(0x8ec9e6));

/**
 * Test object
 */
const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 32,32),
	new THREE.MeshLambertMaterial({
		color: 0xffff00,
		emissive: 0x1cb034,
		reflectivity: 1,
		refractionRatio: 0.98
	})
)
scene.add(sphere);

const tick = () =>
{
	const elapsedTime = clock.getElapsedTime()
	sphere.position.y = Math.sin(elapsedTime) * 0.3;
	sphere.position.x = Math.sin(elapsedTime * 0.1);
	sphere.position.z = Math.cos(elapsedTime * 0.1);

	// Update the mesh uniforms
	mesh.material.uniforms.uTime.value = elapsedTime;
	mesh.material.uniforms.uViewPos.value = camera.position;
	cube.position.set(
		debugObject.lightPosition.x,
		debugObject.lightPosition.y,
		debugObject.lightPosition.z,
	)
  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
	
  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()