function GLmatrix() {
    this.mMatrix = mat4.create();
    this.vMatrix = mat4.create();
    this.vMatrixNew = mat4.create();

    this.lightMatrix = mat4.create();
    mat4.identity(this.lightMatrix);

    this.ivMatrix = mat4.create();
    mat4.identity(this.vMatrix);
    this.pMatrix = mat4.create();
    this.r2 = Math.sqrt(2);
    this.mStack = [];
    this.inJump = false;

    this.mMatrixChanged = true;
    this.vMatrixChanged = true;
    this.vMatrixNewChanged = false;
    this.mMatrix.changed = true;
    this.vMatrix.changed = true;
    this.vMatrixNew.changed = false;
}

/**
   Writes a perspective view into internal perspective matrix
*/
GLmatrix.prototype.perspective = function(zoom, aRatio, zNear, zFar) {
    mat4.perspective(this.pMatrix, zoom, aRatio, zNear, zFar); 
}

/**
   Writes an orthogonal view into internal perspective matrix
*/
GLmatrix.prototype.ortho = function(left, right, bottom, top, near, far) {
    mat4.ortho(this.pMatrix, left, right, bottom, top, near, far); 
}

GLmatrix.prototype.modelInit = function() {
    mat4.identity(this.mMatrix);
}

GLmatrix.prototype.modelUpdate = function() {
    mat4.identity(this.mMatrix);
    mat4.translate(this.mMatrix,
		   this.mMatrix,
		   [positionX.val,-positionY.val,0]);
    mat4.rotate(
	this.mMatrix,
	this.mMatrix,
	rotateY.val * Math.PI/180,
	[this.r2, this.r2, 0]);
    this.mMatrixChanged = true;
}

GLmatrix.prototype.viewInit = function() {
    mat4.identity(this.vMatrix);
    mat4.identity(this.vMatrixNew);
}

GLmatrix.prototype.viewMaze = function() {
    this.vTranslate([20,2,9.0]);
    this.vRotate(Math.PI, [0, 1, 0]);
}

GLmatrix.prototype.viewStadium = function() {
    this.vTranslate([0,12.5,0]);
    this.vRotate(-Math.PI/4, [0, 1, 0]);
}

GLmatrix.prototype.translate = function(vector) {
    mat4.translate(this.mMatrix, this.mMatrix, vector); 
    this.mMatrixChanged = true;
}

GLmatrix.prototype.rotate = function(angle, vector) {
    mat4.rotate(this.mMatrix, this.mMatrix, angle, vector); 
    this.mMatrixChanged = true;
}

GLmatrix.prototype.vTranslate = function(vector) {
    mat4.translate(this.vMatrixNew,
		   this.vMatrixNew, 
		   vector); 
    this.vMatrixNewChanged = true;
}

GLmatrix.prototype.lightTranslate = function(vector) {
    mat4.translate(this.lightMatrix,
		   this.lightMatrix, 
		   vector); 
    this.lightMatrixChanged = true;
}

var transLightMatrix = mat4.create();

GLmatrix.prototype.lightRotate = function(x_change, y_change) {

    mat4.identity(transLightMatrix);
    mat4.rotate(
	transLightMatrix,
	transLightMatrix,
	y_change,
	[0, 1, 0]);
    mat4.rotate(transLightMatrix,
		transLightMatrix,
		x_change,
		[1, 0, 0]);
    mat4.multiply(this.lightMatrix, 
		  transLightMatrix,
		  this.lightMatrix);
    this.lightMatrixChanged = true;
}

GLmatrix.prototype.translateN = function(vector) {
    mat4.translate(this.mMatrix, 
		   this.mMatrix,
		   [-vector[0], 
		    -vector[1], 
		    -vector[2]]); 
    this.mMatrixChanged = true;
}

GLmatrix.prototype.rotate = function(rads, vector) {
    mat4.rotate(this.mMatrix, this.mMatrix, rads, vector);
    this.mMatrixChanged = true;
}

GLmatrix.prototype.vRotate = function(rads, vector) {
    mat4.rotate(this.vMatrixNew, this.vMatrixNew, rads, vector);
    this.vMatrixNewChanged = true;
}

GLmatrix.prototype.scale = function(vector) {
    mat4.scale(this.mMatrix, this.mMatrix, vector); 
    this.mMatrixChanged = true;
}
GLmatrix.prototype.mul = function(m) {
    mat4.multiply(this.mMatrix, this.mMatrix, m); 
    this.mMatrixChanged = true;
}

GLmatrix.prototype.vMul = function(v) {
    mat4.multiply(this.vMatrix, this.vMatrix, v); 
    this.vMatrixChanged = true;
}

GLmatrix.prototype.lookUp = function() {
    radiansToRotate = (lookDist * 2 * Math.PI)/10;
    rotateCount = 10;
    vectorRotation = [1,0,0];
}

GLmatrix.prototype.lookDown = function() {
    radiansToRotate = (lookDist * 2 * Math.PI)/10;
    rotateCount = 10;
    vectorRotation = [-1,0,0];
}

GLmatrix.prototype.lookLeft = function() {
    radiansToRotate = (lookDist * 2 * Math.PI)/10;
    rotateCount = 10;
    vectorRotation = [0,1,0];
}

GLmatrix.prototype.lookRight = function() {
    radiansToRotate = (lookDist * 2 * Math.PI)/10;
    rotateCount = 10;
    vectorRotation = [0,-1,0];
}

var moveDist = 2.1; //default to maze
var lookDist = 1/20; //default to maze

