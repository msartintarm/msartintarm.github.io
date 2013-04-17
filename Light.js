function Light() {
    colorVec = [0,0,0];
    this.o = new Sphere(-0.05)
	.translate(lightPos);
}

Light.prototype.initBuffers = function(gl_) {
    this.o.initBuffers(gl_);
}

Light.prototype.draw = function(gl_, shader_) {

    theMatrix.push();
    theMatrix.mul(theMatrix.vMatrix);
    theMatrix.mul(lightMatrix);
    this.o.draw(gl_, shader_);
    theMatrix.pop();
}
