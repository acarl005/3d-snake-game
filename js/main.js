'use strict';

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
                      return new THREE.MeshBasicMaterial({ 
                        color, 
                        transparent:true, 
                        opacity:0.8, 
                        side: THREE.DoubleSide
                      });
                    });

var cubeGeo = new THREE.BoxGeometry(1, 1, 1);  // length, width, height
var bodyMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
var headMaterial = new THREE.MeshNormalMaterial;

var sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
var appleMaterial = new THREE.MeshLambertMaterial({ color: 'red' });

var ambientLight = new THREE.AmbientLight( 0x000000 );
scene.add(ambientLight);

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
camera.position.y = 5;
camera.position.x = 6;
camera.rotateX(-0.15);
camera.rotateY(0.15);

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
render();

var xlimit = 7;
var ylimit = 5;
var zlimit = 10;

function kill() {
  renderer.render(scene, camera);
  alert('You died...');
  location.reload();
}


class Shape {

  get x() { return this.shape.position.x; }
  get y() { return this.shape.position.y; }
  get z() { return this.shape.position.z; }
  set x(newx) { this.shape.position.x = newx; }
  set y(newy) { this.shape.position.y = newy; }
  set z(newz) { this.shape.position.z = newz; }

  overlap(obj) {
    return this.x === obj.x &&
           this.y === obj.y &&
           this.z === obj.z; 
  }

  outside() {
    return this.x > xlimit ||
           this.x < 0 ||
           this.y > ylimit ||
           this.y < 0 ||
           this.z < -1 * zlimit ||
           this.z > 0;
  }

  setPos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

}

class Head extends Shape {

  constructor() {
    super();
    this.shape = new THREE.Mesh(cubeGeo, headMaterial);
    scene.add(this.shape);
    this.direction = 'right';
    this.SPEED = 500;
    this.next = null;
    this.tail = this;
    setTimeout(this.move.bind(this), this.SPEED);
  }

  move() {
    var x = this.x, y = this.y, z = this.z;
    switch(this.direction) {
      case "right": this.x++; break;
      case "left": this.x--; break;
      case "forward": this.z--; break;
      case "backward": this.z++; break;
      case "up": this.y++; break;
      case "down": this.y--; break;
    }
    console.log({
      x: this.x,
      y: this.y,
      z: this.z,
    });
    if (this.outside()) kill();
    this.moveBody(x, y, z);
    apple.checkIfEaten();
    this.checkBody();
    setTimeout(this.move.bind(this), this.SPEED);
  }

  moveBody(x, y, z) {
    for (var body = this.next; body; body = body.next) {
      var tempx = body.x;
      var tempy = body.y;
      var tempz = body.z;
      body.setPos(x, y, z);
      x = tempx;
      y = tempy;
      z = tempz;
    }
    if (this.newBody) this.grow(x, y, z);
  }


  grow(x, y, z) {
    var newBody = this.newBody;
    this.newBody = null;
    newBody.setPos(x, y, z);
    scene.add(newBody.shape);
    this.tail.next = newBody;
    this.tail = newBody;
  }

  checkBody() {
    for (var body = this.next; body; body = body.next) {
      if (body.overlap(head)) kill();
    }
  }

}

class Body extends Shape {
  constructor() {
    super();
    this.shape = new THREE.Mesh(cubeGeo, bodyMaterial);
    this.next = null;
  }
}


class Apple extends Shape {

  constructor(x, y, z) {
    super();
    this.shape = new THREE.Mesh(sphereGeo, appleMaterial);
    scene.add(this.shape);
    this.x = (x === undefined ? Math.floor(Math.random() * (xlimit + 1)) : x);
    this.y = (y === undefined ? 0 : y);
    this.z = (z === undefined ? -1 * Math.floor(Math.random() * (zlimit + 1)) : z);
  }

  checkIfEaten() {
    if (this.overlap(head)) this.pick();
  }

  pick() {
    scene.remove(this.shape);
    apple = new Apple;
    head.newBody = new Body;
  }

}

$(window).on('keydown', e => {
  if (e.keyCode === 37 && head.direction !== 'right') {
    head.direction = 'left';
  } else if (e.keyCode === 38 && head.direction !== 'backward') {
    head.direction = 'forward';
  } else if (e.keyCode === 40 && head.direction !== 'forward') {
    head.direction = 'backward';
  } else if (e.keyCode === 39 && head.direction !== 'left') {
    head.direction = 'right';
  } else if (e.keyCode === 87 && head.direction !== 'down') {
    head.direction = 'up';
  } else if (e.keyCode === 83 && head.direction !== 'up') {
    head.direction = 'down';
  }
});


var head = new Head;
var apple = new Apple(3, 0, 0);

var material = new THREE.LineBasicMaterial({
  color: 0xffffff
});

var geometry = new THREE.Geometry();
geometry.vertices.push(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(xlimit, 0, 0),
  new THREE.Vector3(xlimit, 0, -1 * zlimit),
  new THREE.Vector3(0, 0, -1 * zlimit),
  new THREE.Vector3(0, 0, 0)
);

var line = new THREE.Line( geometry, material );
scene.add( line );