'use strict';

class Game {

  constructor(x, y, z) {
    this.xLimit = x;
    this.yLimit = y;
    this.zLimit = z;
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(
      30,                          // field of view
      innerWidth / innerHeight,    // aspect ratio
      0.1,                         // near clipping pane
      1000                         // far clipping pane
    );
    this.renderer = new THREE.WebGLRenderer;
    this.renderer.setSize(innerWidth, innerHeight);
    document.getElementById('content').appendChild(this.renderer.domElement);
    this.aimCamera();
    this.drawBorders();
    this.switchOnLights();
    this.render();
  }


  aimCamera() {
    this.camera.position.z = 15;
    this.camera.position.y = 6;
    this.camera.position.x = 6;
    this.camera.rotateX(-0.15);
    this.camera.rotateY(0.15);
  }


  drawBorders() {

    var drawLines = vectors => {
      var lineMaterial = new THREE.LineBasicMaterial({
        color: '#ffffff'
      });
      var lineGeo = new THREE.Geometry();
      lineGeo.vertices = vectors;
      var line = new THREE.Line(lineGeo, lineMaterial);
      this.scene.add(line);
    };

    drawLines([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(this.xLimit, 0, 0),
      new THREE.Vector3(this.xLimit, 0, -1 * this.zLimit),
      new THREE.Vector3(0, 0, -1 * this.zLimit),
      new THREE.Vector3(0, 0, 0)
    ]);
    drawLines([
      new THREE.Vector3(0, this.yLimit, 0),
      new THREE.Vector3(this.xLimit, this.yLimit, 0),
      new THREE.Vector3(this.xLimit, this.yLimit, -1 * this.zLimit),
      new THREE.Vector3(0, this.yLimit, -1 * this.zLimit),
      new THREE.Vector3(0, this.yLimit, 0)
    ]);
    drawLines([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, this.yLimit, 0),
    ]);
    drawLines([
      new THREE.Vector3(this.xLimit, 0, 0),
      new THREE.Vector3(this.xLimit, this.yLimit, 0),
    ]);
    drawLines([
      new THREE.Vector3(0, 0, -1 * this.zLimit),
      new THREE.Vector3(0, this.yLimit, -1 * this.zLimit),
    ]);
    drawLines([
      new THREE.Vector3(this.xLimit, 0, -1 * this.zLimit),
      new THREE.Vector3(this.xLimit, this.yLimit, -1 * this.zLimit),
    ]);
  }

  switchOnLights() {
    var ambientLight = new THREE.AmbientLight(0x000000);
    this.scene.add(ambientLight);

    var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);
  }


  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }


  kill() {
    this.renderer.render(this.scene, this.camera);
    alert('You died...');
    location.reload();
  }
  
}



var cubeMaterials = ['#0000FF', '#0033CC', '#0066FF', 
                     '#3399FF', '#00CCFF', '#3366CC']
                    .map(color => {
                      return new THREE.MeshBasicMaterial({ 
                        color, 
                        transparent:true, 
                        opacity:0.6, 
                        side: THREE.DoubleSide
                      });
                    });

var cubeGeo = new THREE.BoxGeometry(1, 1, 1);  // length, width, height
var bodyMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
var headMaterial = new THREE.MeshNormalMaterial;

var sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
var appleMaterial = new THREE.MeshLambertMaterial({ color: 'red' });



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
    return this.x > game.xLimit ||
           this.x < 0 ||
           this.y > game.yLimit ||
           this.y < 0 ||
           this.z < -1 * game.zLimit ||
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
    this.score = 0;
    this.shape = new THREE.Mesh(cubeGeo, headMaterial);
    game.scene.add(this.shape);
    this.direction = 'right';
    this.SPEED = 500;
    this.next = null;
    this.tail = this;
    this.ps = setTimeout(this.move.bind(this), this.SPEED);
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

    this.moveBody(x, y, z);
    if (this.outside()) game.kill();
    apple.checkIfEaten();
    this.checkBody();
    this.ps = setTimeout(this.move.bind(this), this.SPEED);
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
    game.scene.add(newBody.shape);
    this.tail.next = newBody;
    this.tail = newBody;
  }

  checkBody() {
    for (var body = this.next; body; body = body.next) {
      if (body.overlap(head)) game.kill();
    }
  }

  togglePause() {
    if (this.ps) {
      clearTimeout(this.ps);
      this.ps = null;
    } else {
      this.move();
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
    game.scene.add(this.shape);
    this.x = (x === undefined ? Math.floor(Math.random() * (game.xLimit + 1)) : x);
    this.y = (y === undefined ? Math.floor(Math.random() * (game.yLimit + 1)) : y);
    this.z = (z === undefined ? -1 * Math.floor(Math.random() * (game.zLimit + 1)) : z);
    this.drawCalibration();
  }

  checkIfEaten() {
    if (this.overlap(head)) this.pick();
  }

  pick() {
    game.scene.remove(this.shape);
    this.removeCalibration();
    apple = new Apple;
    head.newBody = new Body;
    document.getElementById('score').innerText = ++head.score;
  }

  removeCalibration() {
    game.scene.remove(this.zCalibLine);
    game.scene.remove(this.xCalibLine);
  }

  drawCalibration() {
    var lineMaterial = new THREE.LineBasicMaterial({
      color: 'red'
    });

    var lineGeo = new THREE.Geometry();
    lineGeo.vertices = [
      new THREE.Vector3(this.x, this.y, 0),
      new THREE.Vector3(this.x, this.y, -1 * game.zLimit),
    ];
    this.zCalibLine = new THREE.Line(lineGeo, lineMaterial);
    game.scene.add(this.zCalibLine);

    var lineGeo = new THREE.Geometry();
    lineGeo.vertices = [
      new THREE.Vector3(0, this.y, this.z),
      new THREE.Vector3(game.xLimit, this.y, this.z),
    ];
    this.xCalibLine = new THREE.Line(lineGeo, lineMaterial);
    game.scene.add(this.xCalibLine);
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
  } else if (e.keyCode === 87 && head.direction !== 'down') {  // w key
    head.direction = 'up';
  } else if (e.keyCode === 83 && head.direction !== 'up') {  // s key
    head.direction = 'down';
  } else if (e.keyCode === 32) {  // spacebar
    head.togglePause();
  }
});

var game = new Game(7, 5, 10);
var head = new Head;
var apple = new Apple(3, 0, 0);