GLmatrix.prototype.moveRight = function() {
    distToMove = [-moveDist/10,0,0];
    moveCount = 10;
}

GLmatrix.prototype.moveLeft = function() {
    distToMove = [moveDist/10,0,0];
    moveCount = 10;
}

GLmatrix.prototype.moveUp = function() {
    distToMove = [0,moveDist/10,0];
    moveCount = 10;
}

GLmatrix.prototype.moveDown = function() {
    distToMove = [0,-moveDist/10,0];
    moveCount = 10;
}

GLmatrix.prototype.moveForward = function() {
    distToMove = [0,0,-moveDist/10];
    moveCount = 10;
}
GLmatrix.prototype.moveBack = function() {
    distToMove = [0,0,moveDist/10];
    moveCount = 10;
}

var moveCount = 0;
var distToMove = [0,0,0];
GLmatrix.prototype.gradualMove = function() {
    if(moveCount > 0) {
	this.vTranslate(distToMove);
	moveCount -= 1;
    }
}

var rotateCount = 0;
var radiansToRotate = 0; 
var vectorRotation = [0,0,0];
GLmatrix.prototype.gradualRotate = function() {
    if(rotateCount > 0) {
	this.vRotate(radiansToRotate, vectorRotation);
	rotateCount -= 1;
    }
}

GLmatrix.prototype.jump = function() {
    this.up3 = 2;
    this.up2 = 4;
    this.up1 = 7;
    this.dn1 = 7;
    this.dn2 = 4;
    this.dn3 = 2;
    this.inJump = true;
}

GLmatrix.prototype.newViewAllowed = function() {
    if(mazeMode)
	return myMaze.checkPosition();
    if(stadiumMode)
	return myStadium.checkPosition();
}

/**
 * Input: amount of time to go up for x squares.
 */
GLmatrix.prototype.update = function() {
    this.gradualMove();
    this.gradualRotate();
    const x = 0.1;
    if(this.inJump == false) {
	if(this.vMatrixNewChanged == false) { return; }
	if( priveledgedMode.val || this.newViewAllowed()){
	    // We only check the view if we are
	    //  not in 'god mode'

	    //Multiplies vMatrixNew * vMatrix
	    //therefore if vMatrixNew==identity we have no movement
	    this.vMul(this.vMatrixNew);
	    this.vMatrixChanged = true;
	}
	mat4.identity(this.vMatrixNew);
	return; 
    }
    if(this.up3-- >= 0) { this.vTranslate([0, 3*x, 0]); } 
    else {
    if(this.up2-- >= 0) { this.vTranslate([0, 2*x, 0]); }
    else {
      if(this.up1-- >= 0) { this.vTranslate([0, 1*x, 0]); }
	    else {
		if(this.dn1-- >= 0) { this.vTranslate([0,-1*x, 0]); }
		else {
		    if(this.dn2-- >= 0) { this.vTranslate([0,-2*x, 0]); }
		    else {
			if(this.dn3-- >= 0) { this.vTranslate([0,-3*x, 0]); }
			else { this.inJump = false; return; }
		    }}}}}
    this.vMul(this.vMatrixNew);
    mat4.identity(this.vMatrixNew);
    this.vMatrixChanged = true;
}

/**
 * Uniforms that are const over the lifetime
 *  of a shader only need to be set once.
*/
GLmatrix.prototype.setConstUniforms = function(gl_, shader_) {}

/**
 * View / model / normal ops I got from:
 http://www.songho.ca/opengl/gl_transform.html
*/
GLmatrix.prototype.setViewUniforms = function(gl_, shader_) {

    if (!this.vMatrixChanged) { return; }
    // models and lights are transformed by 
    //  inverse of viewing matrix
    var ilMatrix = mat4.create();
    mat4.invert(this.ivMatrix, this.vMatrix);

    gl_.uniformMatrix4fv(shader_.pMatU, 
			 false, this.pMatrix);
    gl_.uniformMatrix4fv(shader_.vMatU, 
			 false, this.ivMatrix);

    mat4.mul(ilMatrix, this.vMatrix, this.lightMatrix);
    gl_.uniformMatrix4fv(shader_.lMatU, 
			 false, ilMatrix);
    gl_.uniform3fv(shader_.lightPosU, 
		   lightPos);
    this.vMatrixChanged = false;
}


var nMatrix = mat4.create();   // normal
var mvMatrix = mat4.create();  // modelview

/**
 * Per-vertex uniforms must be set each time.
 */
GLmatrix.prototype.setVertexUniforms = function(gl_, shader_) {


    if (!this.mMatrixChanged) { return; }
    gl_.uniformMatrix4fv(shader_.mMatU, 
			 false, this.mMatrix);
    // perceived normals: (inverse of modelview
    //  transposed) * object normals
    mat4.mul(mvMatrix, this.ivMatrix, this.mMatrix);

    mat4.invert(nMatrix, mvMatrix);
    mat4.transpose(nMatrix, nMatrix);
    gl_.uniformMatrix4fv(shader_.nMatU, 
			 false, nMatrix);
    this.mMatrixChanged = false;
}

GLmatrix.prototype.push = function() {
    var copy = mat4.clone(this.mMatrix);
    this.mStack.push(copy);
}

GLmatrix.prototype.pop = function() {
    if (this.mStack.length == 0) {
        throw "Invalid pop"; }
    mat4.copy(this.mMatrix, this.mStack.pop());
    this.mMatrixChanged = true;
}
