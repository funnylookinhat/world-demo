/**
 * Generate a dynamic world.
 */

var resourcePaths = {};

resourcePaths['tree'] = {
	"maple-green-brown": 'environment-models/maple-green-brown/maple-green-brown.js',
	"maple-green-gray": 'environment-models/maple-green-gray/maple-green-gray.js',
	"maple-yellow-brown": 'environment-models/maple-yellow-brown/maple-yellow-brown.js',
	"maple-yellow-gray": 'environment-models/maple-yellow-gray/maple-yellow-gray.js',
	"oak-brown": 'environment-models/oak-brown/oak-brown.js',
	"oak-gray": 'environment-models/oak-gray/oak-gray.js',
	"pine-brown": 'environment-models/pine-brown/pine-brown.js',
	"pine-gray": 'environment-models/pine-gray/pine-gray.js'
};

resourcePaths['clutter'] = {
	"fern": 'environment-models/fern/fern.js',
	"ivy": 'environment-models/ivy/ivy.js'
};

function loadResources(loader,paths,resources) {
	if( typeof loader == 'undefined' ||
		typeof resources == 'undefined' ||
		typeof paths == 'undefined' ) {
		return;
	}

	var index;
	for( index in paths ) {
		break;
	}

	if( typeof index == 'undefined' ) {
		init();
	} else {
		var rIndex;
		for( rIndex in paths[index] ) {
			break;
		}
		if( typeof rIndex == 'undefined' ) {
			delete paths[index];
			loadResources(loader,paths,resources);
		} else {
			// console.log("Loading: "+index+" , "+rIndex+" , "+paths[index][rIndex]);
			loader.load( paths[index][rIndex], function (geometry, materials) {
				delete paths[index][rIndex];
				if( resources[index] == undefined ) {
					resources[index] = {};
				}
				resources[index][rIndex] = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
				loadResources(loader,paths,resources);
			});
		}
	}
}

var resources = {};

var jsonLoader = new THREE.JSONLoader();

loadResources(jsonLoader,resourcePaths,resources);

var camera,
	scene,
	renderer;

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

function init() {
	
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 45, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 30000 );
	
	// Add ground pattern.
	var gt = THREE.ImageUtils.loadTexture( "old-models/models-js/grasslight-big.jpg" );
	var gg = new THREE.PlaneGeometry( 128000, 128000 );
	var gm = new THREE.MeshPhongMaterial( { color: 0xffffff, map: gt } );
	var ground = new THREE.Mesh( gg, gm );
	ground.rotation.x = - Math.PI / 2;
	ground.material.map.repeat.set( 64, 64 );
	ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping;
	ground.receiveShadow = true;
	scene.add(ground);
	
	scene.add(camera);


	// Random Trees
	var treeKeys = [];
	for( treeKey in resources['tree'] ) {
		treeKeys.push(treeKey);
	}
	console.log(treeKeys);

	var lod;

	var key;
	for( i = 0; i < 2000 ; i++ ) {
		lod = new THREE.LOD();
		var tree = resources['tree'][treeKeys[Math.floor(Math.random() * treeKeys.length)]].clone();
		lod.position.x = Math.random() * 128000 - 64000;
		lod.position.z = Math.random() * 128000 - 64000;
		lod.position.y = 0;
		tree.scale.x = tree.scale.y = tree.scale.z = Math.random() * 1000 + 200;
		tree.rotation.y = Math.random() * Math.PI * 2;
		tree.updateMatrix();
		tree.matrixAutoUpdate = false;
		lod.addLevel(tree);
		var blank = new THREE.Object3D();
		blank.updateMatrix();
		lod.addLevel(blank,50000);
		lod.updateMatrix();
		lod.matrixAutoUpdate = false;
		scene.add(lod);
	}

	// FERN
	for( i = 0; i < 5000 ; i++ ) {
		lod = new THREE.LOD();
		var fern = resources['clutter']['fern'].clone();
		lod.position.x = Math.random() * 128000 - 64000;
		lod.position.z = Math.random() * 128000 - 64000;
		lod.position.y = 0;
		fern.scale.x = fern.scale.y = fern.scale.z = 100;
		fern.rotation.y = Math.random() * Math.PI * 2;
		fern.updateMatrix();
		fern.matrixAutoUpdate = false;
		lod.addLevel(fern);
		var blank = new THREE.Object3D();
		blank.updateMatrix();
		lod.addLevel(blank,10000);
		lod.updateMatrix();
		lod.matrixAutoUpdate = false;
		scene.add(lod);
	}


	// IVY
	/*
	var xIvy,
		zIvy,
		radiusIvy,
		countIvy,
		angleIvy;

	for( i = 0; i < 1000 ; i++ ) {
		xIvy = Math.random() * 128000 - 64000;
		zIvy = Math.random() * 128000 - 64000;
		radiusIvy = Math.random() * 500 + 50;
		countIvy = Math.random() * 80 + 20;
		for( j = 0; j < countIvy; j++ ) {
			angleIvy = Math.random() * Math.PI * 2;
			var ivy = resources['clutter']['ivy'].clone();
			ivy.position.x = xIvy + ( Math.random() * radiusIvy ) * Math.cos( angleIvy );
			ivy.position.z = zIvy + ( Math.random() * radiusIvy ) * Math.sin( angleIvy );
			ivy.position.y = 0;
			ivy.scale.x = ivy.scale.y = ivy.scale.z = 100;
			ivy.rotation.y = Math.random() * Math.PI * 2;
			scene.add( ivy );	
		}
	}
	*/

	/*
	for( i = 0; i < 1000 ; i++ ) {
		var object = resources['tree']['maple-green-brown'].clone();
		object.position.x = Math.random() * 20000 - 10000;
		object.position.y = 0;
		object.position.z = Math.random() * 20000 - 10000;
		object.scale.x = object.scale.y = object.scale.z = ( Math.random() * 500 + 50 );
		object.rotation.y = Math.random() * Math.PI * 2;
		scene.add( object );
	}
	*/
	
	scene.add( new THREE.AmbientLight( 0xefefef ) );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColorHex( 0xcccccc, 1 );

	document.body.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	run();
}

function onWindowResize() {
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT);
}

function render() {
	renderer.render(scene,camera);
}

var cameraRadius = 35000;
var cameraDelta = -50;
var cameraAbs = 35000;

function update() {
	// Update positions / angles / etc.

	camera.position.y = 500;
	/*
	camera.position.z = 20000;
	camera.position.x = 20000;
	*/

	cameraRadius += cameraDelta;
	if( Math.abs(cameraRadius) > cameraAbs ) {
		cameraDelta *= -1;
		cameraRadius += cameraDelta;
	}
	var cameraAngle = Date.now() * 0.00005;

	camera.position.z = cameraRadius * Math.cos(cameraAngle);
	camera.position.x = cameraRadius * Math.sin(cameraAngle);


	camera.lookAt({x:0,y:250,z:0});
	scene.traverse( function ( object ) { if ( object instanceof THREE.LOD ) { object.update( camera ); } } );
}

// Thanks Paul Irish.
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function run() {
	(function animloop(){
		requestAnimFrame(animloop);
		render();
		update();
	})();
}
