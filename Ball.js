function Ball(position) { 
//    this.velocity;
//    this.position;
//    this.color;
    this.radius = 25;
    this.timeLeft = 100;
    this.hit = false;
    this.sphere = new Sphere(this.radius);
    this.position = [50,this.radius,-50];
    this.init = true;
    this.velocityVec = vec3.create();
    vec3.normalize(this.velocityVec, vec3.fromValues(position[0],position[1],position[2]));
    this.startPosition = position;

    console.log("x:%f y:%f z:%f ", this.velocityVec[0], this.velocityVec[1], this.velocityVec[2]);
}

var timeStep = 0;
Ball.prototype.initBalls = function(){
    timeStep++;
    var y_position = ( ((Math.abs(this.position[0]-this.startPosition[0]))/20) *
	Math.abs(Math.sin(timeStep/(3*Math.PI)))) + this.radius;

    if(Math.abs(this.position[0]-this.startPosition[0]) +
       Math.abs(this.position[2] < this.startPosition[2]) > 10){

	this.position[1] = Math.abs(y_position);

	this.position[0] += this.velocityVec[0]*20;
	this.position[2] += this.velocityVec[2]*20;
    }
    else{
	this.init = false;
    }
}

Ball.prototype.initBuffers = function (gl_){
    this.sphere.initBuffers(gl_);
}

Ball.prototype.draw = function(gl_,buffer_) {
    if(this.init) this.initBalls();
    theMatrix.push();
    theMatrix.translate([this.position[0],this.position[1],this.position[2]]);
    this.sphere.draw(gl_,buffer_);
    theMatrix.pop();
}

Ball.prototype.detectCollision = function(oldPosition, newPosition){
    //sign of *_dir will tell you if you are heading in - or + resp direction
    // *_dir will also give you the vector of movement
    // vector will be necessary for bouncing
    var x_dir = newPosition[0] - oldPosition[0];
    var z_dir = newPosition[2] - oldPosition[2];

    //check to see if we cross sphere on z axis
    var newPos = vec2.fromValues(newPosition[0],newPosition[2]);
    var ballPos = vec2.fromValues(this.position[0], this.position[2]);

    //calculate distance
    var distance = vec2.distance(newPos, ballPos);

    //if we are within two radius' of ball we have a collision
    if(distance < 2*this.radius){
	alert("HIT");
	return false;
    }

    return true;
}
