var scene = new THREE.Scene;
var camera = new THREE.PerspectiveCamera(
  30,                          // field of view
  innerWidth / innerHeight,    // aspect ratio
  0.1,                         // near clipping pane
  1000                         // far clipping pane
);
var renderer = new THREE.WebGLRenderer;

renderer.setSize(innerWidth, innerHeight);
document.getElementById('content').appendChild(renderer.domElement);

var cubeMaterials = ['#0000FF', '#0033CC', '#0066FF', '#3399FF', '#00CCFF', '#3366CC']
                    .map(color => {
                      return new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.8, side: THREE.DoubleSide});
                    });

var geometry = new THREE.BoxGeometry(1, 1, 1);  // length, width, height
var bodyMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
var headMaterial = new THREE.MeshNormalMaterial;


var ambientLight = new THREE.AmbientLight( 0x000000 );
scene.add( ambientLight );

var lights = [];
lights[0] = new THREE.PointLight(0xffffff, 1, 0);
lights[1] = new THREE.PointLight(0xffffff, 1, 0);
lights[2] = new THREE.PointLight(0xffffff, 1, 0);

lights[0].position.set(0, 200, 0);
lights[1].position.set(100, 200, 100);
lights[2].position.set(-100, -200, -100);

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

camera.position.z = 15;
camera.position.y = 3;
camera.position.x = 6;
camera.rotateX(-0.15);
camera.rotateY(0.15);

function render() {
  requestAnimationFrame(render);
  // cube.rotation.x += 0.05;
  // cube.rotation.y += 0.1;
  renderer.render(scene, camera);
}
render();



function Head($el) {
  this.cube = new THREE.Mesh(geometry, headMaterial);
  this.currentDirection = 'right';
  this.SPEED = 1000;
  this.next = null;
  this.tail = this;
  scene.add(this.cube);
  setTimeout(this.move.bind(this), this.SPEED);
}

Head.prototype.move = function() {
  var x = this.x, y = this.y;
  switch(this.currentDirection) {
    case "right": this.x++; break;
    case "left": this.x--; break;
    case "up": this.y--; break;
    case "down": this.y++; break;
  }
  
  this.render();
  if (this.outside()) game.kill();
  this.moveBody(x, y);
  apple.checkIfEaten();
  this.checkBody();
  setTimeout(this.move.bind(this), this.SPEED);

}